import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Panel, PortalHeading, TicketPill } from "@/components/portal-ui";
import { cx } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/billing";
import { db } from "@/lib/db";
import {
  departmentLabel,
  formatDateTime,
  priorityLabel,
} from "@/lib/portal-format";
import { TicketReplyForm } from "./reply-form";

export default async function TicketDetailPage(
  props: PageProps<"/portal/tickets/[id]">,
) {
  const { id } = await props.params;

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Scoped by userId — another client's ticket id must 404, not render.
  const ticket = await db.ticket.findFirst({
    where: { id, userId: user.id },
    include: { messages: { orderBy: { createdAt: "asc" } } },
  });

  if (!ticket) notFound();

  return (
    <div className="space-y-6">
      <PortalHeading
        title={ticket.subject}
        description={`${ticket.reference} · ${departmentLabel(ticket.department)} · ${priorityLabel(ticket.priority)} priority · Opened ${formatDate(ticket.createdAt)}`}
        action={
          <Link
            href="/portal/tickets"
            className="text-sm font-semibold text-signal-600 hover:underline"
          >
            ← All tickets
          </Link>
        }
      />

      <div className="flex items-center gap-3">
        <TicketPill status={ticket.status} />
        <span className="text-sm text-muted">
          Last updated {formatDate(ticket.updatedAt)}
        </span>
      </div>

      {/* Conversation */}
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
                      {message.fromStaff ? "Prevsol Digital" : "You"}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-muted">
                  {formatDateTime(message.createdAt)}
                </p>
              </div>
              <p className="mt-3 text-sm leading-relaxed">{message.body}</p>
            </li>
          ))}
        </ul>
      </Panel>

      {/* Reply */}
      {ticket.status !== "CLOSED" ? (
        <Panel title="Add a Reply">
          <TicketReplyForm ticketId={ticket.id} />
        </Panel>
      ) : (
        <Panel>
          <p className="text-sm text-muted">
            This ticket is closed.{" "}
            <Link
              href="/support/new"
              className="font-semibold text-signal-600 hover:underline"
            >
              Open a new ticket
            </Link>{" "}
            if you need further help.
          </p>
        </Panel>
      )}
    </div>
  );
}
