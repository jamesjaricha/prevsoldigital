"use server";

import { z } from "zod";
import {
  computeTotals,
  nextInvoiceNumber,
  nextOrderReference,
  notify,
} from "@/lib/billing";
import { audit, getCurrentUser, hashPassword, nextClientRef } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendDomainRequestAlert, sendOrderConfirmation } from "@/lib/email";
import {
  initiatePayment,
  networkFor,
  normaliseZwPhone,
  paynowConfigured,
} from "@/lib/paynow";

/**
 * Checkout.
 *
 * Prices are re-read from the database rather than trusted from the browser —
 * the cart is client-side, so a hostile client could otherwise set its own
 * price. Line items not in the catalogue (domains) are validated against the
 * published TLD price list.
 */

const cartItemSchema = z.object({
  id: z.string().min(1).max(200),
  name: z.string().min(1).max(200),
  detail: z.string().max(300).optional(),
  quantity: z.number().int().min(1).max(99),
});

const checkoutSchema = z.object({
  name: z.string().trim().min(2, "Please give your name.").max(120),
  company: z.string().trim().max(160).optional(),
  email: z.string().trim().toLowerCase().email("Enter a valid email address."),
  phone: z.string().trim().min(6, "Please give a contact number.").max(40),
  address: z.string().trim().max(240).optional(),
  city: z.string().trim().max(120).optional(),
  notes: z.string().trim().max(2000).optional(),
  method: z.enum([
    "PAYNOW_ECOCASH",
    "PAYNOW_ONEMONEY",
    "PAYNOW_CARD",
    "BANK_TRANSFER",
    "CASH",
  ]),
  /** Mobile-money number, required for the express Paynow flow. */
  payPhone: z.string().trim().max(40).optional(),
  items: z.string().min(2),
});

export type CheckoutResult =
  | {
      ok: true;
      reference: string;
      invoiceNumber: string;
      /** Where to send the customer to complete a card payment. */
      redirectUrl?: string;
      /** On-screen instructions for a mobile-money prompt. */
      instructions?: string;
      /** True when payment is arranged offline. */
      manual: boolean;
    }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export async function placeOrder(
  _prev: CheckoutResult | null,
  formData: FormData,
): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;

  // ---- validate the cart -------------------------------------------------
  let rawItems: unknown;
  try {
    rawItems = JSON.parse(data.items);
  } catch {
    return { ok: false, error: "Your cart could not be read. Please try again." };
  }

  const itemsParsed = z.array(cartItemSchema).min(1).max(50).safeParse(rawItems);
  if (!itemsParsed.success) {
    return { ok: false, error: "Your cart is empty or invalid." };
  }

  // Re-price every line server-side.
  const { tlds } = await import("@/content/hosting");
  const priced: {
    productId: string | null;
    name: string;
    detail: string | null;
    priceCents: number;
    billingUnit: string | null;
    quantity: number;
    isDomain: boolean;
  }[] = [];

  for (const item of itemsParsed.data) {
    if (item.id.startsWith("domain:")) {
      const fqdn = item.id.slice("domain:".length).toLowerCase();
      const tld = tlds
        .slice()
        .sort((a, b) => b.ext.length - a.ext.length)
        .find((t) => fqdn.endsWith(t.ext));

      if (!tld || !/^[a-z0-9-]+\.[a-z.]+$/.test(fqdn)) {
        return { ok: false, error: `We cannot register ${fqdn}.` };
      }

      priced.push({
        productId: null,
        name: fqdn,
        detail: `Domain registration · 1 year · renews at $${tld.renew}/yr`,
        priceCents: tld.register * 100,
        billingUnit: "yr",
        quantity: item.quantity,
        isDomain: true,
      });
      continue;
    }

    const product = await db.product.findUnique({ where: { slug: item.id } });
    if (!product || !product.active) {
      return { ok: false, error: `"${item.name}" is no longer available.` };
    }

    priced.push({
      productId: product.id,
      name: product.name,
      detail: product.billingUnit
        ? `Billed ${product.billingUnit === "mo" ? "monthly" : "annually"}`
        : "One-off",
      priceCents: product.priceCents,
      billingUnit: product.billingUnit,
      quantity: item.quantity,
      isDomain: false,
    });
  }

  const totals = computeTotals(priced);

  // ---- find or create the customer --------------------------------------
  const user = await getCurrentUser();
  let userId: string;

  if (user) {
    userId = user.id;
  } else {
    const existing = await db.user.findUnique({
      where: { email: data.email },
      select: { id: true },
    });

    if (existing) {
      // The address already belongs to an account. Attaching the order to it
      // would let anyone write invoices and services into a stranger's portal
      // just by knowing their email, so require them to sign in instead.
      return {
        ok: false,
        error:
          "An account already exists for that email address. Please sign in to complete this order.",
        fieldErrors: { email: ["Sign in to continue with this address."] },
      };
    } else {
      // Create a shell account so the client can be invoiced and can later
      // claim it via password reset. No usable password is set.
      const { randomBytes } = await import("node:crypto");
      const created = await db.user.create({
        data: {
          email: data.email,
          passwordHash: await hashPassword(randomBytes(32).toString("hex")),
          name: data.name,
          phone: data.phone,
          company: data.company || null,
          address: data.address || null,
          city: data.city || null,
          clientRef: await nextClientRef(),
        },
        select: { id: true },
      });
      userId = created.id;
    }
  }

  // ---- persist the order and its invoice ---------------------------------
  const reference = await nextOrderReference();
  const invoiceNumber = await nextInvoiceNumber();
  const dueAt = new Date(Date.now() + 14 * 86_400_000);

  let orderId: string;
  let invoiceId: string;

  try {
    const order = await db.order.create({
      data: {
        reference,
        userId,
        billingName: data.name,
        billingEmail: data.email,
        billingPhone: data.phone,
        billingCompany: data.company || null,
        billingAddress: data.address || null,
        billingCity: data.city || null,
        notes: data.notes || null,
        ...totals,
        items: {
          create: priced.map((p) => ({
            productId: p.productId,
            name: p.name,
            detail: p.detail,
            priceCents: p.priceCents,
            billingUnit: p.billingUnit,
            quantity: p.quantity,
          })),
        },
      },
      select: { id: true },
    });
    orderId = order.id;

    const invoice = await db.invoice.create({
      data: {
        number: invoiceNumber,
        userId,
        orderId,
        status: "UNPAID",
        dueAt,
        ...totals,
        items: {
          create: priced.map((p) => ({
            description:
              p.quantity > 1 ? `${p.name} × ${p.quantity}` : p.name,
            amountCents: p.priceCents * p.quantity,
            quantity: p.quantity,
          })),
        },
      },
      select: { id: true },
    });
    invoiceId = invoice.id;
  } catch (error) {
    console.error("[checkout] could not save order:", error);
    return {
      ok: false,
      error: "We could not record your order. Please try again or call us.",
    };
  }

  await audit("order.placed", { userId, detail: reference });

  await notify(userId, {
    type: "INVOICE",
    title: `New invoice ${invoiceNumber}`,
    body: `$${(totals.totalCents / 100).toFixed(2)} due ${dueAt.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}.`,
    href: `/portal/invoices`,
  });

  // Alert staff about anything needing manual registration.
  for (const item of priced.filter((p) => p.isDomain)) {
    await sendDomainRequestAlert({
      fqdn: item.name,
      clientName: data.name,
      clientEmail: data.email,
      orderReference: reference,
    });
  }

  await sendOrderConfirmation({
    name: data.name,
    email: data.email,
    reference,
    invoiceNumber,
    totalCents: totals.totalCents,
    items: priced.map((p) => ({
      name: p.name,
      quantity: p.quantity,
      priceCents: p.priceCents,
    })),
  });

  // ---- payment -----------------------------------------------------------
  const offline = data.method === "BANK_TRANSFER" || data.method === "CASH";

  // On the demo deployment no payment is ever initiated, whatever the
  // customer selected. The order and invoice are still created so the flow can
  // be seen end to end.
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  if (demoMode || offline || !paynowConfigured()) {
    await db.payment.create({
      data: {
        invoiceId,
        userId,
        method: data.method,
        status: "PENDING",
        amountCents: totals.totalCents,
      },
    });
    return { ok: true, reference, invoiceNumber, manual: true };
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const isMobileMoney =
    data.method === "PAYNOW_ECOCASH" || data.method === "PAYNOW_ONEMONEY";

  let phone: string | undefined;
  if (isMobileMoney) {
    const normalised = data.payPhone ? normaliseZwPhone(data.payPhone) : null;
    if (!normalised) {
      return {
        ok: false,
        error: "Enter the mobile number to charge, e.g. 0771234567.",
        fieldErrors: { payPhone: ["That does not look like a Zimbabwean mobile number."] },
      };
    }
    phone = normalised;
  }

  const payment = await db.payment.create({
    data: {
      invoiceId,
      userId,
      method: data.method,
      status: "PENDING",
      amountCents: totals.totalCents,
    },
    select: { id: true },
  });

  const result = await initiatePayment({
    reference,
    amountCents: totals.totalCents,
    email: data.email,
    resultUrl: `${site}/api/paynow/callback`,
    returnUrl: `${site}/checkout/complete?ref=${encodeURIComponent(reference)}`,
    phone,
    method: phone ? (networkFor(phone) ?? undefined) : undefined,
  });

  if (!result.ok) {
    // Payment could not start, but the order and invoice exist — the client
    // can still pay from the portal, so this is not a hard failure.
    console.error("[checkout] Paynow init failed:", result.error);
    return {
      ok: true,
      reference,
      invoiceNumber,
      manual: true,
    };
  }

  await db.payment.update({
    where: { id: payment.id },
    data: { pollUrl: result.pollUrl, gatewayRef: reference },
  });

  return {
    ok: true,
    reference,
    invoiceNumber,
    redirectUrl: result.redirectUrl,
    instructions: result.instructions,
    manual: false,
  };
}
