import "server-only";

import { brand } from "@/content/brand";

/**
 * Transactional email over SMTP.
 *
 * Deliberately provider-agnostic: ZeptoMail, Brevo, Resend, Postmark and SES
 * all speak SMTP, so switching provider is an environment-variable change
 * rather than a code change. Set SMTP_* in .env.
 *
 * If SMTP is not configured, messages are logged instead of sent and the app
 * keeps working — useful in development and during first deployment.
 */

type Mail = {
  to: string | string[];
  subject: string;
  /** Plain-text body. Always provide one; HTML is optional. */
  text: string;
  html?: string;
  replyTo?: string;
};

const smtpConfigured = Boolean(
  process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD,
);

export async function sendMail(mail: Mail): Promise<{ sent: boolean; error?: string }> {
  const to = Array.isArray(mail.to) ? mail.to : [mail.to];

  if (!smtpConfigured) {
    console.info(
      `[email] SMTP not configured — would have sent "${mail.subject}" to ${to.join(", ")}`,
    );
    return { sent: false, error: "SMTP not configured" };
  }

  try {
    // Imported lazily so the app runs without nodemailer installed.
    const nodemailer = await import("nodemailer");
    const transport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: Number(process.env.SMTP_PORT ?? 587) === 465,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transport.sendMail({
      from: process.env.EMAIL_FROM ?? `${brand.name} <noreply@${brand.domain}>`,
      to,
      subject: mail.subject,
      text: mail.text,
      html: mail.html ?? textToHtml(mail.text),
      replyTo: mail.replyTo,
    });

    return { sent: true };
  } catch (error) {
    // Never let a mail failure break the user's request — the submission is
    // already persisted, and this is logged for follow-up.
    console.error("[email] send failed:", error);
    return { sent: false, error: String(error) };
  }
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function textToHtml(text: string) {
  return layout(
    escapeHtml(text)
      .split("\n\n")
      .map((p) => `<p style="margin:0 0 16px">${p.replace(/\n/g, "<br>")}</p>`)
      .join(""),
  );
}

/** Branded HTML wrapper, using inline styles for email-client support. */
export function layout(body: string) {
  return `<!doctype html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f2f4fa;font-family:Arial,Helvetica,sans-serif;color:#12163a">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f2f4fa;padding:24px 12px">
    <tr><td align="center">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden">
        <tr>
          <td style="background:#1a1f47;padding:20px 28px">
            <span style="color:#ffffff;font-size:20px;font-weight:bold;letter-spacing:.5px">PREVSOL</span>
            <span style="color:#cf2438;font-size:12px;font-weight:bold;letter-spacing:3px;margin-left:8px">DIGITAL</span>
          </td>
        </tr>
        <tr><td style="padding:28px;font-size:15px;line-height:1.6">${body}</td></tr>
        <tr>
          <td style="background:#f2f4fa;padding:18px 28px;font-size:12px;color:#5b647f;line-height:1.6">
            ${brand.name} · ${brand.address}, ${brand.city}, ${brand.country}<br>
            <a href="tel:${brand.phone.replace(/\s/g, "")}" style="color:#5b647f">${brand.phone}</a> ·
            <a href="mailto:${brand.email}" style="color:#5b647f">${brand.email}</a>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

const site = () => process.env.NEXT_PUBLIC_SITE_URL ?? brand.url;
const salesInbox = () => process.env.EMAIL_TO ?? brand.email;

/* ------------------------------------------------------------- templates */

export async function sendEnquiryNotification(input: {
  kind: "CONTACT" | "QUOTE";
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  service?: string | null;
  subject?: string | null;
  message?: string | null;
  extra?: Record<string, unknown>;
}) {
  const label = input.kind === "QUOTE" ? "Quote request" : "Contact enquiry";
  const rows = [
    ["Name", input.name],
    ["Email", input.email],
    ["Phone", input.phone],
    ["Company", input.company],
    ["Service", input.service],
    ["Subject", input.subject],
  ].filter(([, value]) => value) as [string, string][];

  const extraRows = Object.entries(input.extra ?? {})
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(
      ([k, v]) =>
        [k, Array.isArray(v) ? v.join(", ") : String(v)] as [string, string],
    );

  const all = [...rows, ...extraRows];

  return sendMail({
    to: salesInbox(),
    replyTo: input.email,
    subject: `${label}: ${input.subject ?? input.service ?? input.name}`,
    text: [
      `New ${label.toLowerCase()} from ${brand.url}`,
      "",
      ...all.map(([k, v]) => `${k}: ${v}`),
      "",
      input.message ? `Message:\n${input.message}` : "",
    ].join("\n"),
    html: layout(`
      <h1 style="margin:0 0 4px;font-size:19px">New ${label.toLowerCase()}</h1>
      <p style="margin:0 0 20px;color:#5b647f;font-size:13px">Submitted via ${escapeHtml(site())}</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px">
        ${all
          .map(
            ([k, v]) =>
              `<tr>
                 <td style="padding:6px 12px 6px 0;color:#5b647f;white-space:nowrap;vertical-align:top">${escapeHtml(k)}</td>
                 <td style="padding:6px 0"><strong>${escapeHtml(v)}</strong></td>
               </tr>`,
          )
          .join("")}
      </table>
      ${
        input.message
          ? `<div style="margin-top:20px;padding:16px;background:#f2f4fa;border-radius:8px">
               <div style="color:#5b647f;font-size:12px;margin-bottom:6px">MESSAGE</div>
               ${escapeHtml(input.message).replace(/\n/g, "<br>")}
             </div>`
          : ""
      }
    `),
  });
}

export async function sendEnquiryAcknowledgement(input: {
  name: string;
  email: string;
}) {
  return sendMail({
    to: input.email,
    subject: `We have your enquiry — ${brand.name}`,
    text: `Hello ${input.name},

Thank you for getting in touch with ${brand.name}. We have received your enquiry and a member of our team will reply within one business day.

If it is urgent, call us on ${brand.phone} during business hours (${brand.hours}).

${brand.name}
${brand.url}`,
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:19px">Thank you, ${escapeHtml(input.name.split(" ")[0])}</h1>
      <p style="margin:0 0 16px">We have received your enquiry and a member of our team will reply within one business day.</p>
      <p style="margin:0 0 16px">If it is urgent, call us on <a href="tel:${brand.phone.replace(/\s/g, "")}" style="color:#cf2438">${brand.phone}</a> during business hours.</p>
      <p style="margin:0;color:#5b647f;font-size:13px">${escapeHtml(brand.hours)}</p>
    `),
  });
}

export async function sendTicketConfirmation(input: {
  name: string;
  email: string;
  reference: string;
  subject: string;
  priority: string;
}) {
  const sla =
    input.priority === "HIGH"
      ? "High priority tickets are answered within two business hours."
      : "We aim to respond within one business day.";

  return sendMail({
    to: input.email,
    subject: `[${input.reference}] ${input.subject}`,
    text: `Hello ${input.name},

We have received your support request and logged it as ${input.reference}.

Subject: ${input.subject}
${sla}

You can track this ticket in your client portal:
${site()}/portal/tickets

${brand.name}`,
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:19px">Ticket ${escapeHtml(input.reference)} received</h1>
      <p style="margin:0 0 16px">Hello ${escapeHtml(input.name.split(" ")[0])}, we have logged your request.</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;margin-bottom:16px">
        <tr><td style="padding:6px 12px 6px 0;color:#5b647f">Reference</td><td><strong>${escapeHtml(input.reference)}</strong></td></tr>
        <tr><td style="padding:6px 12px 6px 0;color:#5b647f">Subject</td><td><strong>${escapeHtml(input.subject)}</strong></td></tr>
      </table>
      <p style="margin:0 0 20px">${escapeHtml(sla)}</p>
      <a href="${site()}/portal/tickets" style="display:inline-block;background:#cf2438;color:#fff;text-decoration:none;padding:11px 20px;border-radius:8px;font-weight:bold">Track this ticket</a>
    `),
  });
}

export async function sendPasswordReset(input: {
  name: string;
  email: string;
  token: string;
}) {
  const url = `${site()}/reset-password?token=${encodeURIComponent(input.token)}`;
  return sendMail({
    to: input.email,
    subject: `Reset your ${brand.name} password`,
    text: `Hello ${input.name},

Someone asked to reset the password on your ${brand.name} account.

Open this link to choose a new one. It expires in one hour:
${url}

If this was not you, ignore this email — your password has not changed.`,
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:19px">Reset your password</h1>
      <p style="margin:0 0 16px">Hello ${escapeHtml(input.name.split(" ")[0])}, someone asked to reset the password on your account.</p>
      <p style="margin:0 0 20px">This link expires in one hour.</p>
      <a href="${url}" style="display:inline-block;background:#cf2438;color:#fff;text-decoration:none;padding:11px 20px;border-radius:8px;font-weight:bold">Choose a new password</a>
      <p style="margin:20px 0 0;color:#5b647f;font-size:13px">If this was not you, ignore this email — your password has not changed.</p>
    `),
  });
}

export async function sendWelcome(input: { name: string; email: string; clientRef: string }) {
  return sendMail({
    to: input.email,
    subject: `Welcome to ${brand.name}`,
    text: `Hello ${input.name},

Your ${brand.name} account is ready. Your client reference is ${input.clientRef}.

Sign in to manage your services, invoices and support tickets:
${site()}/portal

${brand.name}`,
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:19px">Welcome to ${escapeHtml(brand.name)}</h1>
      <p style="margin:0 0 16px">Hello ${escapeHtml(input.name.split(" ")[0])}, your account is ready.</p>
      <p style="margin:0 0 20px">Your client reference is <strong>${escapeHtml(input.clientRef)}</strong>.</p>
      <a href="${site()}/portal" style="display:inline-block;background:#cf2438;color:#fff;text-decoration:none;padding:11px 20px;border-radius:8px;font-weight:bold">Go to your portal</a>
    `),
  });
}

export async function sendOrderConfirmation(input: {
  name: string;
  email: string;
  reference: string;
  invoiceNumber: string;
  totalCents: number;
  items: { name: string; quantity: number; priceCents: number }[];
}) {
  const money = (cents: number) => `$${(cents / 100).toFixed(2)}`;

  return sendMail({
    to: input.email,
    subject: `Order ${input.reference} received — ${brand.name}`,
    text: `Hello ${input.name},

Thank you for your order ${input.reference}.

${input.items.map((i) => `  ${i.quantity} × ${i.name} — ${money(i.priceCents * i.quantity)}`).join("\n")}

Total: ${money(input.totalCents)}
Invoice: ${input.invoiceNumber}

View and pay your invoice:
${site()}/portal/invoices

${brand.name}`,
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:19px">Order ${escapeHtml(input.reference)} received</h1>
      <p style="margin:0 0 20px">Thank you, ${escapeHtml(input.name.split(" ")[0])}. Here is what we have for you.</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;border-collapse:collapse">
        ${input.items
          .map(
            (i) =>
              `<tr>
                 <td style="padding:8px 0;border-bottom:1px solid #e2e7f3">${escapeHtml(i.name)}${i.quantity > 1 ? ` × ${i.quantity}` : ""}</td>
                 <td style="padding:8px 0;border-bottom:1px solid #e2e7f3;text-align:right">${money(i.priceCents * i.quantity)}</td>
               </tr>`,
          )
          .join("")}
        <tr>
          <td style="padding:12px 0;font-weight:bold">Total</td>
          <td style="padding:12px 0;text-align:right;font-weight:bold;font-size:17px">${money(input.totalCents)}</td>
        </tr>
      </table>
      <p style="margin:16px 0 20px;color:#5b647f;font-size:13px">Invoice ${escapeHtml(input.invoiceNumber)}</p>
      <a href="${site()}/portal/invoices" style="display:inline-block;background:#cf2438;color:#fff;text-decoration:none;padding:11px 20px;border-radius:8px;font-weight:bold">View and pay invoice</a>
    `),
  });
}

export async function sendPaymentReceipt(input: {
  name: string;
  email: string;
  invoiceNumber: string;
  amountCents: number;
  method: string;
}) {
  const amount = `$${(input.amountCents / 100).toFixed(2)}`;
  return sendMail({
    to: input.email,
    subject: `Payment received for ${input.invoiceNumber}`,
    text: `Hello ${input.name},

We have received your payment of ${amount} for invoice ${input.invoiceNumber} via ${input.method}.

Thank you.

${brand.name}`,
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:19px">Payment received</h1>
      <p style="margin:0 0 16px">Thank you, ${escapeHtml(input.name.split(" ")[0])}.</p>
      <p style="margin:0 0 20px">We have received <strong>${amount}</strong> for invoice <strong>${escapeHtml(input.invoiceNumber)}</strong> via ${escapeHtml(input.method)}.</p>
      <a href="${site()}/portal/invoices" style="display:inline-block;background:#cf2438;color:#fff;text-decoration:none;padding:11px 20px;border-radius:8px;font-weight:bold">View your invoices</a>
    `),
  });
}

/** Alerts staff that a .co.zw domain needs manual registration via ZISPA. */
export async function sendDomainRequestAlert(input: {
  fqdn: string;
  clientName: string;
  clientEmail: string;
  orderReference: string;
}) {
  return sendMail({
    to: salesInbox(),
    subject: `ACTION: register ${input.fqdn} with ZISPA`,
    text: `A client has ordered ${input.fqdn}, which cannot be registered automatically.

Client: ${input.clientName} (${input.clientEmail})
Order:  ${input.orderReference}

ZISPA processes .co.zw registrations by email to admin@zispa.org.zw, usually
within one working day. Register the domain in the CLIENT's name to keep the
resident rate, then mark it active in the admin panel.`,
    html: layout(`
      <h1 style="margin:0 0 16px;font-size:19px">Manual domain registration needed</h1>
      <p style="margin:0 0 16px"><strong>${escapeHtml(input.fqdn)}</strong> has been ordered and cannot be registered automatically.</p>
      <table role="presentation" cellpadding="0" cellspacing="0" style="width:100%;font-size:14px;margin-bottom:16px">
        <tr><td style="padding:6px 12px 6px 0;color:#5b647f">Client</td><td><strong>${escapeHtml(input.clientName)}</strong></td></tr>
        <tr><td style="padding:6px 12px 6px 0;color:#5b647f">Email</td><td>${escapeHtml(input.clientEmail)}</td></tr>
        <tr><td style="padding:6px 12px 6px 0;color:#5b647f">Order</td><td>${escapeHtml(input.orderReference)}</td></tr>
      </table>
      <p style="margin:0;padding:14px;background:#f2f4fa;border-radius:8px;font-size:13px">
        ZISPA processes .co.zw registrations by email to admin@zispa.org.zw, usually within
        one working day. Register in the <strong>client's</strong> name to keep the resident rate.
      </p>
    `),
  });
}
