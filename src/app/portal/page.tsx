/** Client dashboard — requirements doc §11. */

import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRightIcon,
  GlobeIcon,
  ReceiptIcon,
  ServerIcon,
  TicketIcon,
  LayoutIcon,
} from "@/components/icons";
import {
  InvoicePill,
  Panel,
  StatCard,
  StatusPill,
  TicketPill,
} from "@/components/portal-ui";
import { ButtonLink } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { formatDate, money } from "@/lib/billing";
import { db } from "@/lib/db";
import {
  cycleSuffix,
  departmentLabel,
  serviceTypeLabel,
} from "@/lib/portal-format";

export default async function PortalDashboard() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [
    services,
    serviceCount,
    activeServiceCount,
    domainCount,
    hostingServices,
    expiring,
    outstanding,
    openTicketCount,
    recentNotifications,
    recentInvoices,
    recentTickets,
  ] = await Promise.all([
    db.service.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    db.service.count({ where: { userId: user.id } }),
    db.service.count({ where: { userId: user.id, status: "ACTIVE" } }),
    db.domain.count({ where: { userId: user.id } }),
    db.service.findMany({
      where: { userId: user.id, type: "HOSTING" },
      orderBy: { createdAt: "desc" },
    }),
    db.domain.findMany({
      where: { userId: user.id, status: "EXPIRING_SOON" },
      orderBy: { expiresAt: "asc" },
    }),
    db.invoice.findMany({
      where: { userId: user.id, status: { in: ["UNPAID", "OVERDUE"] } },
      orderBy: { dueAt: "asc" },
    }),
    db.ticket.count({
      where: { userId: user.id, status: { notIn: ["CLOSED", "RESOLVED"] } },
    }),
    db.notification.findMany({
      where: { userId: user.id, readAt: null },
      orderBy: { createdAt: "desc" },
      take: 4,
    }),
    db.invoice.findMany({
      where: { userId: user.id },
      orderBy: { issuedAt: "desc" },
      take: 4,
    }),
    db.ticket.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      take: 4,
    }),
  ]);

  const outstandingTotal = outstanding.reduce((sum, i) => sum + i.totalCents, 0);
  const overdue = outstanding.filter((i) => i.status === "OVERDUE");

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div className="rounded-2xl border border-line bg-background p-5 shadow-card">
        <p className="font-display text-lg font-bold uppercase tracking-tight">
          Welcome back, {user.name.split(" ")[0]}
        </p>
        <p className="mt-1 text-sm text-muted">
          Client ID {user.clientRef} · Here&apos;s where your account stands today.
        </p>
      </div>

      {/* Alerts */}
      {(overdue.length > 0 || expiring.length > 0) && (
        <div className="space-y-3">
          {overdue.map((invoice) => (
            <Link
              key={invoice.id}
              href={`/portal/invoices/${invoice.id}`}
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-signal-200 bg-signal-50 px-5 py-4 transition hover:border-signal-300 dark:border-signal-800 dark:bg-signal-500/10"
            >
              <div>
                <p className="font-semibold text-signal-800 dark:text-signal-200">
                  Invoice {invoice.number} is overdue
                </p>
                <p className="mt-0.5 text-sm text-signal-700 dark:text-signal-300">
                  {money(invoice.totalCents)} was due on{" "}
                  {formatDate(invoice.dueAt)}. Services are suspended 7 days past
                  the due date.
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-signal-700 dark:text-signal-300">
                Pay now <ArrowRightIcon className="size-4" />
              </span>
            </Link>
          ))}

          {expiring.map((domain) => (
            <Link
              key={domain.id}
              href="/portal/domains"
              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-orange-200 bg-orange-50 px-5 py-4 transition hover:border-orange-300 dark:border-orange-900 dark:bg-orange-500/10"
            >
              <div>
                <p className="font-semibold text-orange-900 dark:text-orange-200">
                  {domain.fqdn} expires soon
                </p>
                <p className="mt-0.5 text-sm text-orange-800 dark:text-orange-300">
                  Renews {formatDate(domain.expiresAt)}. Domain registration ·
                  Auto-renew is {domain.autoRenew ? "on" : "off"}
                </p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-orange-900 dark:text-orange-200">
                Renew <ArrowRightIcon className="size-4" />
              </span>
            </Link>
          ))}
        </div>
      )}

      {/* Overview cards */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Active Services"
          value={activeServiceCount}
          detail={`${serviceCount} total on account`}
          href="/portal/services"
          icon={<LayoutIcon className="size-5" />}
        />
        <StatCard
          label="Domains"
          value={domainCount}
          detail={
            expiring.length ? `${expiring.length} expiring soon` : "All current"
          }
          href="/portal/domains"
          tone={expiring.length ? "alert" : "default"}
          icon={<GlobeIcon className="size-5" />}
        />
        <StatCard
          label="Hosting"
          value={hostingServices.length}
          detail={hostingServices[0]?.name ?? "None"}
          href="/portal/hosting"
          icon={<ServerIcon className="size-5" />}
        />
        <StatCard
          label="Outstanding"
          value={money(outstandingTotal)}
          detail={`${outstanding.length} unpaid ${outstanding.length === 1 ? "invoice" : "invoices"}`}
          href="/portal/invoices"
          tone={outstandingTotal > 0 ? "alert" : "default"}
          icon={<ReceiptIcon className="size-5" />}
        />
        <StatCard
          label="Support Tickets"
          value={openTicketCount}
          detail={openTicketCount ? "Awaiting resolution" : "Nothing open"}
          href="/portal/tickets"
          icon={<TicketIcon className="size-5" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        {/* Services */}
        <Panel
          className="xl:col-span-2"
          title="My Services"
          padded={false}
          action={
            <Link
              href="/portal/services"
              className="text-sm font-semibold text-signal-600 hover:underline"
            >
              View all
            </Link>
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-sm">
              <caption className="sr-only">Your active services</caption>
              <thead className="border-b border-line text-left text-xs font-semibold uppercase tracking-wider text-muted">
                <tr>
                  <th scope="col" className="px-5 py-3">Service</th>
                  <th scope="col" className="px-5 py-3">Status</th>
                  <th scope="col" className="px-5 py-3">Next due</th>
                  <th scope="col" className="px-5 py-3 text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {services.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-muted">
                      Nothing provisioned yet.
                    </td>
                  </tr>
                ) : (
                  services.map((service) => (
                    <tr key={service.id}>
                      <td className="px-5 py-3.5">
                        <p className="font-semibold">{service.name}</p>
                        <p className="mt-0.5 text-xs text-muted">
                          {serviceTypeLabel(service.type)}
                        </p>
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusPill status={service.status} />
                      </td>
                      <td className="px-5 py-3.5 text-muted">
                        {formatDate(service.nextDueAt)}
                      </td>
                      <td className="px-5 py-3.5 text-right font-medium">
                        {money(service.priceCents)}
                        <span className="text-xs text-muted">
                          /{cycleSuffix(service.cycle)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Panel>

        {/* Notifications */}
        <Panel
          title="Recent Activity"
          padded={false}
          action={
            <Link
              href="/portal/notifications"
              className="text-sm font-semibold text-signal-600 hover:underline"
            >
              View all
            </Link>
          }
        >
          {recentNotifications.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted">
              Nothing new right now.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {recentNotifications.map((n) => (
                <li key={n.id}>
                  <Link
                    href={n.href ?? "/portal/notifications"}
                    className="flex gap-3 px-5 py-4 transition hover:bg-surface"
                  >
                    <span className="mt-1.5 size-2 shrink-0 rounded-full bg-signal-500" />
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">
                        {n.title}
                      </span>
                      <span className="mt-0.5 block text-xs text-muted">
                        {n.body}
                      </span>
                      <span className="mt-1 block text-xs text-muted">
                        {formatDate(n.createdAt)}
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Invoices */}
        <Panel
          title="Recent Invoices"
          padded={false}
          action={
            <Link
              href="/portal/invoices"
              className="text-sm font-semibold text-signal-600 hover:underline"
            >
              View all
            </Link>
          }
        >
          {recentInvoices.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted">
              No invoices raised yet.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {recentInvoices.map((invoice) => (
                <li key={invoice.id}>
                  <Link
                    href={`/portal/invoices/${invoice.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-surface"
                  >
                    <div>
                      <p className="font-semibold">{invoice.number}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        Issued {formatDate(invoice.issuedAt)} · Due{" "}
                        {formatDate(invoice.dueAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">
                        {money(invoice.totalCents)}
                      </span>
                      <InvoicePill status={invoice.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        {/* Tickets */}
        <Panel
          title="Support Tickets"
          padded={false}
          action={
            <Link
              href="/portal/tickets"
              className="text-sm font-semibold text-signal-600 hover:underline"
            >
              View all
            </Link>
          }
        >
          {recentTickets.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-muted">
              No tickets raised yet.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {recentTickets.map((ticket) => (
                <li key={ticket.id}>
                  <Link
                    href={`/portal/tickets/${ticket.id}`}
                    className="flex items-center justify-between gap-4 px-5 py-4 transition hover:bg-surface"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold">{ticket.subject}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        {departmentLabel(ticket.department)} · Updated{" "}
                        {formatDate(ticket.updatedAt)}
                      </p>
                    </div>
                    <TicketPill status={ticket.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>

      {/* Quick actions */}
      <Panel title="Quick Actions">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Submit a ticket", href: "/support/new" },
            { label: "Search a domain", href: "/domains" },
            { label: "Browse the shop", href: "/shop" },
            { label: "Request a quote", href: "/quote" },
          ].map((action) => (
            <ButtonLink
              key={action.href}
              href={action.href}
              variant="outline"
              className="w-full justify-between"
            >
              {action.label}
              <ArrowRightIcon className="size-4" />
            </ButtonLink>
          ))}
        </div>
      </Panel>
    </div>
  );
}
