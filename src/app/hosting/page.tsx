import type { Metadata } from "next";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { CheckIcon, ServerIcon } from "@/components/icons";
import {
  Badge,
  ButtonLink,
  Container,
  FaqList,
  FeatureList,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/ui";
import {
  emailPlans,
  hostingComparisonRows,
  hostingPlans,
} from "@/content/hosting";

export const metadata: Metadata = {
  title: "Web Hosting Packages",
  description:
    "Starter, Business and Professional web hosting with free SSL, daily backups, local support and a 99.9% uptime target. Compare plans and order online.",
};

const faqs = [
  {
    q: "Can you migrate my existing website?",
    a: "Yes, and migration is free on annual plans. We copy files, databases and mailboxes, test everything on a staging URL, then switch DNS at a time you choose so there is no downtime during business hours.",
  },
  {
    q: "What happens if I outgrow my plan?",
    a: "Upgrade at any time. The change applies the same day and is prorated against your current billing period, so you only pay the difference for the remaining days.",
  },
  {
    q: "Do you really back up every day?",
    a: "Yes, on every plan including Starter. Retention is 7 days on Starter, 30 on Business and 60 on Professional. Restores are free — just open a ticket.",
  },
  {
    q: "Is SSL really included?",
    a: "Yes. Every plan includes a free SSL certificate that we install and auto-renew. Professional includes a wildcard certificate covering all subdomains.",
  },
  {
    q: "What is your uptime commitment?",
    a: "We target 99.9% monthly uptime across all hosting plans, backed by monitoring that alerts our team before most clients notice a problem.",
  },
  {
    q: "Where are your servers?",
    a: "Our infrastructure is chosen for latency to Zimbabwean and regional visitors. Talk to us if you have a specific data residency requirement — it is a common question for clients with compliance obligations.",
  },
];

export default function HostingPage() {
  return (
    <>
      <PageHero
        eyebrow="Infrastructure"
        title="Web Hosting Packages"
        description="Fast, monitored hosting with free SSL, daily backups and support from a team in your own time zone. Every plan can be upgraded at any time."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Hosting" }]}
      >
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="#plans" size="lg">
            View Plans
          </ButtonLink>
          <ButtonLink href="#compare" variant="inverse" size="lg">
            Compare Hosting Plans
          </ButtonLink>
        </div>
      </PageHero>

      {/* Plan cards */}
      <Section id="plans">
        <Container>
          <SectionHeading
            eyebrow="Plans"
            title="Choose Your Hosting"
            description="Prices in USD. Annual billing works out at two months free compared with paying monthly."
            align="center"
          />

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {hostingPlans.map((plan) => (
              <div
                key={plan.slug}
                className={
                  plan.featured
                    ? "relative flex flex-col rounded-2xl border-2 border-signal-600 bg-background p-7 shadow-card-hover"
                    : "flex flex-col rounded-2xl border border-line bg-background p-7 shadow-card"
                }
              >
                {plan.featured && (
                  <span className="absolute -top-3 left-7">
                    <Badge tone="signal">Most popular</Badge>
                  </span>
                )}

                <div className="flex items-center gap-2.5">
                  <ServerIcon className="size-5 text-signal-600" />
                  <h3 className="font-display text-lg font-bold uppercase tracking-tight">
                    {plan.name}
                  </h3>
                </div>
                <p className="mt-2 text-sm text-muted">{plan.tagline}</p>

                <p className="mt-5">
                  <span className="font-display text-4xl font-bold">
                    ${plan.monthly}
                  </span>
                  <span className="text-sm text-muted">/mo</span>
                </p>
                <p className="mt-1 text-xs text-muted">
                  or ${plan.annual}/year — two months free
                </p>

                <div className="mt-6 flex-1">
                  <FeatureList
                    includes={[
                      plan.storage,
                      plan.bandwidth,
                      plan.emailAccounts,
                      plan.databases,
                      plan.ssl,
                      plan.backups,
                      plan.support,
                      ...plan.extras,
                    ]}
                  />
                </div>

                <div className="mt-7 space-y-2">
                  <AddToCartButton
                    item={{
                      id: `hosting-${plan.slug}`,
                      name: `${plan.name} Hosting`,
                      detail: "Billed monthly",
                      price: plan.monthly,
                      per: "mo",
                      href: `/shop/hosting-${plan.slug}`,
                    }}
                    label="Order Now"
                    variant={plan.featured ? "primary" : "outline"}
                    className="w-full"
                  />
                  <ButtonLink
                    href={`/shop/hosting-${plan.slug}`}
                    variant="ghost"
                    size="sm"
                    className="w-full"
                  >
                    Full details
                  </ButtonLink>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Comparison table */}
      <Section id="compare" tone="surface">
        <Container>
          <SectionHeading
            eyebrow="Side by side"
            title="Compare Hosting Plans"
            description="Every specification, in one table."
            align="center"
          />

          <div className="mt-12 overflow-hidden rounded-2xl border border-line bg-background shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[42rem] text-sm">
                <caption className="sr-only">
                  Hosting plan feature comparison
                </caption>
                <thead>
                  <tr className="bg-navy-950 text-white">
                    <th
                      scope="col"
                      className="px-5 py-4 text-left font-semibold"
                    >
                      Feature
                    </th>
                    {hostingPlans.map((plan) => (
                      <th
                        key={plan.slug}
                        scope="col"
                        className="px-5 py-4 text-left font-semibold"
                      >
                        {plan.name}
                        {plan.featured && (
                          <span className="ml-2 rounded-full bg-signal-600 px-2 py-0.5 text-[0.65rem] uppercase">
                            Popular
                          </span>
                        )}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  <tr className="bg-surface/50">
                    <th scope="row" className="px-5 py-4 text-left font-semibold">
                      Monthly price
                    </th>
                    {hostingPlans.map((plan) => (
                      <td key={plan.slug} className="px-5 py-4">
                        <span className="font-display text-xl font-bold">
                          ${plan.monthly}
                        </span>
                        <span className="text-xs text-muted">/mo</span>
                      </td>
                    ))}
                  </tr>
                  {hostingComparisonRows.map((row) => (
                    <tr key={row.key}>
                      <th
                        scope="row"
                        className="px-5 py-4 text-left font-medium"
                      >
                        {row.label}
                      </th>
                      {hostingPlans.map((plan) => (
                        <td key={plan.slug} className="px-5 py-4 text-muted">
                          {String(plan[row.key])}
                        </td>
                      ))}
                    </tr>
                  ))}
                  <tr>
                    <th scope="row" className="px-5 py-4 text-left font-medium">
                      Free domain
                    </th>
                    {hostingPlans.map((plan) => (
                      <td key={plan.slug} className="px-5 py-4">
                        {plan.extras.some((e) => e.includes("Free domain")) ? (
                          <CheckIcon className="size-5 text-emerald-600" />
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                        <span className="sr-only">
                          {plan.extras.some((e) => e.includes("Free domain"))
                            ? "Included"
                            : "Not included"}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th scope="row" className="px-5 py-4 text-left font-medium">
                      Staging environment
                    </th>
                    {hostingPlans.map((plan) => (
                      <td key={plan.slug} className="px-5 py-4">
                        {plan.extras.includes("Staging environment") ? (
                          <CheckIcon className="size-5 text-emerald-600" />
                        ) : (
                          <span className="text-muted">—</span>
                        )}
                        <span className="sr-only">
                          {plan.extras.includes("Staging environment")
                            ? "Included"
                            : "Not included"}
                        </span>
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <th scope="row" className="px-5 py-4 text-left" />
                    {hostingPlans.map((plan) => (
                      <td key={plan.slug} className="px-5 py-4">
                        <ButtonLink
                          href={`/shop/hosting-${plan.slug}`}
                          variant={plan.featured ? "primary" : "outline"}
                          size="sm"
                        >
                          Order Now
                        </ButtonLink>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Container>
      </Section>

      {/* Email hosting */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="Business email"
            title="Email Hosting"
            description="Professional email on your own domain, with free domain hosting for the first year."
            align="center"
          />

          <div className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-2">
            {emailPlans.map((plan) => (
              <div
                key={plan.slug}
                className={
                  plan.featured
                    ? "relative flex flex-col rounded-2xl border-2 border-signal-600 bg-background p-7 shadow-card-hover"
                    : "flex flex-col rounded-2xl border border-line bg-background p-7 shadow-card"
                }
              >
                {plan.featured && (
                  <span className="absolute -top-3 left-7">
                    <Badge tone="signal">Best value</Badge>
                  </span>
                )}
                <h3 className="font-display text-lg font-bold uppercase tracking-tight">
                  {plan.name}
                </h3>
                <p className="mt-4">
                  <span className="font-display text-4xl font-bold">
                    ${plan.price}
                  </span>
                  <span className="text-sm text-muted">/{plan.per}</span>
                </p>
                <div className="mt-6 flex-1">
                  <FeatureList
                    includes={[plan.accounts, plan.storage, ...plan.includes]}
                  />
                </div>
                <AddToCartButton
                  item={{
                    id:
                      plan.slug === "email-cozw"
                        ? "email-hosting-cozw"
                        : "email-hosting-com",
                    name: `Email Hosting — ${plan.name}`,
                    detail: "Billed annually",
                    price: plan.price,
                    per: "yr",
                    href: `/shop/${plan.slug === "email-cozw" ? "email-hosting-cozw" : "email-hosting-com"}`,
                  }}
                  label="Order Now"
                  variant={plan.featured ? "primary" : "outline"}
                  className="mt-7 w-full"
                />
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* FAQs */}
      <Section tone="surface">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <SectionHeading eyebrow="Questions" title="Hosting FAQs" />
            </div>
            <div className="lg:col-span-8">
              <FaqList faqs={faqs} />
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
