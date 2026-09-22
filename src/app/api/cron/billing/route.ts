import { NextResponse } from "next/server";
import {
  computeTotals,
  formatDate,
  nextDueDate,
  nextInvoiceNumber,
  notify,
} from "@/lib/billing";
import { db } from "@/lib/db";
import { sendMail, layout } from "@/lib/email";
import { safeEqual } from "@/lib/auth";
import { brand } from "@/content/brand";

/**
 * Nightly billing job. Run once a day from cron:
 *
 *   0 2 * * * curl -fsS -H "Authorization: Bearer $CRON_SECRET" \
 *     https://prevsoldigital.com/api/cron/billing
 *
 * It: marks overdue invoices, flags services expiring within 30 days, raises
 * renewal invoices 14 days ahead, and warns about domains nearing expiry.
 * Every step is idempotent, so running it twice in a day changes nothing.
 */

export const dynamic = "force-dynamic";

function authorised(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = request.headers.get("authorization") ?? "";
  const token = header.replace(/^Bearer\s+/i, "");
  return token.length > 0 && safeEqual(token, secret);
}

export async function GET(request: Request) {
  if (!authorised(request)) {
    return NextResponse.json({ error: "Unauthorised" }, { status: 401 });
  }

  const now = new Date();
  const in14Days = new Date(now.getTime() + 14 * 86_400_000);
  const in30Days = new Date(now.getTime() + 30 * 86_400_000);

  const summary = {
    markedOverdue: 0,
    renewalInvoices: 0,
    expiringServices: 0,
    expiringDomains: 0,
    suspended: 0,
  };

  // --- 1. Overdue invoices ------------------------------------------------
  const overdue = await db.invoice.findMany({
    where: { status: "UNPAID", dueAt: { lt: now } },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  for (const invoice of overdue) {
    await db.invoice.update({
      where: { id: invoice.id },
      data: { status: "OVERDUE" },
    });
    await notify(invoice.userId, {
      type: "DUE",
      title: `Invoice ${invoice.number} is overdue`,
      body: `$${(invoice.totalCents / 100).toFixed(2)} was due on ${formatDate(invoice.dueAt)}.`,
      href: "/portal/invoices",
    });
    await sendMail({
      to: invoice.user.email,
      subject: `Invoice ${invoice.number} is overdue`,
      text: `Hello ${invoice.user.name},

Invoice ${invoice.number} for $${(invoice.totalCents / 100).toFixed(2)} was due on ${formatDate(invoice.dueAt)} and is now overdue.

Services linked to this invoice are suspended 7 days after the due date.

Pay online: ${process.env.NEXT_PUBLIC_SITE_URL ?? brand.url}/portal/invoices

${brand.name}`,
      html: layout(`
        <h1 style="margin:0 0 16px;font-size:19px">Invoice ${invoice.number} is overdue</h1>
        <p style="margin:0 0 16px">Hello ${invoice.user.name.split(" ")[0]}, this invoice was due on ${formatDate(invoice.dueAt)}.</p>
        <p style="margin:0 0 20px;font-size:22px;font-weight:bold">$${(invoice.totalCents / 100).toFixed(2)}</p>
        <p style="margin:0 0 20px;color:#5b647f;font-size:13px">Services linked to this invoice are suspended 7 days after the due date.</p>
        <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? brand.url}/portal/invoices" style="display:inline-block;background:#cf2438;color:#fff;text-decoration:none;padding:11px 20px;border-radius:8px;font-weight:bold">Pay now</a>
      `),
    });
    summary.markedOverdue++;
  }

  // --- 2. Suspend services 7 days past due --------------------------------
  const sevenDaysAgo = new Date(now.getTime() - 7 * 86_400_000);
  const toSuspend = await db.invoice.findMany({
    where: { status: "OVERDUE", dueAt: { lt: sevenDaysAgo } },
    select: { userId: true, number: true },
  });

  for (const invoice of toSuspend) {
    const result = await db.service.updateMany({
      where: { userId: invoice.userId, status: "ACTIVE" },
      data: { status: "SUSPENDED" },
    });
    if (result.count > 0) {
      await notify(invoice.userId, {
        type: "SUSPENSION",
        title: "Services suspended",
        body: `Suspended because invoice ${invoice.number} remains unpaid. Settle it to restore service.`,
        href: "/portal/invoices",
      });
      summary.suspended += result.count;
    }
  }

  // --- 3. Flag services expiring within 30 days ---------------------------
  const expiring = await db.service.updateMany({
    where: {
      status: "ACTIVE",
      nextDueAt: { gt: now, lte: in30Days },
      cycle: { not: "ONE_OFF" },
    },
    data: { status: "EXPIRING_SOON" },
  });
  summary.expiringServices = expiring.count;

  // --- 4. Raise renewal invoices 14 days ahead ----------------------------
  const dueForRenewal = await db.service.findMany({
    where: {
      status: { in: ["ACTIVE", "EXPIRING_SOON"] },
      cycle: { not: "ONE_OFF" },
      nextDueAt: { gt: now, lte: in14Days },
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  for (const service of dueForRenewal) {
    // Skip if an unpaid invoice already covers this renewal.
    const existing = await db.invoice.findFirst({
      where: {
        userId: service.userId,
        status: { in: ["UNPAID", "OVERDUE"] },
        items: { some: { description: { contains: service.name } } },
        issuedAt: { gt: new Date(now.getTime() - 20 * 86_400_000) },
      },
      select: { id: true },
    });
    if (existing) continue;

    // Use the same calculation as checkout, so a renewal never costs more
    // than buying the identical item today.
    const totals = computeTotals([
      { priceCents: service.priceCents, quantity: 1 },
    ]);

    const invoice = await db.invoice.create({
      data: {
        number: await nextInvoiceNumber(),
        userId: service.userId,
        status: "UNPAID",
        dueAt: service.nextDueAt,
        ...totals,
        items: {
          create: {
            description: `${service.name} — renewal to ${formatDate(nextDueDate(service.nextDueAt, service.cycle))}`,
            amountCents: service.priceCents,
          },
        },
      },
      select: { number: true, totalCents: true },
    });

    await notify(service.userId, {
      type: "RENEWAL",
      title: `Renewal invoice ${invoice.number}`,
      body: `${service.name} renews on ${formatDate(service.nextDueAt)}.`,
      href: "/portal/invoices",
    });
    summary.renewalInvoices++;
  }

  // --- 5. Domain expiry warnings -----------------------------------------
  const domains = await db.domain.findMany({
    where: { status: { in: ["ACTIVE", "EXPIRING_SOON"] }, expiresAt: { gt: now, lte: in30Days } },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  for (const domain of domains) {
    await db.domain.update({
      where: { id: domain.id },
      data: { status: "EXPIRING_SOON" },
    });
    const days = Math.ceil((domain.expiresAt.getTime() - now.getTime()) / 86_400_000);
    await notify(domain.userId, {
      type: "DOMAIN",
      title: `${domain.fqdn} expires in ${days} days`,
      body: domain.autoRenew
        ? `It will renew automatically on ${formatDate(domain.expiresAt)}.`
        : `Auto-renew is off. Renew before ${formatDate(domain.expiresAt)} to avoid losing it.`,
      href: "/portal/domains",
    });
    summary.expiringDomains++;
  }

  return NextResponse.json({ ok: true, ranAt: now.toISOString(), ...summary });
}
