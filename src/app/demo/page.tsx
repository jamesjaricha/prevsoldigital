import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckIcon, LockIcon, ShieldIcon } from "@/components/icons";
import {
  ButtonLink,
  Container,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/ui";

/**
 * Demo credentials page.
 *
 * Only reachable on the showcase deployment. On production it 404s, so the
 * accounts are never advertised against real data.
 */

export const metadata: Metadata = {
  title: "Demo Access",
  description: "Sign-in details for the Prevsol Digital demonstration site.",
  robots: { index: false, follow: false },
};

const accounts = [
  {
    role: "Client",
    email: "demo@prevsoldigital.com",
    password: "DemoClient2026",
    blurb:
      "A client with live services, invoices, domains and support tickets. Start here to see what a customer sees.",
    href: "/portal",
    cta: "Open the client portal",
  },
  {
    role: "Staff",
    email: "staff@prevsoldigital.com",
    password: "DemoStaff2026",
    blurb:
      "The admin side: incoming enquiries, orders awaiting payment, the manual .co.zw domain queue and the ticket desk.",
    href: "/admin",
    cta: "Open the admin area",
  },
];

const tour = [
  {
    title: "Services, the way you asked for",
    body: "Every service sits in one section on the homepage, and each card opens its own full page with packages, pricing and FAQs.",
    href: "/services",
  },
  {
    title: "Domain search",
    body: "Try any name. Availability, registration and renewal pricing all show inline. .co.zw is handled as a manual request, because ZISPA has no API.",
    href: "/domains",
  },
  {
    title: "Shop and checkout",
    body: "Add something to the cart and walk through checkout. On the demo the order is recorded but no payment is taken.",
    href: "/shop",
  },
  {
    title: "Data protection",
    body: "The POTRAZ readiness page, built around the 1 September 2026 inspection deadline.",
    href: "/data-protection",
  },
];

export default function DemoPage() {
  // Never expose demo accounts on the production deployment.
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") notFound();

  return (
    <>
      <PageHero
        eyebrow="Demonstration site"
        title="Demo Access"
        description="This is a showcase of the Prevsol Digital platform. The data is sample data, payments are disabled, and everything resets periodically."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Demo Access" }]}
      />

      <Section className="py-12 sm:py-16">
        <Container>
          <SectionHeading
            eyebrow="Sign in"
            title="Two Accounts to Try"
            description="Use either set of details on the sign-in page."
          />

          <div className="mt-10 grid gap-6 lg:grid-cols-2">
            {accounts.map((account) => (
              <div
                key={account.role}
                className="rounded-2xl border border-line bg-background p-6 shadow-card sm:p-7"
              >
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex size-10 items-center justify-center rounded-xl bg-navy-950 text-white">
                    {account.role === "Staff" ? (
                      <ShieldIcon className="size-5" />
                    ) : (
                      <LockIcon className="size-5" />
                    )}
                  </span>
                  <h3 className="font-display text-lg font-bold uppercase tracking-tight">
                    {account.role} account
                  </h3>
                </div>

                <p className="mt-4 text-sm leading-relaxed text-muted">
                  {account.blurb}
                </p>

                <dl className="mt-5 space-y-2 rounded-xl bg-surface p-4 text-sm">
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <dt className="w-20 shrink-0 text-muted">Email</dt>
                    <dd className="font-mono font-semibold">{account.email}</dd>
                  </div>
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <dt className="w-20 shrink-0 text-muted">Password</dt>
                    <dd className="font-mono font-semibold">
                      {account.password}
                    </dd>
                  </div>
                </dl>

                <div className="mt-5 flex flex-wrap gap-3">
                  <ButtonLink href="/login" size="sm">
                    Sign in
                  </ButtonLink>
                  <ButtonLink href={account.href} variant="outline" size="sm">
                    {account.cta}
                  </ButtonLink>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="surface">
        <Container>
          <SectionHeading
            eyebrow="Where to look"
            title="Worth a Visit"
            align="center"
          />

          <div className="mx-auto mt-10 grid max-w-4xl gap-4 sm:grid-cols-2">
            {tour.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-line bg-background p-5 transition hover:border-signal-300 hover:shadow-card"
              >
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {item.body}
                </p>
              </a>
            ))}
          </div>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="mx-auto max-w-3xl rounded-2xl border border-line bg-surface p-6 sm:p-8">
            <h2 className="font-display text-lg font-bold uppercase tracking-tight">
              What is different on the demo
            </h2>
            <ul className="mt-5 space-y-3 text-sm">
              {[
                "Payments are disabled. Checkout records an order and raises an invoice, but no money moves and no card or mobile number is charged.",
                "Email is not sent. Forms save normally, but confirmations are logged rather than delivered.",
                "The data is sample data and is periodically reset, so anything you create here is temporary.",
                "Everything else is the real application, running the same code as production.",
              ].map((point) => (
                <li key={point} className="flex items-start gap-3">
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  <span className="text-muted">{point}</span>
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </Section>
    </>
  );
}
