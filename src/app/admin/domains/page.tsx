import Link from "next/link";
import { GlobeIcon } from "@/components/icons";
import { Panel, PortalHeading, StatCard, StatusPill } from "@/components/portal-ui";
import { EmptyState } from "@/components/ui";
import { formatDate } from "@/lib/billing";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/portal-format";
import { ActivateDomainForm } from "./activate-form";

/**
 * The manual domain queue.
 *
 * `.co.zw` registrations go to ZISPA by email — there is no registrar API to
 * call — so a domain sits PENDING until a staff member has the confirmation
 * back and activates it here. That is the whole reason this page exists.
 */

/**
 * The cutoff for the "expiring soon" count.
 *
 * Kept out of the component so the clock is never read during render, and
 * applied in the query rather than filtered in JSX.
 */
function renewalCutoff() {
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
}

export default async function AdminDomainsPage() {
  const soon = renewalCutoff();

  const [pending, rest, expiringSoon] = await Promise.all([
    db.domain.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "asc" },
      include: {
        user: {
          select: { id: true, name: true, email: true, clientRef: true },
        },
      },
    }),
    db.domain.findMany({
      where: { status: { not: "PENDING" } },
      orderBy: { expiresAt: "asc" },
      take: 300,
      include: {
        user: { select: { id: true, name: true, clientRef: true } },
      },
    }),
    db.domain.count({
      where: { status: { notIn: ["PENDING", "TERMINATED"] }, expiresAt: { lt: soon } },
    }),
  ]);

  const active = rest.filter((d) => d.status === "ACTIVE").length;

  return (
    <div className="space-y-6">
      <PortalHeading
        title="Domains"
        description="Every domain on the system. Pending registrations are worked by hand, oldest first."
      />

      <Panel>
        <div className="flex items-start gap-3">
          <span
            className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-navy-950 text-white"
            aria-hidden
          >
            <GlobeIcon className="size-5" />
          </span>
          <div>
            <h3 className="font-display text-base font-bold uppercase tracking-tight">
              How .co.zw registration works
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              ZISPA, the registry for .co.zw, has no registrar API. Registrations
              and transfers are requested by emailing{" "}
              <a
                href="mailto:admin@zispa.org.zw"
                className="font-semibold text-signal-600 hover:underline"
              >
                admin@zispa.org.zw
              </a>{" "}
              with the domain, the registrant&rsquo;s details and the name
              servers, and confirmation comes back by return email — usually
              within one to two working days. Nothing on this page happens
              automatically. When the registry confirms a domain, activate it
              below: that sets the expiry a year out, notifies the client in the
              portal and emails them.
            </p>
          </div>
        </div>
      </Panel>

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Awaiting registration"
          value={pending.length}
          detail="Sitting in the manual queue"
          tone={pending.length > 0 ? "alert" : "default"}
        />
        <StatCard
          label="Active domains"
          value={active}
          detail="Registered and live"
        />
        <StatCard
          label="Expiring within 30 days"
          value={expiringSoon}
          detail="Renewals to raise with ZISPA"
          tone={expiringSoon > 0 ? "alert" : "default"}
        />
      </div>

      <Panel title={`Manual Queue (${pending.length})`} padded={false}>
        {pending.length === 0 ? (
          <p className="px-5 py-8 text-center text-sm text-muted">
            The queue is clear. Nothing is waiting on ZISPA.
          </p>
        ) : (
          <ul className="divide-y divide-line">
            {pending.map((domain) => (
              <li key={domain.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <p className="font-display text-lg font-bold">
                        {domain.fqdn}
                      </p>
                      <StatusPill status={domain.status} />
                    </div>
                    <p className="mt-1 text-sm text-muted">
                      <Link
                        href={`/admin/clients/${domain.user.id}`}
                        className="font-medium transition hover:text-signal-600"
                      >
                        {domain.user.name}
                      </Link>{" "}
                      · {domain.user.clientRef} ·{" "}
                      <a
                        href={`mailto:${domain.user.email}`}
                        className="transition hover:text-signal-600"
                      >
                        {domain.user.email}
                      </a>
                    </p>
                    <p className="mt-0.5 text-xs text-muted">
                      Ordered {formatDateTime(domain.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="mt-4 border-t border-line pt-4">
                  <ActivateDomainForm domainId={domain.id} fqdn={domain.fqdn} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {rest.length === 0 ? (
        pending.length === 0 && (
          <EmptyState
            title="No domains yet"
            description="Domains ordered through the site appear here for manual registration with ZISPA."
          />
        )
      ) : (
        <Panel title={`Registered Domains (${rest.length})`} padded={false}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[48rem] text-sm">
              <caption className="sr-only">
                Domains already registered, soonest expiry first
              </caption>
              <thead className="border-b border-line text-left text-xs font-semibold uppercase tracking-wider text-muted">
                <tr>
                  <th scope="col" className="px-5 py-3">Domain</th>
                  <th scope="col" className="px-5 py-3">Client</th>
                  <th scope="col" className="px-5 py-3">Status</th>
                  <th scope="col" className="px-5 py-3">Registered</th>
                  <th scope="col" className="px-5 py-3">Expires</th>
                  <th scope="col" className="px-5 py-3">Registrar ref</th>
                  <th scope="col" className="px-5 py-3">Auto-renew</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rest.map((domain) => (
                  <tr key={domain.id}>
                    <th scope="row" className="px-5 py-4 text-left font-semibold">
                      {domain.fqdn}
                    </th>
                    <td className="px-5 py-4">
                      <Link
                        href={`/admin/clients/${domain.user.id}`}
                        className="font-medium transition hover:text-signal-600"
                      >
                        {domain.user.name}
                      </Link>
                      <p className="mt-0.5 text-xs text-muted">
                        {domain.user.clientRef}
                      </p>
                    </td>
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
        </Panel>
      )}
    </div>
  );
}
