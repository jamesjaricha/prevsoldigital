import Link from "next/link";
import { InvoicePill, Panel, PortalHeading, StatCard } from "@/components/portal-ui";
import { Badge, EmptyState } from "@/components/ui";
import type { OrderStatus } from "@/generated/prisma/client";
import { formatDate, money } from "@/lib/billing";
import { db } from "@/lib/db";
import { orderStatusLabel } from "@/lib/portal-format";
import { MarkPaidButton } from "./mark-paid-button";

/**
 * Every order across every client.
 *
 * Paynow settles most orders on its own; this page exists for the ones paid by
 * bank transfer, EcoCash direct or cash, where a staff member has to confirm
 * the money arrived before anything is provisioned.
 */

const orderTone: Record<OrderStatus, "amber" | "emerald" | "navy" | "neutral"> = {
  PENDING: "amber",
  PAID: "emerald",
  PROVISIONED: "navy",
  CANCELLED: "neutral",
};

export default async function AdminOrdersPage() {
  const orders = await db.order.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      items: true,
      invoice: { select: { id: true, number: true, status: true } },
      user: { select: { id: true, name: true, email: true, clientRef: true } },
    },
  });

  const pending = orders.filter((o) => o.status === "PENDING");
  const pendingTotal = pending.reduce((sum, o) => sum + o.totalCents, 0);
  const settledTotal = orders
    .filter((o) => o.status === "PAID" || o.status === "PROVISIONED")
    .reduce((sum, o) => sum + o.totalCents, 0);

  return (
    <div className="space-y-6">
      <PortalHeading
        title="Orders"
        description="Every order placed through the shop and checkout, newest first."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Awaiting payment"
          value={money(pendingTotal)}
          detail={`${pending.length} pending orders`}
          tone={pending.length > 0 ? "alert" : "default"}
        />
        <StatCard
          label="Settled"
          value={money(settledTotal)}
          detail="Paid and provisioned"
        />
        <StatCard
          label="Total orders"
          value={orders.length}
          detail="Across all clients"
        />
      </div>

      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Orders placed through the shop or checkout appear here as soon as they are submitted."
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Panel key={order.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <p className="font-display text-lg font-bold">
                      {order.reference}
                    </p>
                    <Badge tone={orderTone[order.status]}>
                      {orderStatusLabel(order.status)}
                    </Badge>
                    {order.invoice && <InvoicePill status={order.invoice.status} />}
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    <Link
                      href={`/admin/clients/${order.user.id}`}
                      className="font-medium transition hover:text-signal-600"
                    >
                      {order.user.name}
                    </Link>{" "}
                    · {order.user.clientRef} · Placed {formatDate(order.createdAt)}
                    {order.invoice ? ` · Invoice ${order.invoice.number}` : ""}
                  </p>
                </div>
                <span className="font-display text-xl font-bold">
                  {money(order.totalCents)}
                </span>
              </div>

              <div className="mt-4 overflow-x-auto border-t border-line pt-4">
                <table className="w-full min-w-[32rem] text-sm">
                  <caption className="sr-only">
                    Line items on order {order.reference}
                  </caption>
                  <thead className="text-left text-xs font-semibold uppercase tracking-wider text-muted">
                    <tr>
                      <th scope="col" className="pb-2">Item</th>
                      <th scope="col" className="pb-2 text-right">Qty</th>
                      <th scope="col" className="pb-2 text-right">Price</th>
                      <th scope="col" className="pb-2 text-right">Line total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-line">
                    {order.items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-2.5">
                          <p className="font-medium">{item.name}</p>
                          {item.detail && (
                            <p className="mt-0.5 text-xs text-muted">
                              {item.detail}
                            </p>
                          )}
                        </td>
                        <td className="py-2.5 text-right text-muted">
                          {item.quantity}
                        </td>
                        <td className="py-2.5 text-right text-muted">
                          {money(item.priceCents)}
                          {item.billingUnit && (
                            <span className="text-xs">/{item.billingUnit}</span>
                          )}
                        </td>
                        <td className="py-2.5 text-right font-medium">
                          {money(item.priceCents * item.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 border-t border-line pt-4 text-sm">
                <div className="flex gap-2">
                  <dt className="text-muted">Subtotal</dt>
                  <dd className="font-medium">{money(order.subtotalCents)}</dd>
                </div>
                {order.discountCents > 0 && (
                  <div className="flex gap-2">
                    <dt className="text-muted">Discount</dt>
                    <dd className="font-medium">−{money(order.discountCents)}</dd>
                  </div>
                )}
                <div className="flex gap-2">
                  <dt className="text-muted">VAT</dt>
                  <dd className="font-medium">{money(order.taxCents)}</dd>
                </div>
                <div className="flex gap-2">
                  <dt className="text-muted">Total</dt>
                  <dd className="font-semibold">{money(order.totalCents)}</dd>
                </div>
              </dl>

              {order.notes && (
                <p className="mt-3 rounded-xl border border-line bg-surface p-4 text-sm whitespace-pre-line">
                  {order.notes}
                </p>
              )}

              {order.status === "PENDING" && (
                <div className="mt-4 border-t border-line pt-4">
                  <MarkPaidButton orderId={order.id} />
                  <p className="mt-2 text-xs text-muted">
                    Only press this once the money has cleared. It settles the
                    invoice, provisions every service on the order and emails the
                    client.
                  </p>
                </div>
              )}
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
