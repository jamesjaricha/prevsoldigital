"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import type { ActionResult } from "./enquiries";

/**
 * Portal mutations.
 *
 * Every action re-derives the user from the session and looks the target row
 * up by `{ id, userId }`, so a forged POST cannot reply to — or read the
 * existence of — another client's ticket or notification.
 */

const replySchema = z.object({
  ticketId: z.string().trim().min(1),
  body: z
    .string()
    .trim()
    .min(2, "Please write a reply before sending.")
    .max(10_000, "That reply is too long."),
});

export async function replyToTicket(
  _prev: ActionResult | null,
  formData: FormData,
): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "Please sign in again." };

  const parsed = replySchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return {
      ok: false,
      error: "Please write a reply before sending.",
      fieldErrors: z.flattenError(parsed.error).fieldErrors as Record<
        string,
        string[]
      >,
    };
  }

  const { ticketId, body } = parsed.data;

  // Ownership check — never trust the id from the form.
  const ticket = await db.ticket
    .findFirst({
      where: { id: ticketId, userId: user.id },
      select: { id: true, status: true },
    })
    .catch(() => null);

  if (!ticket) return { ok: false, error: "That ticket could not be found." };
  if (ticket.status === "CLOSED") {
    return { ok: false, error: "This ticket is closed. Please open a new one." };
  }

  try {
    await db.$transaction([
      db.ticketMessage.create({
        data: {
          ticketId: ticket.id,
          fromStaff: false,
          author: user.name,
          body,
        },
      }),
      db.ticket.update({
        where: { id: ticket.id },
        data: { status: "IN_PROGRESS" },
      }),
    ]);
  } catch (error) {
    console.error("[portal] could not save ticket reply:", error);
    return { ok: false, error: "Your reply could not be saved. Please try again." };
  }

  revalidatePath(`/portal/tickets/${ticket.id}`);
  revalidatePath("/portal/tickets");

  return { ok: true, message: "Your reply has been sent." };
}

/** Marks one notification read. Silently ignores ids the user does not own. */
export async function markNotificationRead(
  notificationId: string,
): Promise<void> {
  const user = await getCurrentUser();
  if (!user || typeof notificationId !== "string") return;

  await db.notification
    .updateMany({
      where: { id: notificationId, userId: user.id, readAt: null },
      data: { readAt: new Date() },
    })
    .catch((error: unknown) => {
      console.error("[portal] could not mark notification read:", error);
    });

  revalidatePath("/portal/notifications");
  revalidatePath("/portal");
}

/** Marks every unread notification on the account read. */
export async function markAllNotificationsRead(): Promise<void> {
  const user = await getCurrentUser();
  if (!user) return;

  await db.notification
    .updateMany({
      where: { userId: user.id, readAt: null },
      data: { readAt: new Date() },
    })
    .catch((error: unknown) => {
      console.error("[portal] could not mark notifications read:", error);
    });

  revalidatePath("/portal/notifications");
  revalidatePath("/portal");
}
