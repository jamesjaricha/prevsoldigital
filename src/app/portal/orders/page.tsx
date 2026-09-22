import { redirect } from "next/navigation";
import { Panel, PortalHeading, InvoicePill } from "@/components/portal-ui";
import { ButtonLink, EmptyState } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { formatDate, money } from "@/lib/billing";
import { db } from "@/lib/db";
import { serviceTypeLabel } from "@/lib/portal-format";

export default async function PortalOrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const [orders, services] = await Promise.all([
    db.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      include: { items: true, invoice: true },
    }),
    db.service.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: { id: true, name: true, type: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PortalHeading
        title="Orders"
        description="Every order placed on your account."
        action={
          <ButtonLink href="/shop" size="sm">
            Place a new order
          </ButtonLink>
        }
      />

      {orders.length === 0 ? (
        <EmptyState
          title="No orders yet"
          description="Orders you place through the shop or checkout appear here."
          action={<ButtonLink href="/shop">Browse the shop</ButtonLink>}
        />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Panel key={order.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-display text-lg font-bold">
                    {order.reference}
                  </p>
                  <p className="mt-0.5 text-sm text-muted">
                    Placed {formatDate(order.createdAt)}
                    {order.invoice ? ` · Invoice ${order.invoice.number}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {order.invoice && <InvoicePill status={order.invoice.status} />}
                  <span className="font-display text-xl font-bold">
                    {money(order.totalCents)}
                  </span>
                </div>
              </div>

              <ul className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm text-muted">
                {order.items.map((item) => (
                  <li key={item.id} className="flex items-start gap-2">
                    <span
                      className="mt-1.5 size-1 shrink-0 rounded-full bg-signal-500"
                      aria-hidden
                    />
                    {item.name}
                    {item.quantity > 1 ? ` × ${item.quantity}` : ""}
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-wrap gap-2">
                {order.invoice && (
                  <ButtonLink
                    href={`/portal/invoices/${order.invoice.id}`}
                    variant="outline"
                    size="sm"
                  >
                    View invoice
                  </ButtonLink>
                )}
                {order.invoice && order.invoice.status !== "PAID" && (
                  <ButtonLink href="/checkout" size="sm">
                    Pay now
                  </ButtonLink>
                )}
              </div>
            </Panel>
          ))}
        </div>
      )}

      {services.length > 0 && (
        <Panel title="Provisioned From These Orders">
          <ul className="grid gap-2.5 sm:grid-cols-2">
            {services.map((service) => (
              <li
                key={service.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-line px-4 py-3 text-sm"
              >
                <span className="font-medium">{service.name}</span>
                <span className="text-xs text-muted">
                  {serviceTypeLabel(service.type)}
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      )}
    </div>
  );
}
