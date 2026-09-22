import Link from "next/link";
import { redirect } from "next/navigation";
import { Panel, PortalHeading, TicketPill } from "@/components/portal-ui";
import { ButtonLink } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { formatDate } from "@/lib/billing";
import { db } from "@/lib/db";
import { departmentLabel, priorityLabel } from "@/lib/portal-format";

export default async function PortalTicketsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [open, closed] = await Promise.all([
    db.ticket.findMany({
      where: { userId: user.id, status: { notIn: ["CLOSED", "RESOLVED"] } },
      orderBy: { updatedAt: "desc" },
    }),
    db.ticket.findMany({
      where: { userId: user.id, status: { in: ["CLOSED", "RESOLVED"] } },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PortalHeading
        title="Support Tickets"
        description="Track everything you've raised with our team."
        action={
          <ButtonLink href="/support/new" size="sm">
            Submit a ticket
          </ButtonLink>
        }
      />

      <Panel title={`Open (${open.length})`} padded={false}>
        {open.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted">
            Nothing open. Everything is resolved.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {open.map((ticket) => (
              <li key={ticket.id}>
                <Link
                  href={`/portal/tickets/${ticket.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition hover:bg-surface"
                >
                  <div className="min-w-0">
                    <p className="font-semibold">{ticket.subject}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {ticket.reference} · {departmentLabel(ticket.department)} ·
                      Opened {formatDate(ticket.createdAt)} · Updated{" "}
                      {formatDate(ticket.updatedAt)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted">
                      {priorityLabel(ticket.priority)}
                    </span>
                    <TicketPill status={ticket.status} />
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title={`Resolved & Closed (${closed.length})`} padded={false}>
        {closed.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted">
            Nothing archived yet.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {closed.map((ticket) => (
              <li key={ticket.id}>
                <Link
                  href={`/portal/tickets/${ticket.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition hover:bg-surface"
                >
                  <div className="min-w-0">
                    <p className="font-semibold">{ticket.subject}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {ticket.reference} · {departmentLabel(ticket.department)} ·
                      Closed {formatDate(ticket.updatedAt)}
                    </p>
                  </div>
                  <TicketPill status={ticket.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      <Panel title="Ticket Status Guide">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { status: "OPEN" as const, meaning: "Received and queued for a response." },
            { status: "IN_PROGRESS" as const, meaning: "Our team is actively working on it." },
            { status: "AWAITING_CUSTOMER" as const, meaning: "We need information from you to continue." },
            { status: "RESOLVED" as const, meaning: "Fixed. Reply within 7 days to reopen." },
            { status: "CLOSED" as const, meaning: "Finished and archived." },
          ].map((item) => (
            <div key={item.status} className="rounded-xl border border-line p-4">
              <dt>
                <TicketPill status={item.status} />
              </dt>
              <dd className="mt-2.5 text-sm text-muted">{item.meaning}</dd>
            </div>
          ))}
        </dl>
      </Panel>
    </div>
  );
}
