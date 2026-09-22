import { redirect } from "next/navigation";
import { ServerIcon } from "@/components/icons";
import { Panel, PortalHeading, StatusPill } from "@/components/portal-ui";
import { ButtonLink, EmptyState } from "@/components/ui";
import { hostingPlans } from "@/content/hosting";
import { getCurrentUser } from "@/lib/auth";
import { formatDate, money } from "@/lib/billing";
import { db } from "@/lib/db";
import { cycleSuffix } from "@/lib/portal-format";

export default async function PortalHostingPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const hosting = await db.service.findMany({
    where: { userId: user.id, type: { in: ["HOSTING", "EMAIL"] } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <PortalHeading
        title="My Hosting"
        description="Hosting and email packages on your account."
        action={
          <ButtonLink href="/hosting" size="sm">
            View hosting plans
          </ButtonLink>
        }
      />

      {hosting.length === 0 ? (
        <EmptyState
          title="No hosting yet"
          description="Choose a plan and we'll provision it the same day."
          action={<ButtonLink href="/hosting">Browse hosting</ButtonLink>}
        />
      ) : (
        <div className="space-y-4">
          {hosting.map((service) => {
            const plan = hostingPlans.find((p) =>
              service.name.toLowerCase().includes(p.name.toLowerCase()),
            );
            return (
              <Panel key={service.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-navy-950 text-white">
                      <ServerIcon className="size-5" />
                    </span>
                    <div>
                      <p className="font-display text-lg font-bold">
                        {service.name}
                      </p>
                      <p className="mt-0.5 text-sm text-muted">
                        {service.detail}
                      </p>
                      <div className="mt-2.5 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted">
                        <span>Since {formatDate(service.registeredAt)}</span>
                        <span>Renews {formatDate(service.nextDueAt)}</span>
                        <span>
                          {money(service.priceCents)}/{cycleSuffix(service.cycle)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <StatusPill status={service.status} />
                    <ButtonLink href="/support/new" variant="outline" size="sm">
                      Open cPanel
                    </ButtonLink>
                  </div>
                </div>

                {/* Usage — illustrative figures until cPanel reporting is wired up. */}
                {plan && (
                  <div className="mt-5 grid gap-4 border-t border-line pt-5 sm:grid-cols-3">
                    {[
                      { label: "Storage", used: 34, detail: `of ${plan.storage}` },
                      { label: "Bandwidth", used: 18, detail: "this month" },
                      { label: "Mailboxes", used: 24, detail: `of ${plan.emailAccounts}` },
                    ].map((usage) => (
                      <div key={usage.label}>
                        <div className="flex items-baseline justify-between">
                          <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                            {usage.label}
                          </p>
                          <p className="text-xs text-muted">{usage.used}%</p>
                        </div>
                        <div
                          className="mt-2 h-2 overflow-hidden rounded-full bg-surface"
                          role="progressbar"
                          aria-valuenow={usage.used}
                          aria-valuemin={0}
                          aria-valuemax={100}
                          aria-label={`${usage.label} usage`}
                        >
                          <div
                            className="h-full rounded-full bg-signal-600"
                            style={{ width: `${usage.used}%` }}
                          />
                        </div>
                        <p className="mt-1.5 text-xs text-muted">{usage.detail}</p>
                      </div>
                    ))}
                  </div>
                )}
              </Panel>
            );
          })}
        </div>
      )}

      <Panel title="Hosting Shortcuts">
        <div className="grid gap-3 sm:grid-cols-3">
          <ButtonLink
            href="/knowledge-base/restoring-a-backup"
            variant="outline"
            size="sm"
          >
            Restore a backup
          </ButtonLink>
          <ButtonLink
            href="/knowledge-base/setting-up-email-on-your-phone"
            variant="outline"
            size="sm"
          >
            Email setup guide
          </ButtonLink>
          <ButtonLink href="/hosting#compare" variant="outline" size="sm">
            Compare and upgrade
          </ButtonLink>
        </div>
      </Panel>
    </div>
  );
}
