import Link from "next/link";
import { notFound } from "next/navigation";
import { Panel, PortalHeading, TicketPill } from "@/components/portal-ui";
import { cx } from "@/components/ui";
import { formatDate } from "@/lib/billing";
import { db } from "@/lib/db";
import {
  departmentLabel,
  formatDateTime,
  priorityLabel,
} from "@/lib/portal-format";
import { StaffReplyForm } from "./staff-reply-form";

/**
 * One ticket thread, from the staff side.
 *
 * Unlike the portal version this is not scoped to a user — staff see every
 * ticket, including those opened by guests who have no account.
 */

export default async function AdminTicketDetailPage(
  props: PageProps<"/admin/tickets/[id]">,
) {
  const { id } = await props.params;

  const ticket = await db.ticket.findUnique({
    where: { id },
    include: {
      messages: { orderBy: { createdAt: "asc" } },
      user: {
        select: { id: true, name: true, email: true, clientRef: true, company: true },
      },
    },
  });

  if (!ticket) notFound();

  return (
    <div className="space-y-6">
      <PortalHeading
        title={ticket.subject}
        description={`${ticket.reference} · ${departmentLabel(ticket.department)} · ${priorityLabel(ticket.priority)} priority · Opened ${formatDate(ticket.createdAt)}`}
        action={
          <Link
            href="/admin/tickets"
            className="text-sm font-semibold text-signal-600 hover:underline"
          >
            ← All tickets
          </Link>
        }
      />

      <div className="flex flex-wrap items-center gap-3">
        <TicketPill status={ticket.status} />
        <span className="text-sm text-muted">
          Last updated {formatDate(ticket.updatedAt)}
        </span>
      </div>

      <Panel title="Raised By">
        <dl className="grid gap-x-6 gap-y-3.5 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
              Name
            </dt>
            <dd className="mt-1 text-sm">{ticket.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
              Email
            </dt>
            <dd className="mt-1 text-sm">
              <a
                href={`mailto:${ticket.email}`}
                className="transition hover:text-signal-600"
              >
                {ticket.email}
              </a>
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
              Account
            </dt>
            <dd className="mt-1 text-sm">
              {ticket.user ? (
                <Link
                  href={`/admin/clients/${ticket.user.id}`}
                  className="font-medium transition hover:text-signal-600"
                >
                  {ticket.user.clientRef}
                </Link>
              ) : (
                "Guest — no account"
              )}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
              Related service
            </dt>
            <dd className="mt-1 text-sm">{ticket.relatedService ?? "—"}</dd>
          </div>
        </dl>
      </Panel>

      <Panel padded={false}>
        <ul className="divide-y divide-line">
          {ticket.messages.map((message) => (
            <li
              key={message.id}
              className={cx("p-5", message.fromStaff && "bg-surface/60")}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={cx(
                      "flex size-8 items-center justify-center rounded-full text-xs font-bold",
                      message.fromStaff
                        ? "bg-navy-950 text-white"
                        : "bg-signal-100 text-signal-700 dark:bg-signal-500/20 dark:text-signal-300",
                    )}
                    aria-hidden
                  >
                    {message.author
                      .split(" ")
                      .map((w) => w[0])
                      .slice(0, 2)
                      .join("")}
                  </span>
                  <div>
                    <p className="text-sm font-semibold">{message.author}</p>
                    <p className="text-xs text-muted">
                      {message.fromStaff ? "Prevsol Digital" : "Client"}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted">
                  {formatDateTime(message.createdAt)}
                </p>
              </div>
              <p className="mt-3 text-sm leading-relaxed whitespace-pre-line">
                {message.body}
              </p>
            </li>
          ))}
        </ul>
      </Panel>

      <Panel title="Reply As Staff">
        <StaffReplyForm ticketId={ticket.id} status={ticket.status} />
      </Panel>
    </div>
  );
}
