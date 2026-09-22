import Link from "next/link";
import { Panel, PortalHeading, StatCard } from "@/components/portal-ui";
import { EmptyState } from "@/components/ui";
import { formatDate, money } from "@/lib/billing";
import { db } from "@/lib/db";

/** Every client account, with enough billing context to triage from the list. */

export default async function AdminClientsPage() {
  const clients = await db.user.findMany({
    where: { role: "CLIENT" },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { services: true, invoices: true, tickets: true } },
      invoices: {
        where: { status: "PAID" },
        select: { totalCents: true },
      },
    },
  });

  const rows = clients.map((client) => ({
    ...client,
    paidTotal: client.invoices.reduce((sum, i) => sum + i.totalCents, 0),
  }));

  const lifetimeTotal = rows.reduce((sum, c) => sum + c.paidTotal, 0);
  const totalServices = rows.reduce((sum, c) => sum + c._count.services, 0);

  return (
    <div className="space-y-6">
      <PortalHeading
        title="Clients"
        description="Every registered client account, newest first."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Clients"
          value={rows.length}
          detail="Registered accounts"
        />
        <StatCard
          label="Services"
          value={totalServices}
          detail="Provisioned across all accounts"
        />
        <StatCard
          label="Lifetime paid"
          value={money(lifetimeTotal)}
          detail="Settled invoices, all time"
        />
      </div>

      {rows.length === 0 ? (
        <EmptyState
          title="No clients yet"
          description="Client accounts appear here as soon as someone registers through the site."
        />
      ) : (
        <Panel padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[52rem] text-sm">
              <caption className="sr-only">All client accounts</caption>
              <thead className="border-b border-line text-left text-xs font-semibold uppercase tracking-wider text-muted">
                <tr>
                  <th scope="col" className="px-5 py-3">Client</th>
                  <th scope="col" className="px-5 py-3">Reference</th>
                  <th scope="col" className="px-5 py-3">Email</th>
                  <th scope="col" className="px-5 py-3">Joined</th>
                  <th scope="col" className="px-5 py-3 text-right">Services</th>
                  <th scope="col" className="px-5 py-3 text-right">Invoices</th>
                  <th scope="col" className="px-5 py-3 text-right">Total paid</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((client) => (
                  <tr key={client.id}>
                    <th scope="row" className="px-5 py-4 text-left">
                      <Link
                        href={`/admin/clients/${client.id}`}
                        className="font-semibold transition hover:text-signal-600"
                      >
                        {client.name}
                      </Link>
                      {client.company && (
                        <p className="mt-0.5 text-xs font-normal text-muted">
                          {client.company}
                        </p>
                      )}
                    </th>
                    <td className="px-5 py-4 text-muted">{client.clientRef}</td>
                    <td className="px-5 py-4 text-muted">{client.email}</td>
                    <td className="px-5 py-4 text-muted">
                      {formatDate(client.createdAt)}
                    </td>
                    <td className="px-5 py-4 text-right text-muted">
                      {client._count.services}
                    </td>
                    <td className="px-5 py-4 text-right text-muted">
                      {client._count.invoices}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold">
                      {money(client.paidTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>
      )}
    </div>
  );
}
