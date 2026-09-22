/** Notification centre — requirements doc §17. */

import { redirect } from "next/navigation";
import {
  BellIcon,
  CardIcon,
  ClockIcon,
  GlobeIcon,
  LockIcon,
  ReceiptIcon,
  ServerIcon,
  TicketIcon,
} from "@/components/icons";
import { Panel, PortalHeading } from "@/components/portal-ui";
import { cx, EmptyState } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/billing";
import { db } from "@/lib/db";
import type { NotificationType } from "@/generated/prisma/client";
import {
  MarkAllReadButton,
  NotificationLink,
} from "./notification-actions";

const typeIcons: Record<NotificationType, typeof BellIcon> = {
  INVOICE: ReceiptIcon,
  PAYMENT: CardIcon,
  DUE: ClockIcon,
  DOMAIN: GlobeIcon,
  HOSTING: ServerIcon,
  RENEWAL: ClockIcon,
  SUSPENSION: BellIcon,
  TICKET: TicketIcon,
  SECURITY: LockIcon,
};

const typeTones: Record<NotificationType, string> = {
  INVOICE: "bg-navy-100 text-navy-700 dark:bg-navy-500/20 dark:text-navy-200",
  PAYMENT:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  DUE: "bg-signal-100 text-signal-700 dark:bg-signal-500/20 dark:text-signal-300",
  DOMAIN: "bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",
  HOSTING: "bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300",
  RENEWAL: "bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300",
  SUSPENSION:
    "bg-signal-100 text-signal-700 dark:bg-signal-500/20 dark:text-signal-300",
  TICKET: "bg-navy-100 text-navy-700 dark:bg-navy-500/20 dark:text-navy-200",
  SECURITY: "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
};

export default async function PortalNotificationsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const notifications = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const unreadCount = notifications.filter((n) => n.readAt === null).length;

  return (
    <div className="space-y-6">
      <PortalHeading
        title="Notifications"
        description={
          unreadCount
            ? `${unreadCount} unread ${unreadCount === 1 ? "notification" : "notifications"}`
            : "You're all caught up."
        }
        action={unreadCount > 0 ? <MarkAllReadButton /> : undefined}
      />

      {notifications.length === 0 ? (
        <EmptyState
          title="Nothing here yet"
          description="Invoices, payments, renewals and ticket updates will show up on this page."
        />
      ) : (
        <Panel padded={false}>
          <ul className="divide-y divide-line">
            {notifications.map((n) => {
              const Icon = typeIcons[n.type];
              const unread = n.readAt === null;
              return (
                <li key={n.id} className={cx(unread && "bg-surface/60")}>
                  <NotificationLink
                    id={n.id}
                    href={n.href ?? "/portal"}
                    className="flex items-start gap-4 p-5 transition hover:bg-surface"
                  >
                    <span
                      className={cx(
                        "inline-flex size-10 shrink-0 items-center justify-center rounded-xl",
                        typeTones[n.type],
                      )}
                    >
                      <Icon className="size-5" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-2">
                        <span className="font-semibold">{n.title}</span>
                        {unread && (
                          <span
                            className="size-2 shrink-0 rounded-full bg-signal-500"
                            aria-label="Unread"
                          />
                        )}
                      </span>
                      <span className="mt-1 block text-sm text-muted">
                        {n.body}
                      </span>
                      <span className="mt-1.5 block text-xs text-muted">
                        {formatDate(n.createdAt)}
                      </span>
                    </span>
                  </NotificationLink>
                </li>
              );
            })}
          </ul>
        </Panel>
      )}

      <Panel title="Notification Types">
        <p className="text-sm text-muted">
          We notify you about new invoices, payments received, invoices due or
          overdue, domain and hosting expiry, service renewals, suspension
          warnings, support ticket updates, and account or security events.
        </p>
      </Panel>
    </div>
  );
}
