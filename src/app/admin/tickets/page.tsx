import Link from "next/link";
import { Panel, PortalHeading, StatCard, TicketPill } from "@/components/portal-ui";
import { EmptyState, cx } from "@/components/ui";
import type { Department, TicketStatus } from "@/generated/prisma/client";
import { formatDate } from "@/lib/billing";
import { db } from "@/lib/db";
import {
  departmentLabel,
  priorityLabel,
  ticketStatusLabel,
} from "@/lib/portal-format";

/** Every support ticket, open first, filterable by status and department. */

const statuses = [
  "OPEN",
  "IN_PROGRESS",
  "AWAITING_CUSTOMER",
  "RESOLVED",
  "CLOSED",
] as const satisfies readonly TicketStatus[];

const departments = [
  "TECHNICAL",
  "BILLING",
  "SALES",
] as const satisfies readonly Department[];

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cx(
        "rounded-lg px-3.5 py-2 text-sm font-medium transition",
        active
          ? "bg-navy-950 text-white dark:bg-white dark:text-navy-950"
          : "border border-line text-muted hover:bg-surface",
      )}
    >
      {children}
    </Link>
  );
}

export default async function AdminTicketsPage(
  props: PageProps<"/admin/tickets">,
) {
  const search = await props.searchParams;

  const rawStatus = Array.isArray(search.status) ? search.status[0] : search.status;
  const status = statuses.find((s) => s === rawStatus);

  const rawDepartment = Array.isArray(search.department)
    ? search.department[0]
    : search.department;
  const department = departments.find((d) => d === rawDepartment);

  const [tickets, openCount, awaitingCount, totalCount] = await Promise.all([
    db.ticket.findMany({
      where: {
        ...(status ? { status } : {}),
        ...(department ? { department } : {}),
      },
      orderBy: { updatedAt: "desc" },
      take: 300,
      include: {
        user: { select: { id: true, clientRef: true } },
        _count: { select: { messages: true } },
      },
    }),
    db.ticket.count({ where: { status: { notIn: ["CLOSED", "RESOLVED"] } } }),
    db.ticket.count({ where: { status: "AWAITING_CUSTOMER" } }),
    db.ticket.count(),
  ]);

  // Open tickets first, then by most recently updated, matching how the portal
  // splits its own list.
  const closedStatuses: TicketStatus[] = ["CLOSED", "RESOLVED"];
  const ordered = [
    ...tickets.filter((t) => !closedStatuses.includes(t.status)),
    ...tickets.filter((t) => closedStatuses.includes(t.status)),
  ];

  const query = (next: { status?: string; department?: string }) => {
    const params = new URLSearchParams();
    const nextStatus = next.status ?? status;
    const nextDepartment = next.department ?? department;
    if (nextStatus) params.set("status", nextStatus);
    if (nextDepartment) params.set("department", nextDepartment);
    const qs = params.toString();
    return qs ? `/admin/tickets?${qs}` : "/admin/tickets";
  };

  return (
    <div className="space-y-6">
      <PortalHeading
        title="Tickets"
        description="Every support ticket raised, by clients and guests alike. Open tickets appear first."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Open"
          value={openCount}
          detail="Not resolved or closed"
          tone={openCount > 0 ? "alert" : "default"}
        />
        <StatCard
          label="Awaiting customer"
          value={awaitingCount}
          detail="Waiting on a reply from them"
        />
        <StatCard
          label="Total tickets"
          value={totalCount}
          detail="Since the portal opened"
        />
      </div>

      <Panel>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Status
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <FilterLink href={query({ status: "" })} active={!status}>
                All statuses
              </FilterLink>
              {statuses.map((s) => (
                <FilterLink key={s} href={query({ status: s })} active={status === s}>
                  {ticketStatusLabel(s)}
                </FilterLink>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Department
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <FilterLink href={query({ department: "" })} active={!department}>
                All departments
              </FilterLink>
              {departments.map((d) => (
                <FilterLink
                  key={d}
                  href={query({ department: d })}
                  active={department === d}
                >
                  {departmentLabel(d)}
                </FilterLink>
              ))}
            </div>
          </div>
        </div>
      </Panel>

      {ordered.length === 0 ? (
        <EmptyState
          title="No tickets to show"
          description={
            status || department
              ? "No tickets match this filter. Try widening it."
              : "Tickets raised through the support form appear here."
          }
        />
      ) : (
        <Panel title={`${ordered.length} tickets`} padded={false}>
          <ul className="divide-y divide-line">
            {ordered.map((ticket) => (
              <li key={ticket.id}>
                <Link
                  href={`/admin/tickets/${ticket.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition hover:bg-surface"
                >
                  <div className="min-w-0">
                    <p className="font-semibold">{ticket.subject}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {ticket.reference} · {ticket.name} ·{" "}
                      {ticket.user?.clientRef ?? "Guest"} ·{" "}
                      {departmentLabel(ticket.department)} · {ticket._count.messages}{" "}
                      messages · Updated {formatDate(ticket.updatedAt)}
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
        </Panel>
      )}
    </div>
  );
}
