import "server-only";

import { db } from "./db";
import type { BillingCycle, ServiceType } from "@/generated/prisma/client";

/**
 * Money and billing helpers.
 *
 * All amounts are stored and computed in integer cents. Formatting to dollars
 * happens only at the display boundary.
 */

/** Zimbabwe VAT. */
export const TAX_RATE = 0.15;
/** Orders at or above this subtotal receive a volume discount. */
export const DISCOUNT_THRESHOLD_CENTS = 100_000;
export const DISCOUNT_RATE = 0.05;

export function money(cents: number) {
  return `$${(cents / 100).toLocaleString("en-US", {
    minimumFractionDigits: cents % 100 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  })}`;
}

export function computeTotals(
  items: { priceCents: number; quantity: number }[],
) {
  const subtotalCents = items.reduce(
    (sum, i) => sum + i.priceCents * i.quantity,
    0,
  );
  const discountCents =
    subtotalCents >= DISCOUNT_THRESHOLD_CENTS
      ? Math.round(subtotalCents * DISCOUNT_RATE)
      : 0;
  const taxCents = Math.round((subtotalCents - discountCents) * TAX_RATE);
  return {
    subtotalCents,
    discountCents,
    taxCents,
    totalCents: subtotalCents - discountCents + taxCents,
  };
}

/**
 * Human-readable references.
 *
 * These come from Postgres sequences, NOT from `count()`. Counting races:
 * two concurrent checkouts both read the same count and mint the same
 * reference. That matters because a payment is matched back to an invoice by
 * its reference — duplicate references would let one payment settle another
 * order's invoice. Sequences are atomic, so this cannot happen.
 *
 * The sequences are created by a migration; `START WITH` preserves the
 * original numbering.
 */

async function nextval(sequence: string): Promise<number> {
  const rows = await db.$queryRawUnsafe<{ nextval: bigint }[]>(
    `SELECT nextval('${sequence}') AS nextval`,
  );
  return Number(rows[0].nextval);
}

export async function nextOrderReference() {
  return `PVS-${await nextval("order_reference_seq")}`;
}

export async function nextInvoiceNumber() {
  const year = new Date().getFullYear();
  const n = await nextval("invoice_number_seq");
  return `INV-${year}-${n.toString().padStart(4, "0")}`;
}

export async function nextTicketReference() {
  return `#${await nextval("ticket_reference_seq")}`;
}

/** Maps a shop category onto the service type provisioned from it. */
export function serviceTypeFor(category: string | null): ServiceType {
  switch (category) {
    case "hosting":
      return "HOSTING";
    case "websites":
      return "WEBSITE";
    case "marketing":
      return "MARKETING";
    case "compliance":
      return "COMPLIANCE";
    case "software":
      return "SOFTWARE";
    default:
      return "OTHER";
  }
}

export function cycleFor(billingUnit: string | null): BillingCycle {
  if (billingUnit === "mo") return "MONTHLY";
  if (billingUnit === "yr") return "ANNUALLY";
  return "ONE_OFF";
}

/** Advances a date by one billing period. */
export function nextDueDate(from: Date, cycle: BillingCycle): Date {
  const next = new Date(from);
  if (cycle === "MONTHLY") next.setMonth(next.getMonth() + 1);
  else if (cycle === "ANNUALLY") next.setFullYear(next.getFullYear() + 1);
  else next.setFullYear(next.getFullYear() + 100); // one-off: effectively never
  return next;
}

/** Formats a date the way the portal displays it, e.g. "1 September 2026". */
export function formatDate(date: Date) {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/**
 * Provisions the services an order paid for, and records the domains that need
 * manual registration. Idempotent: safe to call again if a webhook repeats.
 */
export async function provisionOrder(orderId: string) {
  const order = await db.order.findUnique({
    where: { id: orderId },
    include: { items: { include: { product: true } } },
  });
  if (!order || order.status === "PROVISIONED") return;

  const now = new Date();

  for (const item of order.items) {
    // Domain line items look like "domain:example.co.zw".
    if (item.name.includes(".") && item.detail?.toLowerCase().includes("domain")) {
      const existing = await db.domain.findUnique({ where: { fqdn: item.name } });
      if (!existing) {
        await db.domain.create({
          data: {
            userId: order.userId,
            fqdn: item.name,
            status: "PENDING",
            expiresAt: nextDueDate(now, "ANNUALLY"),
          },
        });
      }
      continue;
    }

    const cycle = cycleFor(item.billingUnit);
    await db.service.create({
      data: {
        userId: order.userId,
        productId: item.productId,
        name: item.name,
        type: serviceTypeFor(item.product?.category ?? null),
        status: "PENDING",
        detail: item.detail,
        priceCents: item.priceCents,
        cycle,
        nextDueAt: nextDueDate(now, cycle),
      },
    });
  }

  await db.order.update({
    where: { id: orderId },
    data: { status: "PROVISIONED" },
  });
}

/** Creates a notification, used across payment, renewal and ticket flows. */
export async function notify(
  userId: string,
  input: {
    type:
      | "INVOICE"
      | "PAYMENT"
      | "DUE"
      | "DOMAIN"
      | "HOSTING"
      | "RENEWAL"
      | "SUSPENSION"
      | "TICKET"
      | "SECURITY";
    title: string;
    body: string;
    href?: string;
  },
) {
  return db.notification.create({ data: { userId, ...input } });
}
