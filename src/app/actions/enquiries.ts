"use server";

import { z } from "zod";
import { db } from "@/lib/db";
import {
  sendEnquiryAcknowledgement,
  sendEnquiryNotification,
  sendTicketConfirmation,
} from "@/lib/email";
import { nextTicketReference } from "@/lib/billing";
import { getCurrentUser } from "@/lib/auth";

/**
 * Contact, quote and support-ticket submissions.
 *
 * Every submission is written to the database FIRST, then emailed. If email
 * delivery fails the lead is still captured, and staff can find it in the
 * admin panel — a lost enquiry is a lost sale.
 */

export type ActionResult =
  | {
      ok: true;
      message: string;
      reference?: string;
      /** Never set on success; declared so callers can read it unconditionally. */
      fieldErrors?: undefined;
      error?: undefined;
    }
  | {
      ok: false;
      error: string;
      fieldErrors?: Record<string, string[]>;
      message?: undefined;
      reference?: undefined;
    };

const contactSchema = z.object({
  name: z.string().trim().min(2, "Please give your name.").max(120),
  company: z.string().trim().max(160).optional(),
  email: z.string().trim().email("That email address does not look right."),
  phone: z.string().trim().min(6, "Please give a contact number.").max(40),
  service: z.string().trim().max(80).optional(),
  subject: z.string().trim().min(2, "Please give a subject.").max(200),
  message: z.string().trim().min(5, "Please tell us a little more.").max(5000),
  /** Anti-spam honeypot — real users never fill this in. */
  website: z.string().max(0).optional(),
});

export async function submitContact(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = contactSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;
  if (data.website) {
    // Honeypot tripped. Pretend it worked so bots learn nothing.
    return { ok: true, message: "Thank you — we will be in touch." };
  }

  try {
    await db.enquiry.create({
      data: {
        kind: "CONTACT",
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        service: data.service,
        subject: data.subject,
        message: data.message,
      },
    });
  } catch (error) {
    console.error("[contact] could not save enquiry:", error);
    return {
      ok: false,
      error: "Something went wrong saving your message. Please call us instead.",
    };
  }

  // Email is best-effort — the enquiry is already safe in the database.
  await Promise.allSettled([
    sendEnquiryNotification({ kind: "CONTACT", ...data }),
    sendEnquiryAcknowledgement({ name: data.name, email: data.email }),
  ]);

  return {
    ok: true,
    message: "Thank you — we have your message and will reply within one business day.",
  };
}

const quoteSchema = z.object({
  name: z.string().trim().min(2, "Please give your name.").max(120),
  company: z.string().trim().max(160).optional(),
  email: z.string().trim().email("That email address does not look right."),
  phone: z.string().trim().min(6, "Please give a contact number.").max(40),
  service: z.string().trim().min(1, "Please choose a service.").max(80),
  budget: z.string().trim().max(80).optional(),
  timeline: z.string().trim().max(80).optional(),
  notes: z.string().trim().max(5000).optional(),
  /** JSON blob of the service-specific answers. */
  answers: z.string().max(20_000).optional(),
  website: z.string().max(0).optional(),
});

export async function submitQuote(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = quoteSchema.safeParse(Object.fromEntries(formData));

  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;
  if (data.website) return { ok: true, message: "Thank you — we will be in touch." };

  let answers: Record<string, unknown> = {};
  if (data.answers) {
    try {
      answers = JSON.parse(data.answers) as Record<string, unknown>;
    } catch {
      answers = {};
    }
  }

  try {
    await db.enquiry.create({
      data: {
        kind: "QUOTE",
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        service: data.service,
        message: data.notes,
        budget: data.budget,
        timeline: data.timeline,
        answers: answers as never,
      },
    });
  } catch (error) {
    console.error("[quote] could not save enquiry:", error);
    return {
      ok: false,
      error: "Something went wrong saving your request. Please call us instead.",
    };
  }

  await Promise.allSettled([
    sendEnquiryNotification({
      kind: "QUOTE",
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company,
      service: data.service,
      subject: `Quote request — ${data.service}`,
      message: data.notes,
      extra: { Budget: data.budget, Timeline: data.timeline, ...answers },
    }),
    sendEnquiryAcknowledgement({ name: data.name, email: data.email }),
  ]);

  return {
    ok: true,
    message:
      "Thank you — we will review your requirements and reply with a scoped proposal within two working days.",
  };
}

const ticketSchema = z.object({
  name: z.string().trim().min(2, "Please give your name.").max(120),
  email: z.string().trim().email("That email address does not look right."),
  department: z.enum(["TECHNICAL", "BILLING", "SALES"]),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
  subject: z.string().trim().min(2, "Please give a subject.").max(200),
  message: z.string().trim().min(5, "Please describe the problem.").max(10_000),
  relatedService: z.string().trim().max(160).optional(),
  website: z.string().max(0).optional(),
});

export async function submitTicket(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const raw = Object.fromEntries(formData);
  const parsed = ticketSchema.safeParse(raw);

  if (!parsed.success) {
    return {
      ok: false,
      error: "Please check the highlighted fields.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<string, string[]>,
    };
  }

  const data = parsed.data;
  if (data.website) return { ok: true, message: "Thank you — we will be in touch." };

  const user = await getCurrentUser();
  const reference = await nextTicketReference();

  try {
    await db.ticket.create({
      data: {
        reference,
        userId: user?.id,
        name: data.name,
        email: data.email,
        department: data.department,
        priority: data.priority,
        subject: data.subject,
        relatedService: data.relatedService || null,
        messages: {
          create: {
            fromStaff: false,
            author: data.name,
            body: data.message,
          },
        },
      },
    });
  } catch (error) {
    console.error("[ticket] could not save ticket:", error);
    return {
      ok: false,
      error: "Something went wrong logging your ticket. Please call us instead.",
    };
  }

  await sendTicketConfirmation({
    name: data.name,
    email: data.email,
    reference,
    subject: data.subject,
    priority: data.priority,
  });

  await sendEnquiryNotification({
    kind: "CONTACT",
    name: data.name,
    email: data.email,
    subject: `[${reference}] ${data.subject}`,
    service: data.department,
    message: data.message,
    extra: { Priority: data.priority, Service: data.relatedService },
  });

  return {
    ok: true,
    message: "Your ticket has been logged.",
    reference,
  };
}

const newsletterSchema = z.object({
  email: z.string().trim().email("That email address does not look right."),
});

export async function subscribeNewsletter(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const parsed = newsletterSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return { ok: false, error: "That email address does not look right." };
  }

  try {
    await db.enquiry.create({
      data: {
        kind: "NEWSLETTER",
        name: "Newsletter subscriber",
        email: parsed.data.email,
      },
    });
  } catch (error) {
    console.error("[newsletter] could not save subscriber:", error);
    return { ok: false, error: "Could not subscribe you just now." };
  }

  return { ok: true, message: "Thank you — you are subscribed." };
}
