import { redirect } from "next/navigation";
import { GlobeIcon } from "@/components/icons";
import { Panel, PortalHeading, StatusPill } from "@/components/portal-ui";
import { ButtonLink, EmptyState } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { formatDate, money } from "@/lib/billing";
import { db } from "@/lib/db";

export default async function PortalDomainsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const domains = await db.domain.findMany({
    where: { userId: user.id },
    orderBy: { expiresAt: "asc" },
  });

  // Renewal pricing comes from the matching DOMAIN service, where one exists.
  const domainServices = domains.length
    ? await db.service.findMany({
        where: {
          userId: user.id,
          type: "DOMAIN",
          name: { in: domains.map((d) => d.fqdn) },
        },
        select: { name: true, priceCents: true },
      })
    : [];
  const renewalPrice = new Map(
    domainServices.map((s) => [s.name, s.priceCents]),
  );

  return (
    <div className="space-y-6">
      <PortalHeading
        title="My Domains"
        description="Domains registered through your account."
        action={
          <ButtonLink href="/domains" size="sm">
            Register a domain
          </ButtonLink>
        }
      />

      {domains.length === 0 ? (
        <EmptyState
          title="No domains yet"
          description="Search for a name and register it in your organisation's own name."
          action={<ButtonLink href="/domains">Search domains</ButtonLink>}
        />
      ) : (
        <div className="space-y-4">
          {domains.map((domain) => {
            const priceCents = renewalPrice.get(domain.fqdn);
            return (
              <Panel key={domain.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-navy-950 text-white">
                      <GlobeIcon className="size-5" />
                    </span>
                    <div>
                      <p className="font-display text-lg font-bold">
                        {domain.fqdn}
                      </p>
                      <p className="mt-0.5 text-sm text-muted">
                        Domain registration · Auto-renew is{" "}
                        {domain.autoRenew ? "on" : "off"}
                      </p>
                      <div className="mt-2.5 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
                        <span>Registered {formatDate(domain.registeredAt)}</span>
                        <span>Expires {formatDate(domain.expiresAt)}</span>
                        {priceCents !== undefined && (
                          <span>{money(priceCents)}/yr renewal</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <StatusPill status={domain.status} />
                    <ButtonLink href="/checkout" size="sm">
                      Renew now
                    </ButtonLink>
                    <ButtonLink href="/support/new" variant="outline" size="sm">
                      Manage DNS
                    </ButtonLink>
                  </div>
                </div>

                {domain.status === "EXPIRING_SOON" && (
                  <p className="mt-4 rounded-lg bg-orange-50 px-4 py-3 text-sm text-orange-900 dark:bg-orange-500/10 dark:text-orange-200">
                    Auto-renew is currently off for this domain. Renew before{" "}
                    {formatDate(domain.expiresAt)} to avoid losing the name —
                    expired domains enter a redemption period that costs
                    considerably more to recover from.
                  </p>
                )}
              </Panel>
            );
          })}
        </div>
      )}

      <Panel title="Need Help With a Domain?">
        <div className="grid gap-3 sm:grid-cols-3">
          <ButtonLink
            href="/knowledge-base/transfer-a-domain-to-prevsol"
            variant="outline"
            size="sm"
          >
            Transfer a domain in
          </ButtonLink>
          <ButtonLink
            href="/knowledge-base/point-your-domain-to-our-hosting"
            variant="outline"
            size="sm"
          >
            Point a domain at hosting
          </ButtonLink>
          <ButtonLink href="/support/new" variant="outline" size="sm">
            Open a support ticket
          </ButtonLink>
        </div>
      </Panel>
    </div>
  );
}
