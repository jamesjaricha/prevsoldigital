import Link from "next/link";
import { InvoicePill, Panel, PortalHeading, StatCard } from "@/components/portal-ui";
import { EmptyState, cx } from "@/components/ui";
import type { InvoiceStatus } from "@/generated/prisma/client";
import { formatDate, money } from "@/lib/billing";
import { db } from "@/lib/db";
import { invoiceStatusLabel } from "@/lib/portal-format";

/** Every invoice raised, across all clients, filterable by status. */

const statuses = [
  "DRAFT",
  "UNPAID",
  "OVERDUE",
  "PAID",
  "CANCELLED",
  "REFUNDED",
] as const satisfies readonly InvoiceStatus[];

export default async function AdminInvoicesPage(
  props: PageProps<"/admin/invoices">,
) {
  const search = await props.searchParams;
  const rawStatus = Array.isArray(search.status) ? search.status[0] : search.status;
  const status = statuses.find((s) => s === rawStatus);

  const [invoices, counts] = await Promise.all([
    db.invoice.findMany({
      where: status ? { status } : {},
      orderBy: { issuedAt: "desc" },
      take: 200,
      include: {
        user: { select: { id: true, name: true, clientRef: true } },
      },
    }),
    db.invoice.groupBy({
      by: ["status"],
      _count: { _all: true },
      _sum: { totalCents: true },
    }),
  ]);

  const countFor = (s: InvoiceStatus) =>
    counts.find((c) => c.status === s)?._count._all ?? 0;
  const sumFor = (s: InvoiceStatus) =>
    counts.find((c) => c.status === s)?._sum.totalCents ?? 0;

  const totalInvoices = counts.reduce((sum, c) => sum + c._count._all, 0);
  const outstandingTotal = sumFor("UNPAID") + sumFor("OVERDUE");
  const outstandingCount = countFor("UNPAID") + countFor("OVERDUE");

  // Totals for the filtered view, so the summary always matches the table.
  const shownTotal = invoices.reduce((sum, i) => sum + i.totalCents, 0);

  return (
    <div className="space-y-6">
      <PortalHeading
        title="Invoices"
        description="Every invoice raised on the system. Invoices settle automatically through Paynow, or when an order is marked paid."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Outstanding"
          value={money(outstandingTotal)}
          detail={`${outstandingCount} unpaid or overdue`}
          tone={outstandingTotal > 0 ? "alert" : "default"}
        />
        <StatCard
          label="Collected"
          value={money(sumFor("PAID"))}
          detail={`${countFor("PAID")} invoices settled`}
        />
        <StatCard
          label="Total invoices"
          value={totalInvoices}
          detail="Across all clients"
        />
      </div>

      <Panel>
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          Status
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Link
            href="/admin/invoices"
            className={cx(
              "rounded-lg px-3.5 py-2 text-sm font-medium transition",
              !status
                ? "bg-navy-950 text-white dark:bg-white dark:text-navy-950"
                : "border border-line text-muted hover:bg-surface",
            )}
          >
            All ({totalInvoices})
          </Link>
          {statuses.map((s) => (
            <Link
              key={s}
              href={`/admin/invoices?status=${s}`}
              className={cx(
                "rounded-lg px-3.5 py-2 text-sm font-medium transition",
                status === s
                  ? "bg-navy-950 text-white dark:bg-white dark:text-navy-950"
                  : "border border-line text-muted hover:bg-surface",
              )}
            >
              {invoiceStatusLabel(s)} ({countFor(s)})
            </Link>
          ))}
        </div>
      </Panel>

      {invoices.length === 0 ? (
        <EmptyState
          title="No invoices to show"
          description={
            status
              ? `No invoices currently sit at ${invoiceStatusLabel(status).toLowerCase()}.`
              : "Invoices appear here as soon as the first order is placed."
          }
        />
      ) : (
        <Panel
          padded={false}
          title={
            status
              ? `${invoiceStatusLabel(status)} — ${money(shownTotal)}`
              : `All invoices — ${money(shownTotal)}`
          }
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[48rem] text-sm">
              <caption className="sr-only">Invoices across all clients</caption>
              <thead className="border-b border-line text-left text-xs font-semibold uppercase tracking-wider text-muted">
                <tr>
                  <th scope="col" className="px-5 py-3">Invoice</th>
                  <th scope="col" className="px-5 py-3">Client</th>
                  <th scope="col" className="px-5 py-3">Issued</th>
                  <th scope="col" className="px-5 py-3">Due</th>
                  <th scope="col" className="px-5 py-3">Paid</th>
                  <th scope="col" className="px-5 py-3">Status</th>
                  <th scope="col" className="px-5 py-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <th scope="row" className="px-5 py-4 text-left font-semibold">
                      {invoice.number}
                    </th>
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/clients/${invoice.user.id}`}
                        className="font-medium transition hover:text-signal-600"
                      >
                        {invoice.user.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted">
                        {invoice.user.clientRef}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {formatDate(invoice.issuedAt)}
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {formatDate(invoice.dueAt)}
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {invoice.paidAt ? formatDate(invoice.paidAt) : "—"}
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
              <tfoot className="border-t border-line">
                <tr>
                  <td colSpan={6} className="px-5 py-3.5 text-right font-semibold">
                    {invoices.length} invoices shown
                  </td>
                  <td className="px-5 py-3.5 text-right font-semibold">
                    {money(shownTotal)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Panel>
      )}
    </div>
  );
}
