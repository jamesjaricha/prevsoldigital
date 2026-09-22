import Link from "next/link";
import { Panel, PortalHeading, StatCard } from "@/components/portal-ui";
import { EmptyState } from "@/components/ui";
import { formatDate, money } from "@/lib/billing";
import { db } from "@/lib/db";

/**
 * Staff overview.
 *
 * The numbers here are counts, not lists — the "needs attention" panel below
 * carries the actual work, so a staff member can start from the top of one
 * list rather than checking eight tabs in turn.
 */

export default async function AdminOverviewPage() {
  const [
    unhandledEnquiries,
    pendingOrders,
    outstandingInvoices,
    openTickets,
    pendingDomains,
    activeServices,
    totalClients,
    attentionEnquiries,
    attentionOrders,
    attentionDomains,
    attentionTickets,
  ] = await Promise.all([
    db.enquiry.count({ where: { handledAt: null } }),
    db.order.count({ where: { status: "PENDING" } }),
    db.invoice.findMany({
      where: { status: { in: ["UNPAID", "OVERDUE"] } },
      select: { totalCents: true, status: true },
    }),
    db.ticket.count({ where: { status: { notIn: ["CLOSED", "RESOLVED"] } } }),
    db.domain.count({ where: { status: "PENDING" } }),
    db.service.count({ where: { status: "ACTIVE" } }),
    db.user.count({ where: { role: "CLIENT" } }),

    db.enquiry.findMany({
      where: { handledAt: null },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: { id: true, kind: true, name: true, subject: true, createdAt: true },
    }),
    db.order.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        reference: true,
        totalCents: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    }),
    db.domain.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      take: 5,
      select: {
        id: true,
        fqdn: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    }),
    db.ticket.findMany({
      where: { status: { notIn: ["CLOSED", "RESOLVED"] } },
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: {
        id: true,
        reference: true,
        subject: true,
        updatedAt: true,
        name: true,
      },
    }),
  ]);

  const outstandingTotal = outstandingInvoices.reduce(
    (sum, i) => sum + i.totalCents,
    0,
  );
  const overdueCount = outstandingInvoices.filter(
    (i) => i.status === "OVERDUE",
  ).length;

  const attention: {
    href: string;
    title: string;
    detail: string;
    meta: string;
    group: string;
  }[] = [
    ...attentionDomains.map((domain) => ({
      href: "/admin/domains",
      title: domain.fqdn,
      detail: `${domain.user.name} · awaiting manual registration with ZISPA`,
      meta: formatDate(domain.createdAt),
      group: "Domain",
    })),
    ...attentionOrders.map((order) => ({
      href: "/admin/orders",
      title: order.reference,
      detail: `${order.user.name} · ${money(order.totalCents)} awaiting payment confirmation`,
      meta: formatDate(order.createdAt),
      group: "Order",
    })),
    ...attentionEnquiries.map((enquiry) => ({
      href: "/admin/enquiries",
      title: enquiry.subject ?? `${enquiry.name} — new ${enquiry.kind.toLowerCase()}`,
      detail: `${enquiry.name} · not yet handled`,
      meta: formatDate(enquiry.createdAt),
      group: "Enquiry",
    })),
    ...attentionTickets.map((ticket) => ({
      href: `/admin/tickets/${ticket.id}`,
      title: ticket.subject,
      detail: `${ticket.reference} · ${ticket.name} · awaiting a reply`,
      meta: formatDate(ticket.updatedAt),
      group: "Ticket",
    })),
  ];

  return (
    <div className="space-y-6">
      <PortalHeading
        title="Overview"
        description="Where the business stands right now, and what is waiting on us."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="New enquiries"
          value={unhandledEnquiries}
          detail="Not yet handled"
          href="/admin/enquiries"
          tone={unhandledEnquiries > 0 ? "alert" : "default"}
        />
        <StatCard
          label="Pending orders"
          value={pendingOrders}
          detail="Awaiting payment confirmation"
          href="/admin/orders"
          tone={pendingOrders > 0 ? "alert" : "default"}
        />
        <StatCard
          label="Outstanding invoices"
          value={money(outstandingTotal)}
          detail={`${outstandingInvoices.length} unpaid · ${overdueCount} overdue`}
          href="/admin/invoices"
          tone={outstandingTotal > 0 ? "alert" : "default"}
        />
        <StatCard
          label="Open tickets"
          value={openTickets}
          detail="Not resolved or closed"
          href="/admin/tickets"
          tone={openTickets > 0 ? "alert" : "default"}
        />
        <StatCard
          label="Pending domains"
          value={pendingDomains}
          detail="Manual .co.zw queue"
          href="/admin/domains"
          tone={pendingDomains > 0 ? "alert" : "default"}
        />
        <StatCard
          label="Active services"
          value={activeServices}
          detail="Running across all clients"
          href="/admin/services"
        />
        <StatCard
          label="Clients"
          value={totalClients}
          detail="Registered accounts"
          href="/admin/clients"
        />
      </div>

      <Panel title={`Needs Attention (${attention.length})`} padded={false}>
        {attention.length === 0 ? (
          <div className="p-5">
            <EmptyState
              title="Nothing outstanding"
              description="Every enquiry, order, domain and ticket has been dealt with. Enjoy it while it lasts."
            />
          </div>
        ) : (
          <ul className="divide-y divide-line">
            {attention.map((item, index) => (
              <li key={`${item.group}-${index}`}>
                <Link
                  href={item.href}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition hover:bg-surface"
                >
                  <div className="min-w-0">
                    <p className="font-semibold">{item.title}</p>
                    <p className="mt-0.5 text-xs text-muted">{item.detail}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted">{item.meta}</span>
                    <span className="inline-flex items-center rounded-full bg-navy-100 px-2.5 py-1 text-xs font-semibold text-navy-800 ring-1 ring-inset ring-navy-600/15 dark:bg-navy-500/15 dark:text-navy-100 dark:ring-navy-300/25">
                      {item.group}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}
