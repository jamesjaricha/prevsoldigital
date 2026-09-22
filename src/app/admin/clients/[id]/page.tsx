import Link from "next/link";
import { notFound } from "next/navigation";
import {
  InvoicePill,
  Panel,
  PortalHeading,
  StatCard,
  StatusPill,
  TicketPill,
} from "@/components/portal-ui";
import { formatDate, money } from "@/lib/billing";
import { db } from "@/lib/db";
import {
  cycleSuffix,
  departmentLabel,
  serviceTypeLabel,
} from "@/lib/portal-format";

/**
 * One client, read-only.
 *
 * Everything on this page is edited from its own tab — services from
 * /admin/services, domains from /admin/domains — so there is nothing to change
 * here by accident while looking a client up on the phone.
 */

export default async function AdminClientDetailPage(
  props: PageProps<"/admin/clients/[id]">,
) {
  const { id } = await props.params;

  const client = await db.user.findUnique({
    where: { id },
    include: {
      services: { orderBy: [{ status: "asc" }, { createdAt: "desc" }] },
      domains: { orderBy: { expiresAt: "asc" } },
      invoices: { orderBy: { issuedAt: "desc" } },
      tickets: { orderBy: { updatedAt: "desc" } },
    },
  });

  if (!client) notFound();

  const paidTotal = client.invoices
    .filter((i) => i.status === "PAID")
    .reduce((sum, i) => sum + i.totalCents, 0);
  const outstandingTotal = client.invoices
    .filter((i) => i.status === "UNPAID" || i.status === "OVERDUE")
    .reduce((sum, i) => sum + i.totalCents, 0);
  const activeServices = client.services.filter(
    (s) => s.status === "ACTIVE",
  ).length;
  const openTickets = client.tickets.filter(
    (t) => t.status !== "CLOSED" && t.status !== "RESOLVED",
  ).length;

  const details: { label: string; value: string }[] = [
    { label: "Client reference", value: client.clientRef },
    { label: "Email", value: client.email },
    { label: "Phone", value: client.phone ?? "—" },
    { label: "Company", value: client.company ?? "—" },
    { label: "Address", value: client.address ?? "—" },
    { label: "City", value: client.city ?? "—" },
    { label: "Role", value: client.role },
    { label: "Joined", value: formatDate(client.createdAt) },
    {
      label: "Email verified",
      value: client.emailVerified ? formatDate(client.emailVerified) : "Not verified",
    },
    {
      label: "Two-factor auth",
      value: client.totpSecret ? "Enabled" : "Not enabled",
    },
  ];

  return (
    <div className="space-y-6">
      <PortalHeading
        title={client.name}
        description={`${client.clientRef} · ${client.email}${client.company ? ` · ${client.company}` : ""}`}
        action={
          <Link
            href="/admin/clients"
            className="text-sm font-semibold text-signal-600 hover:underline"
          >
            ← All clients
          </Link>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Active services"
          value={activeServices}
          detail={`${client.services.length} in total`}
        />
        <StatCard
          label="Outstanding"
          value={money(outstandingTotal)}
          detail="Unpaid and overdue"
          tone={outstandingTotal > 0 ? "alert" : "default"}
        />
        <StatCard
          label="Total paid"
          value={money(paidTotal)}
          detail="Settled invoices, all time"
        />
        <StatCard
          label="Open tickets"
          value={openTickets}
          detail={`${client.tickets.length} raised in total`}
          tone={openTickets > 0 ? "alert" : "default"}
        />
      </div>

      <Panel title="Account Details">
        <dl className="grid gap-x-6 gap-y-3.5 sm:grid-cols-2 lg:grid-cols-3">
          {details.map((detail) => (
            <div key={detail.label}>
              <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
                {detail.label}
              </dt>
              <dd className="mt-1 text-sm">{detail.value}</dd>
            </div>
          ))}
        </dl>
      </Panel>

      <Panel title={`Services (${client.services.length})`} padded={false}>
        {client.services.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted">
            Nothing provisioned on this account yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] text-sm">
              <caption className="sr-only">Services on this account</caption>
              <thead className="border-b border-line text-left text-xs font-semibold uppercase tracking-wider text-muted">
                <tr>
                  <th scope="col" className="px-5 py-3">Service</th>
                  <th scope="col" className="px-5 py-3">Type</th>
                  <th scope="col" className="px-5 py-3">Status</th>
                  <th scope="col" className="px-5 py-3">Next due</th>
                  <th scope="col" className="px-5 py-3 text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {client.services.map((service) => (
                  <tr key={service.id}>
                    <td className="px-5 py-4">
                      <p className="font-semibold">{service.name}</p>
                      {service.detail && (
                        <p className="mt-0.5 text-xs text-muted">
                          {service.detail}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {serviceTypeLabel(service.type)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill status={service.status} />
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {formatDate(service.nextDueAt)}
                    </td>
                    <td className="px-5 py-4 text-right font-medium">
                      {money(service.priceCents)}
                      <span className="text-xs text-muted">
                        /{cycleSuffix(service.cycle)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel title={`Domains (${client.domains.length})`} padded={false}>
        {client.domains.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted">
            No domains registered through this account.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-sm">
              <caption className="sr-only">Domains on this account</caption>
              <thead className="border-b border-line text-left text-xs font-semibold uppercase tracking-wider text-muted">
                <tr>
                  <th scope="col" className="px-5 py-3">Domain</th>
                  <th scope="col" className="px-5 py-3">Status</th>
                  <th scope="col" className="px-5 py-3">Registered</th>
                  <th scope="col" className="px-5 py-3">Expires</th>
                  <th scope="col" className="px-5 py-3">Registrar ref</th>
                  <th scope="col" className="px-5 py-3">Auto-renew</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {client.domains.map((domain) => (
                  <tr key={domain.id}>
                    <th scope="row" className="px-5 py-4 text-left font-semibold">
                      {domain.fqdn}
                    </th>
                    <td className="px-5 py-4">
                      <StatusPill status={domain.status} />
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {formatDate(domain.registeredAt)}
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {formatDate(domain.expiresAt)}
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {domain.registrarRef ?? "—"}
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {domain.autoRenew ? "On" : "Off"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel title={`Invoices (${client.invoices.length})`} padded={false}>
        {client.invoices.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted">
            No invoices raised on this account.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-sm">
              <caption className="sr-only">Invoices on this account</caption>
              <thead className="border-b border-line text-left text-xs font-semibold uppercase tracking-wider text-muted">
                <tr>
                  <th scope="col" className="px-5 py-3">Invoice</th>
                  <th scope="col" className="px-5 py-3">Issued</th>
                  <th scope="col" className="px-5 py-3">Due</th>
                  <th scope="col" className="px-5 py-3">Status</th>
                  <th scope="col" className="px-5 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {client.invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <th scope="row" className="px-5 py-4 text-left font-semibold">
                      {invoice.number}
                    </th>
                    <td className="px-5 py-4 text-muted">
                      {formatDate(invoice.issuedAt)}
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {formatDate(invoice.dueAt)}
                    </td>
                    <td className="px-5 py-4">
                      <InvoicePill status={invoice.status} />
                    </td>
                    <td className="px-5 py-4 text-right font-semibold">
                      {money(invoice.totalCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel title={`Tickets (${client.tickets.length})`} padded={false}>
        {client.tickets.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted">
            This client has not raised a ticket.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {client.tickets.map((ticket) => (
              <li key={ticket.id}>
                <Link
                  href={`/admin/tickets/${ticket.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 transition hover:bg-surface"
                >
                  <div className="min-w-0">
                    <p className="font-semibold">{ticket.subject}</p>
                    <p className="mt-0.5 text-xs text-muted">
                      {ticket.reference} · {departmentLabel(ticket.department)} ·
                      Updated {formatDate(ticket.updatedAt)}
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
  );
}
