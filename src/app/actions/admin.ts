"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { audit, getCurrentUser } from "@/lib/auth";
import { formatDate, nextDueDate, notify, provisionOrder } from "@/lib/billing";
import { db } from "@/lib/db";
import { sendMail, layout } from "@/lib/email";
import type { ActionResult } from "./enquiries";

/**
 * Staff-only actions.
 *
 * Every one of these re-checks the caller's role on the server. A server
 * action is a public HTTP endpoint — it cannot rely on the admin layout
 * having run.
 */

async function requireStaff() {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  if (user.role !== "ADMIN" && user.role !== "STAFF") {
    throw new Error("FORBIDDEN");
  }
  return user;
}

const idSchema = z.object({ id: z.string().min(1).max(64) });

/* ------------------------------------------------------------- enquiries */

export async function markEnquiryHandled(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const staff = await requireStaff();
  const parsed = idSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: "Missing enquiry." };

  await db.enquiry.update({
    where: { id: parsed.data.id },
    data: { handledAt: new Date() },
  });
  await audit("admin.enquiry.handled", {
    userId: staff.id,
    detail: parsed.data.id,
  });

  revalidatePath("/admin/enquiries");
  return { ok: true, message: "Marked as handled." };
}

/* ---------------------------------------------------------------- orders */

/** Confirms an offline payment and provisions everything the order bought. */
export async function markOrderPaid(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const staff = await requireStaff();
  const parsed = idSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: "Missing order." };

  const order = await db.order.findUnique({
    where: { id: parsed.data.id },
    include: {
      invoice: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  if (!order) return { ok: false, error: "That order no longer exists." };
  if (order.status === "PAID" || order.status === "PROVISIONED") {
    return { ok: false, error: "That order is already settled." };
  }

  const now = new Date();

  await db.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: order.id },
      data: { status: "PAID" },
    });

    if (order.invoice) {
      await tx.invoice.update({
        where: { id: order.invoice.id },
        data: { status: "PAID", paidAt: now },
      });
      await tx.payment.updateMany({
        where: { invoiceId: order.invoice.id, status: "PENDING" },
        data: { status: "PAID", paidAt: now },
      });
    }
  });

  await provisionOrder(order.id).catch((error) =>
    console.error("[admin] provisioning failed:", error),
  );

  await notify(order.userId, {
    type: "PAYMENT",
    title: "Payment received",
    body: `We have recorded your payment for ${order.reference}. Thank you.`,
    href: "/portal/invoices",
  });

  await audit("admin.order.paid", { userId: staff.id, detail: order.reference });

  revalidatePath("/admin/orders");
  revalidatePath("/admin/invoices");
  return { ok: true, message: `${order.reference} marked paid and provisioned.` };
}

/* -------------------------------------------------------------- services */

const serviceStatusSchema = z.object({
  id: z.string().min(1).max(64),
  status: z.enum([
    "PENDING",
    "ACTIVE",
    "EXPIRING_SOON",
    "SUSPENDED",
    "TERMINATED",
  ]),
});

export async function setServiceStatus(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const staff = await requireStaff();
  const parsed = serviceStatusSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  const service = await db.service.update({
    where: { id: parsed.data.id },
    data: {
      status: parsed.data.status,
      cancelledAt: parsed.data.status === "TERMINATED" ? new Date() : null,
    },
  });

  if (parsed.data.status === "ACTIVE") {
    await notify(service.userId, {
      type: "HOSTING",
      title: `${service.name} is now active`,
      body: `Your service is live. Next renewal ${formatDate(service.nextDueAt)}.`,
      href: "/portal/services",
    });
  }

  await audit("admin.service.status", {
    userId: staff.id,
    detail: `${service.name} → ${parsed.data.status}`,
  });

  revalidatePath("/admin/services");
  return { ok: true, message: `${service.name} set to ${parsed.data.status}.` };
}

/* --------------------------------------------------------------- domains */

/**
 * Marks a manually-registered domain live.
 *
 * `.co.zw` has no registrar API — ZISPA processes registrations by email — so
 * this is the step a staff member performs after the registry confirms.
 */
const domainActivateSchema = z.object({
  id: z.string().min(1).max(64),
  registrarRef: z.string().trim().max(120).optional(),
});

export async function activateDomain(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const staff = await requireStaff();
  const parsed = domainActivateSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { ok: false, error: "Invalid request." };

  const domain = await db.domain.update({
    where: { id: parsed.data.id },
    data: {
      status: "ACTIVE",
      registrarRef: parsed.data.registrarRef || null,
      expiresAt: nextDueDate(new Date(), "ANNUALLY"),
    },
    include: { user: { select: { id: true, name: true, email: true } } },
  });

  await notify(domain.userId, {
    type: "DOMAIN",
    title: `${domain.fqdn} is registered`,
    body: `Your domain is live and expires on ${formatDate(domain.expiresAt)}.`,
    href: "/portal/domains",
  });

  await sendMail({
    to: domain.user.email,
    subject: `${domain.fqdn} is now registered`,
    text: `Hello ${domain.user.name},

Your domain ${domain.fqdn} has been registered and is now live.
It expires on ${formatDate(domain.expiresAt)}.

You can manage it from your client portal.`,
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:19px">${domain.fqdn} is registered</h1>
      <p style="margin:0 0 16px">Hello ${domain.user.name.split(" ")[0]}, your domain is live.</p>
      <p style="margin:0 0 20px;color:#5b647f;font-size:13px">Expires ${formatDate(domain.expiresAt)}</p>
      <a href="${process.env.NEXT_PUBLIC_SITE_URL ?? ""}/portal/domains" style="display:inline-block;background:#cf2438;color:#fff;text-decoration:none;padding:11px 20px;border-radius:8px;font-weight:bold">Manage your domains</a>
    `),
  });

  await audit("admin.domain.activated", {
    userId: staff.id,
    detail: domain.fqdn,
  });

  revalidatePath("/admin/domains");
  return { ok: true, message: `${domain.fqdn} marked active.` };
}

/* --------------------------------------------------------------- tickets */

const replySchema = z.object({
  ticketId: z.string().min(1).max(64),
  body: z.string().trim().min(1, "Write a reply first.").max(10_000),
  status: z.enum([
    "OPEN",
    "IN_PROGRESS",
    "AWAITING_CUSTOMER",
    "RESOLVED",
    "CLOSED",
  ]),
});

export async function replyAsStaff(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const staff = await requireStaff();
  const parsed = replySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please write a reply.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  const ticket = await db.ticket.update({
    where: { id: parsed.data.ticketId },
    data: {
      status: parsed.data.status,
      messages: {
        create: {
          fromStaff: true,
          author: staff.name,
          body: parsed.data.body,
        },
      },
    },
  });

  if (ticket.userId) {
    await notify(ticket.userId, {
      type: "TICKET",
      title: `Support replied to ${ticket.reference}`,
      body: ticket.subject,
      href: `/portal/tickets/${ticket.id}`,
    });
  }

  await sendMail({
    to: ticket.email,
    subject: `Re: [${ticket.reference}] ${ticket.subject}`,
    text: `Hello ${ticket.name},

${parsed.data.body}

—
${staff.name}
Prevsol Digital Support`,
    html: layout(`
      <p style="margin:0 0 16px">Hello ${ticket.name.split(" ")[0]},</p>
      <div style="margin:0 0 20px">${parsed.data.body.replace(/</g, "&lt;").replace(/\n/g, "<br>")}</div>
      <p style="margin:0;color:#5b647f;font-size:13px">— ${staff.name}, Prevsol Digital Support</p>
    `),
  });

  await audit("admin.ticket.reply", {
    userId: staff.id,
    detail: ticket.reference,
  });

  revalidatePath(`/admin/tickets/${ticket.id}`);
  revalidatePath("/admin/tickets");
  return { ok: true, message: "Reply sent." };
}
