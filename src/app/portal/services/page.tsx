import { redirect } from "next/navigation";
import { Panel, PortalHeading, StatusPill } from "@/components/portal-ui";
import { ButtonLink, EmptyState } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { formatDate, money } from "@/lib/billing";
import { db } from "@/lib/db";
import { cycleSuffix, serviceTypeLabel } from "@/lib/portal-format";

export default async function PortalServicesPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const services = await db.service.findMany({
    where: { userId: user.id },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  return (
    <div className="space-y-6">
      <PortalHeading
        title="My Services"
        description="Everything currently provisioned on your account."
        action={
          <ButtonLink href="/shop" size="sm">
            Order another service
          </ButtonLink>
        }
      />

      {services.length === 0 ? (
        <EmptyState
          title="No services yet"
          description="Once you place an order, everything provisioned on your account appears here."
          action={<ButtonLink href="/shop">Browse the shop</ButtonLink>}
        />
      ) : (
        <Panel padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[44rem] text-sm">
              <caption className="sr-only">All services on your account</caption>
              <thead className="border-b border-line text-left text-xs font-semibold uppercase tracking-wider text-muted">
                <tr>
                  <th scope="col" className="px-5 py-3">Service</th>
                  <th scope="col" className="px-5 py-3">Type</th>
                  <th scope="col" className="px-5 py-3">Status</th>
                  <th scope="col" className="px-5 py-3">Registered</th>
                  <th scope="col" className="px-5 py-3">Next due</th>
                  <th scope="col" className="px-5 py-3 text-right">Price</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {services.map((service) => (
                  <tr key={service.id}>
                    <td className="px-5 py-4">
                      <p className="font-semibold">{service.name}</p>
                      <p className="mt-0.5 text-xs text-muted">
                        {service.detail}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {serviceTypeLabel(service.type)}
                    </td>
                    <td className="px-5 py-4">
                      <StatusPill status={service.status} />
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {formatDate(service.registeredAt)}
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
        </Panel>
      )}

      <Panel title="Service Status Guide">
        <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { status: "ACTIVE" as const, meaning: "Running normally and paid up." },
            { status: "PENDING" as const, meaning: "Ordered, awaiting setup or information from you." },
            { status: "EXPIRING_SOON" as const, meaning: "Renews within 30 days. Check auto-renew." },
            { status: "SUSPENDED" as const, meaning: "Paused, usually for non-payment. Restored on settlement." },
            { status: "TERMINATED" as const, meaning: "Closed. Data retained for 30 days after termination." },
          ].map((item) => (
            <div key={item.status} className="rounded-xl border border-line p-4">
              <dt>
                <StatusPill status={item.status} />
              </dt>
              <dd className="mt-2.5 text-sm text-muted">{item.meaning}</dd>
            </div>
          ))}
        </dl>
      </Panel>
    </div>
  );
}
