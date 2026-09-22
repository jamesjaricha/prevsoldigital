import Link from "next/link";
import { DomainSearchForm } from "@/components/domain-search";
import { ProductCard } from "@/components/product-card";
import { ServiceCard } from "@/components/service-card";
import {
  ArrowRightIcon,
  CheckIcon,
  ShieldIcon,
  ServerIcon,
  CartIcon,
  SearchIcon,
} from "@/components/icons";
import {
  ArrowLink,
  ButtonLink,
  Container,
  GridBackdrop,
  Section,
  SectionHeading,
  Badge,
} from "@/components/ui";
import { brand, clients, heroCopy, potraz, whyChooseUs } from "@/content/brand";
import { featuredProducts } from "@/content/products";
import { services } from "@/content/services";
import { hostingPlans } from "@/content/hosting";

export default function HomePage() {
  return (
    <>
      <Hero />
      <ClientStrip />
      <ServicesSection />
      <ComplianceBanner />
      <FeaturedProducts />
      <HostingTeaser />
      <WhyChooseUs />
      <ClosingCta />
    </>
  );
}

/* ------------------------------------------------------------------- hero */

function Hero() {
  return (
    <div className="relative overflow-hidden bg-navy-950 text-white">
      <GridBackdrop />
      <Container className="relative py-16 sm:py-20 lg:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Badge tone="signal" className="bg-signal-500/15 text-signal-200 ring-signal-400/30">
              <span className="size-1.5 rounded-full bg-signal-400" aria-hidden />
              Data protection · ICT · Digital transformation
            </Badge>

            <h1 className="font-display mt-6 text-4xl font-bold uppercase tracking-tight sm:text-5xl lg:text-6xl lg:leading-[1.05]">
              {heroCopy.headline}
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-navy-200 sm:text-lg">
              {heroCopy.supporting}
            </p>

            {/* Hero CTAs — requirements §4 */}
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/services" size="lg">
                Explore Our Services
                <ArrowRightIcon className="size-4" />
              </ButtonLink>
              <ButtonLink href="/shop" variant="inverse" size="lg">
                <CartIcon className="size-4" />
                Shop ICT Solutions
              </ButtonLink>
              <ButtonLink
                href="/domains"
                size="lg"
                className="border border-white/25 bg-transparent text-white hover:bg-white/10"
              >
                <SearchIcon className="size-4" />
                Search Domains
              </ButtonLink>
              <ButtonLink
                href="/quote"
                size="lg"
                className="border border-white/25 bg-transparent text-white hover:bg-white/10"
              >
                Get a Quote
              </ButtonLink>
            </div>

            <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-white/15 pt-8">
              {[
                { value: "99.9%", label: "Uptime target" },
                { value: "10+", label: "Service lines" },
                { value: "24/7", label: "Escalation" },
              ].map((stat) => (
                <div key={stat.label}>
                  <dt className="sr-only">{stat.label}</dt>
                  <dd>
                    <span className="font-display block text-3xl font-bold">
                      {stat.value}
                    </span>
                    <span className="mt-1 block text-xs text-navy-300">
                      {stat.label}
                    </span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Domain search card */}
          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur sm:p-8">
              <h2 className="font-display text-xl font-bold uppercase tracking-tight">
                Find your perfect domain
              </h2>
              <p className="mt-2 text-sm text-navy-200">
                Check availability across .co.zw, .com, .africa and more.
              </p>
              <div className="mt-5">
                <DomainSearchForm variant="hero" />
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}

/* ---------------------------------------------------------------- clients */

function ClientStrip() {
  return (
    <div className="border-b border-line bg-surface py-8">
      <Container>
        <p className="text-center text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          Trusted by organisations across Zimbabwe
        </p>
        <ul className="mt-5 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 sm:gap-x-12">
          {clients.map((client) => (
            <li
              key={client}
              className="font-display text-sm font-bold uppercase tracking-wide text-navy-400 dark:text-navy-500"
            >
              {client}
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}

/* --------------------------------------------------------------- services */

/**
 * All services in a single section. Each card links through to that
 * service's own dedicated page — the pattern the client asked for.
 */
function ServicesSection() {
  return (
    <Section id="services">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="What we do"
            title="Our Services"
            description="Ten service lines covering everything from your first website to full regulatory compliance. Select any service to see packages, pricing and frequently asked questions."
          />
          <ArrowLink href="/services" className="pb-2">
            View all services
          </ArrowLink>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <ServiceCard key={service.slug} service={service} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* ------------------------------------------------------------- compliance */

function ComplianceBanner() {
  return (
    <Section tone="navy" className="relative overflow-hidden">
      <GridBackdrop />
      <Container className="relative">
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <Badge tone="signal" className="bg-signal-500/15 text-signal-200 ring-signal-400/30">
              Regulatory deadline
            </Badge>
            <h2 className="font-display mt-5 text-3xl font-bold uppercase tracking-tight sm:text-4xl">
              Is your organisation ready for a POTRAZ inspection?
            </h2>
            <p className="mt-5 max-w-2xl text-navy-200">
              From {potraz.inspectionsBegin}, POTRAZ commences mandatory
              risk-based inspections of organisations processing personal
              information. Organisations that are not adequately prepared may
              face regulatory enforcement, financial penalties, reputational
              damage and operational disruption.
            </p>
            <p className="mt-3 text-sm text-navy-300">
              The Data Controller Licence deadline passed on{" "}
              {potraz.licenceDeadlinePassed}.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/data-protection" size="lg">
                Check your readiness
                <ArrowRightIcon className="size-4" />
              </ButtonLink>
              <ButtonLink href="/quote?service=data-protection" variant="inverse" size="lg">
                Request a consultation
              </ButtonLink>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="rounded-3xl border border-white/15 bg-white/5 p-7 backdrop-blur">
              <div className="flex items-center gap-3">
                <span className="inline-flex size-11 items-center justify-center rounded-xl bg-signal-600">
                  <ShieldIcon className="size-6" />
                </span>
                <div>
                  <p className="font-display font-bold uppercase">
                    Executive readiness review
                  </p>
                  <p className="text-xs text-navy-300">
                    Governance · Compliance · Operations
                  </p>
                </div>
              </div>
              <ul className="mt-6 space-y-3 text-sm">
                {[
                  "Governance maturity assessment",
                  "Data protection compliance assessment",
                  "Documentation and records review",
                  "Data protection gap analysis",
                  "Executive risk assessment",
                  "Prioritised remediation roadmap",
                  "Board and executive briefing",
                ].map((item) => (
                  <li key={item} className="flex gap-3">
                    <CheckIcon className="mt-0.5 size-4 shrink-0 text-emerald-400" />
                    <span className="text-navy-100">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </Section>
  );
}

/* ---------------------------------------------------------------- products */

function FeaturedProducts() {
  return (
    <Section tone="surface">
      <Container>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Buy online"
            title="Featured Products & Services"
            description="Order directly, or add to your cart and check out in a few steps."
          />
          <ArrowLink href="/shop" className="pb-2">
            Browse the full shop
          </ArrowLink>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {featuredProducts.slice(0, 8).map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </Container>
    </Section>
  );
}

/* ---------------------------------------------------------------- hosting */

function HostingTeaser() {
  return (
    <Section>
      <Container>
        <SectionHeading
          eyebrow="Infrastructure"
          title="Hosting Built for Business"
          description="Free SSL, daily backups and local support on every plan. Upgrade at any time — changes are prorated and applied the same day."
          align="center"
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {hostingPlans.map((plan) => (
            <div
              key={plan.slug}
              className={
                plan.featured
                  ? "relative rounded-2xl border-2 border-signal-600 bg-background p-7 shadow-card-hover"
                  : "rounded-2xl border border-line bg-background p-7 shadow-card"
              }
            >
              {plan.featured && (
                <span className="absolute -top-3 left-7">
                  <Badge tone="signal">Most popular</Badge>
                </span>
              )}
              <div className="flex items-center gap-2.5">
                <ServerIcon className="size-5 text-signal-600" />
                <h3 className="font-display text-lg font-bold uppercase">
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
              <ul className="mt-6 space-y-3 text-sm">
                {[plan.storage, plan.bandwidth, plan.emailAccounts, plan.backups].map(
                  (feature) => (
                    <li key={feature} className="flex gap-3">
                      <CheckIcon className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                      {feature}
                    </li>
                  ),
                )}
              </ul>
              <ButtonLink
                href={`/shop/hosting-${plan.slug}`}
                variant={plan.featured ? "primary" : "outline"}
                className="mt-7 w-full"
              >
                Order Now
              </ButtonLink>
            </div>
          ))}
        </div>

        <p className="mt-8 text-center text-sm text-muted">
          Need to compare in detail?{" "}
          <Link
            href="/hosting#compare"
            className="font-semibold text-signal-600 underline underline-offset-2 hover:text-signal-700"
          >
            Compare all hosting plans
          </Link>
        </p>
      </Container>
    </Section>
  );
}

/* --------------------------------------------------------------------- why */

function WhyChooseUs() {
  return (
    <Section tone="surface">
      <Container>
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHeading
              eyebrow="Why us"
              title={`Why Choose ${brand.name}?`}
              description="We build long-term partnerships, not one-off projects. Our clients stay because the work holds up and the support answers."
            />
            <ButtonLink href="/about" variant="secondary" className="mt-8">
              More about our company
            </ButtonLink>
          </div>

          <div className="lg:col-span-7">
            <ul className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
              {whyChooseUs.map((reason) => (
                <li
                  key={reason}
                  className="flex items-start gap-3 rounded-xl border border-line bg-background px-4 py-3.5"
                >
                  <CheckIcon className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                  <span className="text-sm font-medium">{reason}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}

/* --------------------------------------------------------------------- cta */

function ClosingCta() {
  return (
    <Section tone="navy" className="relative overflow-hidden">
      <GridBackdrop />
      <Container className="relative text-center">
        <h2 className="font-display mx-auto max-w-3xl text-3xl font-bold uppercase tracking-tight sm:text-4xl lg:text-5xl">
          Transform, secure and grow your business with {brand.name}
        </h2>
        <p className="mx-auto mt-6 max-w-2xl text-navy-200">
          Tell us what you are trying to achieve and we will come back with a
          scoped, costed proposal — usually within two working days.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/quote" size="lg">
            Request a Quote
            <ArrowRightIcon className="size-4" />
          </ButtonLink>
          <ButtonLink href="/contact" variant="inverse" size="lg">
            Talk to a Consultant
          </ButtonLink>
        </div>
        <p className="mt-8 text-sm text-navy-300">
          Or call{" "}
          <a href={brand.phoneHref} className="font-semibold text-white hover:underline">
            {brand.phone}
          </a>{" "}
          during business hours.
        </p>
      </Container>
    </Section>
  );
}
