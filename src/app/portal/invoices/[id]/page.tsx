import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowRightIcon } from "@/components/icons";
import { InvoicePill, Panel, PortalHeading } from "@/components/portal-ui";
import { PrintButton } from "@/components/print-button";
import { ButtonLink } from "@/components/ui";
import { brand } from "@/content/brand";
import { getCurrentUser } from "@/lib/auth";
import { formatDate, money } from "@/lib/billing";
import { db } from "@/lib/db";
import { paymentMethodLabel } from "@/lib/portal-format";

export default async function InvoiceDetailPage(
  props: PageProps<"/portal/invoices/[id]">,
) {
  const { id } = await props.params;

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Scoped by userId, so another client's invoice id 404s rather than leaking.
  const invoice = await db.invoice.findFirst({
    where: { id, userId: user.id },
    include: {
      items: true,
      payments: {
        where: { status: "PAID" },
        orderBy: { paidAt: "desc" },
      },
    },
  });

  if (!invoice) notFound();

  const payment = invoice.payments[0];

  return (
    <div className="space-y-6">
      <PortalHeading
        title={`Invoice ${invoice.number}`}
        description={`Issued ${formatDate(invoice.issuedAt)} · Due ${formatDate(invoice.dueAt)}`}
        action={
          <Link
            href="/portal/invoices"
            className="text-sm font-semibold text-signal-600 hover:underline"
          >
            ← All invoices
          </Link>
        }
      />

      {invoice.status === "OVERDUE" && (
        <div className="rounded-2xl border border-signal-200 bg-signal-50 px-5 py-4 dark:border-signal-800 dark:bg-signal-500/10">
          <p className="font-semibold text-signal-800 dark:text-signal-200">
            This invoice is overdue
          </p>
          <p className="mt-1 text-sm text-signal-700 dark:text-signal-300">
            Payment was due on {formatDate(invoice.dueAt)}. Services linked to
            this invoice are suspended 7 days after the due date.
          </p>
        </div>
      )}

      <Panel padded={false}>
        {/* Invoice header */}
        <div className="flex flex-wrap items-start justify-between gap-6 border-b border-line p-6">
          <div>
            <p className="font-display text-xl font-bold uppercase tracking-tight">
              {brand.name}
            </p>
            <p className="mt-1 text-sm text-muted">
              {brand.address}
              <br />
              {brand.city}, {brand.country}
              <br />
              {brand.email}
            </p>
          </div>
          <div className="text-right">
            <InvoicePill status={invoice.status} />
            <p className="font-display mt-3 text-2xl font-bold">
              {invoice.number}
            </p>
            <p className="mt-1 text-sm text-muted">
              Issued {formatDate(invoice.issuedAt)}
              <br />
              Due {formatDate(invoice.dueAt)}
            </p>
          </div>
        </div>

        {/* Bill to */}
        <div className="border-b border-line p-6">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
            Billed to
          </p>
          <p className="mt-2 font-semibold">{user.company}</p>
          <p className="text-sm text-muted">
            {user.name}
            <br />
            {user.email}
            <br />
            Client ID {user.clientRef}
          </p>
        </div>

        {/* Line items */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[30rem] text-sm">
            <caption className="sr-only">Invoice line items</caption>
            <thead className="border-b border-line text-left text-xs font-semibold uppercase tracking-wider text-muted">
              <tr>
                <th scope="col" className="px-6 py-3">Description</th>
                <th scope="col" className="px-6 py-3 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4">{item.description}</td>
                  <td className="px-6 py-4 text-right font-medium">
                    {/* amountCents is the line total; quantity is already applied. */}
                    {money(item.amountCents)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t border-line">
              <tr>
                <th scope="row" className="px-6 py-3 text-right font-normal text-muted">
                  Subtotal
                </th>
                <td className="px-6 py-3 text-right">
                  {money(invoice.subtotalCents)}
                </td>
              </tr>
              {invoice.discountCents > 0 && (
                <tr>
                  <th scope="row" className="px-6 py-3 text-right font-normal text-muted">
                    Discount
                  </th>
                  <td className="px-6 py-3 text-right">
                    −{money(invoice.discountCents)}
                  </td>
                </tr>
              )}
              <tr>
                <th scope="row" className="px-6 py-3 text-right font-normal text-muted">
                  VAT (15%)
                </th>
                <td className="px-6 py-3 text-right">{money(invoice.taxCents)}</td>
              </tr>
              <tr className="border-t border-line">
                <th scope="row" className="px-6 py-4 text-right font-display font-bold uppercase">
                  Total
                </th>
                <td className="px-6 py-4 text-right font-display text-xl font-bold">
                  {money(invoice.totalCents)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Payment record */}
        {invoice.status === "PAID" && (
          <div className="border-t border-line bg-emerald-50 p-6 dark:bg-emerald-500/10">
            <p className="text-sm text-emerald-800 dark:text-emerald-300">
              Paid in full on{" "}
              {formatDate(payment?.paidAt ?? invoice.paidAt ?? invoice.updatedAt)}
              {payment ? ` via ${paymentMethodLabel(payment.method)}` : ""}. Thank
              you.
            </p>
          </div>
        )}
      </Panel>

      {/* Actions — §11 requires View, Download PDF and Pay Now. */}
      <div className="flex flex-wrap gap-3">
        {invoice.status !== "PAID" && (
          <ButtonLink href="/checkout" size="lg">
            Pay Now — {money(invoice.totalCents)}
            <ArrowRightIcon className="size-4" />
          </ButtonLink>
        )}
        <PrintButton />
        <ButtonLink href="/support/new" variant="ghost" size="lg">
          Query this invoice
        </ButtonLink>
      </div>
    </div>
  );
}
