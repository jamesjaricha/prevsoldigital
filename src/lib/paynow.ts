import "server-only";

import { createHash } from "node:crypto";

/**
 * Paynow Zimbabwe integration.
 *
 * Written directly against the documented HTTP interface rather than the npm
 * package, which was last published in January 2025 and ships no types.
 *
 * Hash scheme: concatenate every field value in order, excluding `hash`,
 * append the integration key in LOWERCASE, SHA-512, then UPPERCASE the digest.
 * Every inbound callback must be verified the same way before it is trusted.
 *
 * IMPORTANT: Paynow IP-whitelists merchant servers, so this only works from a
 * host with a static IP. That is why the app is deployed to a VPS rather than
 * a serverless platform.
 */

const INITIATE_URL = "https://www.paynow.co.zw/interface/initiatetransaction";
const REMOTE_URL = "https://www.paynow.co.zw/interface/remotetransaction";

export type PaynowMethod = "ecocash" | "onemoney" | "innbucks";

export function paynowConfigured() {
  return Boolean(
    process.env.PAYNOW_INTEGRATION_ID && process.env.PAYNOW_INTEGRATION_KEY,
  );
}

function integrationKey() {
  const key = process.env.PAYNOW_INTEGRATION_KEY;
  if (!key) throw new Error("PAYNOW_INTEGRATION_KEY is not set");
  return key;
}

/** Builds the Paynow hash over an ordered field map. */
export function paynowHash(fields: Record<string, string>, key = integrationKey()) {
  const concatenated =
    Object.entries(fields)
      .filter(([name]) => name.toLowerCase() !== "hash")
      .map(([, value]) => value)
      .join("") + key.toLowerCase();

  return createHash("sha512").update(concatenated, "utf8").digest("hex").toUpperCase();
}

/** Verifies a hash Paynow sent us. Constant-time on the digest comparison. */
export function verifyPaynowHash(fields: Record<string, string>) {
  const received = fields.hash ?? fields.Hash;
  if (!received) return false;
  const expected = paynowHash(fields);
  if (expected.length !== received.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i++) {
    diff |= expected.charCodeAt(i) ^ received.charCodeAt(i);
  }
  return diff === 0;
}

/** Paynow replies as a URL-encoded query string, not JSON. */
function parseResponse(body: string): Record<string, string> {
  const params = new URLSearchParams(body);
  const out: Record<string, string> = {};
  for (const [k, v] of params) out[k.toLowerCase()] = v;
  return out;
}

export type PaynowInitResult =
  | {
      ok: true;
      /** Where to send the customer (redirect flow). */
      redirectUrl?: string;
      /** Server-side URL used to confirm the final status. */
      pollUrl: string;
      /** Set for express mobile-money payments. */
      instructions?: string;
    }
  | { ok: false; error: string };

/**
 * Starts a payment.
 *
 * With `phone` and `method`, uses express checkout — the customer gets a
 * mobile-money prompt on their handset and never leaves the site. Without
 * them, returns a redirect URL to Paynow's hosted page.
 */
export async function initiatePayment(input: {
  reference: string;
  amountCents: number;
  email: string;
  /** Absolute URL Paynow POSTs status updates to. */
  resultUrl: string;
  /** Absolute URL the customer returns to. */
  returnUrl: string;
  phone?: string;
  method?: PaynowMethod;
}): Promise<PaynowInitResult> {
  if (!paynowConfigured()) {
    return { ok: false, error: "Paynow is not configured" };
  }

  const amount = (input.amountCents / 100).toFixed(2);
  const express = Boolean(input.phone && input.method);

  // Field ORDER matters — the hash is built over values in this sequence.
  const fields: Record<string, string> = {
    id: process.env.PAYNOW_INTEGRATION_ID!,
    reference: input.reference,
    amount,
    additionalinfo: `${input.reference} payment`,
    returnurl: input.returnUrl,
    resulturl: input.resultUrl,
    authemail: input.email,
    ...(express ? { phone: input.phone!, method: input.method! } : {}),
    status: "Message",
  };

  fields.hash = paynowHash(fields);

  try {
    const response = await fetch(express ? REMOTE_URL : INITIATE_URL, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(fields).toString(),
      // Paynow can be slow; fail rather than hang the request forever.
      signal: AbortSignal.timeout(20_000),
    });

    if (!response.ok) {
      return { ok: false, error: `Paynow returned HTTP ${response.status}` };
    }

    const data = parseResponse(await response.text());

    if (data.status?.toLowerCase() !== "ok") {
      return { ok: false, error: data.error || "Paynow rejected the request" };
    }

    // Paynow signs its own reply — verify before acting on it.
    if (data.hash && !verifyPaynowHash(data)) {
      return { ok: false, error: "Paynow response failed hash verification" };
    }

    if (!data.pollurl) {
      return { ok: false, error: "Paynow did not return a poll URL" };
    }

    return {
      ok: true,
      redirectUrl: data.browserurl ? decodeURIComponent(data.browserurl) : undefined,
      pollUrl: decodeURIComponent(data.pollurl),
      instructions: data.instructions
        ? decodeURIComponent(data.instructions)
        : undefined,
    };
  } catch (error) {
    return { ok: false, error: `Could not reach Paynow: ${String(error)}` };
  }
}

export type PaynowStatus =
  | "paid"
  | "awaiting delivery"
  | "delivered"
  | "created"
  | "sent"
  | "cancelled"
  | "disputed"
  | "refunded"
  | "unknown";

/** Statuses Paynow considers settled. */
export function isSettled(status: PaynowStatus) {
  return status === "paid" || status === "awaiting delivery" || status === "delivered";
}

/**
 * Asks Paynow for the current state of a transaction.
 *
 * Always confirm payment this way rather than trusting a callback alone —
 * callbacks can be spoofed, delayed or lost.
 */
export async function pollPaymentStatus(
  pollUrl: string,
): Promise<{ ok: true; status: PaynowStatus; reference?: string; amount?: string } | { ok: false; error: string }> {
  try {
    const response = await fetch(pollUrl, {
      method: "POST",
      signal: AbortSignal.timeout(20_000),
    });

    if (!response.ok) {
      return { ok: false, error: `Poll returned HTTP ${response.status}` };
    }

    const data = parseResponse(await response.text());

    if (data.hash && !verifyPaynowHash(data)) {
      return { ok: false, error: "Poll response failed hash verification" };
    }

    return {
      ok: true,
      status: (data.status?.toLowerCase() ?? "unknown") as PaynowStatus,
      reference: data.reference,
      amount: data.amount,
    };
  } catch (error) {
    return { ok: false, error: `Could not reach Paynow: ${String(error)}` };
  }
}

/** Normalises a Zimbabwean mobile number to the 07XXXXXXXX form Paynow expects. */
export function normaliseZwPhone(input: string): string | null {
  const digits = input.replace(/\D/g, "");
  const local = digits.startsWith("263")
    ? `0${digits.slice(3)}`
    : digits.startsWith("0")
      ? digits
      : `0${digits}`;
  return /^07[1378]\d{7}$/.test(local) ? local : null;
}

/** Infers the mobile-money network from the prefix. */
export function networkFor(phone: string): PaynowMethod | null {
  const local = normaliseZwPhone(phone);
  if (!local) return null;
  if (local.startsWith("077") || local.startsWith("078")) return "ecocash";
  if (local.startsWith("071")) return "onemoney";
  return null;
}
