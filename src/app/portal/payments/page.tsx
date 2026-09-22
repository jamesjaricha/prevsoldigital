import Link from "next/link";
import { redirect } from "next/navigation";
import { CardIcon } from "@/components/icons";
import { Panel, PortalHeading, StatCard } from "@/components/portal-ui";
import { getCurrentUser } from "@/lib/auth";
import { formatDate, money } from "@/lib/billing";
import { db } from "@/lib/db";
import { paymentMethodLabel } from "@/lib/portal-format";

export default async function PortalPaymentsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [payments, unpaidInvoices] = await Promise.all([
    db.payment.findMany({
      where: { userId: user.id, status: "PAID" },
      orderBy: { paidAt: "desc" },
      include: { invoice: { select: { id: true, number: true } } },
    }),
    db.invoice.findMany({
      where: { userId: user.id, status: { in: ["UNPAID", "OVERDUE"] } },
      select: { totalCents: true },
    }),
  ]);

  const total = payments.reduce((sum, p) => sum + p.amountCents, 0);
  const outstanding = unpaidInvoices.reduce((sum, i) => sum + i.totalCents, 0);
  const preferredMethod = payments[0]
    ? paymentMethodLabel(payments[0].method)
    : "None yet";

  return (
    <div className="space-y-6">
      <PortalHeading
        title="Payments"
        description="Your payment history and outstanding balance."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Total paid" value={money(total)} detail={`${payments.length} payments`} />
        <StatCard
          label="Outstanding"
          value={money(outstanding)}
          detail="Across unpaid invoices"
          tone={outstanding > 0 ? "alert" : "default"}
          href="/portal/invoices"
        />
        <StatCard
          label="Preferred method"
          value={preferredMethod}
          detail="Used most recently"
        />
      </div>

      <Panel title="Payment History" padded={false}>
        {payments.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted">
            No payments recorded on your account yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-sm">
              <caption className="sr-only">Payments received</caption>
              <thead className="border-b border-line text-left text-xs font-semibold uppercase tracking-wider text-muted">
                <tr>
                  <th scope="col" className="px-5 py-3">Date</th>
                  <th scope="col" className="px-5 py-3">Invoice</th>
                  <th scope="col" className="px-5 py-3">Method</th>
                  <th scope="col" className="px-5 py-3 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-5 py-4 text-muted">
                      {formatDate(payment.paidAt ?? payment.createdAt)}
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/portal/invoices/${payment.invoice.id}`}
                        className="font-semibold transition hover:text-signal-600"
                      >
                        {payment.invoice.number}
                      </Link>
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {paymentMethodLabel(payment.method)}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold">
                      {money(payment.amountCents)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Panel>

      <Panel title="Accepted Payment Methods">
        <ul className="grid gap-3 sm:grid-cols-2">
          {[
            { name: "EcoCash", detail: "Confirmation usually within an hour." },
            { name: "Card payment", detail: "Visa or Mastercard, confirmed immediately." },
            { name: "Bank transfer", detail: "One to two business days to reflect." },
            { name: "Cash", detail: "At our Eastlea offices during business hours." },
          ].map((method) => (
            <li
              key={method.name}
              className="flex items-start gap-3 rounded-xl border border-line p-4"
            >
              <CardIcon className="mt-0.5 size-5 shrink-0 text-signal-600" />
              <div>
                <p className="font-semibold">{method.name}</p>
                <p className="mt-0.5 text-sm text-muted">{method.detail}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-muted">
          Payment not reflecting?{" "}
          <Link
            href="/knowledge-base/why-hasnt-my-payment-reflected"
            className="font-semibold text-signal-600 hover:underline"
          >
            Read our guide
          </Link>{" "}
          or{" "}
          <Link
            href="/support/new"
            className="font-semibold text-signal-600 hover:underline"
          >
            open a billing ticket
          </Link>
          .
        </p>
      </Panel>
    </div>
  );
}
