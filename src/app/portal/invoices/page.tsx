import Link from "next/link";
import { redirect } from "next/navigation";
import { InvoicePill, Panel, PortalHeading, StatCard } from "@/components/portal-ui";
import { ButtonLink, EmptyState } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { formatDate, money } from "@/lib/billing";
import { db } from "@/lib/db";

export default async function PortalInvoicesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const invoices = await db.invoice.findMany({
    where: { userId: user.id },
    orderBy: { issuedAt: "desc" },
  });

  const outstanding = invoices.filter(
    (i) => i.status === "UNPAID" || i.status === "OVERDUE",
  );
  const outstandingTotal = outstanding.reduce((sum, i) => sum + i.totalCents, 0);
  const paid = invoices.filter((i) => i.status === "PAID");
  const paidTotal = paid.reduce((sum, i) => sum + i.totalCents, 0);

  return (
    <div className="space-y-6">
      <PortalHeading
        title="Invoices"
        description="Every invoice raised on your account."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Outstanding"
          value={money(outstandingTotal)}
          detail={`${outstanding.length} awaiting payment`}
          tone={outstandingTotal > 0 ? "alert" : "default"}
        />
        <StatCard
          label="Paid this year"
          value={money(paidTotal)}
          detail={`${paid.length} invoices settled`}
        />
        <StatCard
          label="Total invoices"
          value={invoices.length}
          detail="Since account opening"
        />
      </div>

      {invoices.length === 0 ? (
        <EmptyState
          title="No invoices yet"
          description="Invoices appear here as soon as the first order is placed on your account."
          action={<ButtonLink href="/shop">Browse the shop</ButtonLink>}
        />
      ) : (
        <Panel padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[40rem] text-sm">
              <caption className="sr-only">Invoice history</caption>
              <thead className="border-b border-line text-left text-xs font-semibold uppercase tracking-wider text-muted">
                <tr>
                  <th scope="col" className="px-5 py-3">Invoice</th>
                  <th scope="col" className="px-5 py-3">Issued</th>
                  <th scope="col" className="px-5 py-3">Due</th>
                  <th scope="col" className="px-5 py-3">Status</th>
                  <th scope="col" className="px-5 py-3 text-right">Total</th>
                  <th scope="col" className="px-5 py-3 text-right">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {invoices.map((invoice) => (
                  <tr key={invoice.id}>
                    <th scope="row" className="px-5 py-4 text-left">
                      <Link
                        href={`/portal/invoices/${invoice.id}`}
                        className="font-semibold transition hover:text-signal-600"
                      >
                        {invoice.number}
                      </Link>
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
                    <td className="px-5 py-4 text-right">
                      <ButtonLink
                        href={`/portal/invoices/${invoice.id}`}
                        variant={invoice.status === "PAID" ? "outline" : "primary"}
                        size="sm"
                      >
                        {invoice.status === "PAID" ? "View" : "Pay Now"}
                      </ButtonLink>
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
