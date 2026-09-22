import { NextResponse } from "next/server";
import { notify, provisionOrder } from "@/lib/billing";
import { db } from "@/lib/db";
import { sendPaymentReceipt } from "@/lib/email";
import { isSettled, pollPaymentStatus, verifyPaynowHash } from "@/lib/paynow";

/**
 * Paynow status callback (their "ResultUrl").
 *
 * Two defences against a forged callback:
 *  1. The hash is verified against our integration key.
 *  2. We independently poll Paynow rather than trusting the posted status.
 *
 * Always returns 200 — Paynow retries on non-200, and retrying will not fix a
 * bad payload. Problems are logged instead.
 */

export async function POST(request: Request) {
  const fields: Record<string, string> = {};

  try {
    const body = await request.text();
    const params = new URLSearchParams(body);
    for (const [key, value] of params) fields[key.toLowerCase()] = value;
  } catch (error) {
    console.error("[paynow] unreadable callback body:", error);
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  const reference = fields.reference;
  if (!reference) {
    console.warn("[paynow] callback with no reference");
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  // 1. The callback must be signed with our integration key.
  if (!verifyPaynowHash(fields)) {
    console.warn(`[paynow] callback for ${reference} failed hash verification`);
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  const payment = await db.payment.findFirst({
    where: { gatewayRef: reference },
    orderBy: { createdAt: "desc" },
    include: {
      invoice: { include: { order: true } },
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!payment) {
    console.warn(`[paynow] no payment found for reference ${reference}`);
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  // Already settled — Paynow retries, so this must be idempotent.
  if (payment.status === "PAID") {
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // 2. Never trust the posted status; confirm it with Paynow directly.
  //    Without a poll URL we cannot verify independently, so we refuse to
  //    settle rather than fall back to trusting the callback.
  if (!payment.pollUrl) {
    console.error(
      `[paynow] payment ${payment.id} has no poll URL — refusing to settle ${reference}`,
    );
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  const poll = await pollPaymentStatus(payment.pollUrl);
  if (!poll.ok) {
    console.error(`[paynow] poll failed for ${reference}: ${poll.error}`);
    return NextResponse.json({ ok: false }, { status: 200 });
  }

  // 3. The confirmed amount must match what we asked for. This stops a small
  //    payment being used to settle a larger invoice.
  if (poll.amount !== undefined) {
    const paidCents = Math.round(Number(poll.amount) * 100);
    if (!Number.isFinite(paidCents) || paidCents < payment.amountCents) {
      console.error(
        `[paynow] amount mismatch for ${reference}: paid ${paidCents}, expected ${payment.amountCents}`,
      );
      return NextResponse.json({ ok: false }, { status: 200 });
    }
  }

  const confirmedPaid = isSettled(poll.status);
  const status = fields.status?.toLowerCase() ?? "";

  if (!confirmedPaid) {
    if (status === "cancelled" || status === "failed") {
      await db.payment.update({
        where: { id: payment.id },
        data: { status: status === "cancelled" ? "CANCELLED" : "FAILED" },
      });
    }
    return NextResponse.json({ ok: true }, { status: 200 });
  }

  // ---- settle -------------------------------------------------------------
  const now = new Date();

  await db.$transaction([
    db.payment.update({
      where: { id: payment.id },
      data: { status: "PAID", paidAt: now },
    }),
    db.invoice.update({
      where: { id: payment.invoiceId },
      data: { status: "PAID", paidAt: now },
    }),
  ]);

  if (payment.invoice.orderId) {
    await db.order.update({
      where: { id: payment.invoice.orderId },
      data: { status: "PAID" },
    });
    await provisionOrder(payment.invoice.orderId).catch((error) =>
      console.error("[paynow] provisioning failed:", error),
    );
  }

  await notify(payment.userId, {
    type: "PAYMENT",
    title: "Payment received",
    body: `$${(payment.amountCents / 100).toFixed(2)} for ${payment.invoice.number}.`,
    href: "/portal/invoices",
  });

  await sendPaymentReceipt({
    name: payment.user.name,
    email: payment.user.email,
    invoiceNumber: payment.invoice.number,
    amountCents: payment.amountCents,
    method: payment.method.replace("PAYNOW_", "").toLowerCase(),
  });

  return NextResponse.json({ ok: true }, { status: 200 });
}

/** Paynow occasionally probes with GET; answer politely. */
export async function GET() {
  return NextResponse.json({ ok: true });
}
