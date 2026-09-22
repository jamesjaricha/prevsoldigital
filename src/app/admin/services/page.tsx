import Link from "next/link";
import { Panel, PortalHeading, StatCard } from "@/components/portal-ui";
import { EmptyState } from "@/components/ui";
import { formatDate, money } from "@/lib/billing";
import { db } from "@/lib/db";
import { cycleSuffix, serviceTypeLabel } from "@/lib/portal-format";
import { ServiceStatusForm } from "./status-form";

/**
 * Every service across every client, pending first.
 *
 * Provisioning writes services as PENDING; a staff member moves them to Active
 * once hosting is set up, which is what notifies the client.
 */

export default async function AdminServicesPage() {
  const services = await db.service.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    take: 300,
    include: {
      user: { select: { id: true, name: true, clientRef: true } },
    },
  });

  const pending = services.filter((s) => s.status === "PENDING").length;
  const active = services.filter((s) => s.status === "ACTIVE");
  const monthlyRecurring = active
    .filter((s) => s.cycle === "MONTHLY")
    .reduce((sum, s) => sum + s.priceCents, 0);

  return (
    <div className="space-y-6">
      <PortalHeading
        title="Services"
        description="Everything provisioned across all client accounts. Pending services appear first — they are waiting on setup."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Awaiting setup"
          value={pending}
          detail="Provisioned but not yet live"
          tone={pending > 0 ? "alert" : "default"}
        />
        <StatCard
          label="Active services"
          value={active.length}
          detail="Running normally"
        />
        <StatCard
          label="Monthly recurring"
          value={money(monthlyRecurring)}
          detail="Active monthly services"
        />
      </div>

      {services.length === 0 ? (
        <EmptyState
          title="No services yet"
          description="Services are created automatically when an order is marked paid and provisioned."
        />
      ) : (
        <Panel padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[56rem] text-sm">
              <caption className="sr-only">Services across all clients</caption>
              <thead className="border-b border-line text-left text-xs font-semibold uppercase tracking-wider text-muted">
                <tr>
                  <th scope="col" className="px-5 py-3">Service</th>
                  <th scope="col" className="px-5 py-3">Client</th>
                  <th scope="col" className="px-5 py-3">Type</th>
                  <th scope="col" className="px-5 py-3">Next due</th>
                  <th scope="col" className="px-5 py-3 text-right">Price</th>
                  <th scope="col" className="px-5 py-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {services.map((service) => (
                  <tr key={service.id}>
                    <td className="px-5 py-4">
                      <p className="font-semibold">{service.name}</p>
                      {service.detail && (
                        <p className="mt-0.5 text-xs text-muted">
                          {service.detail}
                        </p>
                      )}
                      <p className="mt-0.5 text-xs text-muted">
                        Registered {formatDate(service.registeredAt)}
                      </p>
                    </td>
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/clients/${service.user.id}`}
                        className="font-medium transition hover:text-signal-600"
                      >
                        {service.user.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted">
                        {service.user.clientRef}
                      </p>
                    </td>
                    <td className="px-5 py-4 text-muted">
                      {serviceTypeLabel(service.type)}
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
                    <td className="px-5 py-4">
                      <ServiceStatusForm
                        serviceId={service.id}
                        status={service.status}
                      />
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
