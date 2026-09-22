import type { Metadata } from "next";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { CheckIcon, ShieldIcon, ArrowRightIcon } from "@/components/icons";
import {
  Badge,
  ButtonLink,
  Container,
  FaqList,
  FeatureList,
  GridBackdrop,
  Section,
  SectionHeading,
} from "@/components/ui";
import { brand, clients, potraz } from "@/content/brand";
import { getService } from "@/content/services";

export const metadata: Metadata = {
  title: "Data Protection & POTRAZ Compliance",
  description:
    "Data Protection Officer services, POTRAZ inspection readiness, DPIAs, privacy audits and compliance with Zimbabwe's Cyber and Data Protection Act [Chapter 12:07].",
};

/** The specialist service areas listed in requirements §9. */
const serviceAreas = [
  {
    name: "Data Protection Consultancy",
    body: "End-to-end advisory on meeting your obligations under the Cyber and Data Protection Act, scaled to your organisation's size and risk.",
  },
  {
    name: "Data Protection Officer (DPO) Services",
    body: "A qualified, named Data Protection Officer acting for your organisation, without carrying a full-time role on your payroll.",
  },
  {
    name: "Data Protection Compliance",
    body: "Policies, procedures, privacy notices and the documentation an inspector will actually ask to see.",
  },
  {
    name: "Data Controller Licensing Assistance",
    body: "Preparation and submission of your Data Controller Licence application. The deadline passed on 12 March 2025 — unlicensed organisations are already overdue.",
  },
  {
    name: "Data Protection Impact Assessments",
    body: "Structured DPIAs for high-risk processing, completed before the processing begins rather than after a complaint.",
  },
  {
    name: "Privacy Audits",
    body: "Independent assessment of what personal data you actually hold, where it lives and who can reach it.",
  },
  {
    name: "Data Protection Policies and Privacy Notices",
    body: "Drafted for your organisation and written to be understood by the people they apply to.",
  },
  {
    name: "Data Mapping",
    body: "Records of Processing Activities that stay current, mapping every flow of personal data through your organisation.",
  },
  {
    name: "Staff Awareness & Training",
    body: "Training so your team can answer an inspector's questions about their own obligations, not just point at a policy.",
  },
  {
    name: "Privacy-by-Design Advisory",
    body: "Advice at the design stage of new systems and processes, when compliance is cheap rather than retrofitted.",
  },
];

/** The readiness review deliverables from the DPO flyer. */
const reviewDeliverables = [
  "Governance Maturity Assessment",
  "Data Protection Compliance Assessment",
  "Documentation and Records Review",
  "Data Protection Gap Analysis",
  "Executive Risk Assessment",
  "Prioritised Remediation Roadmap",
  "Board and Executive Briefing / Reporting",
  "Capacity Building (Optional)",
];

export default function DataProtectionPage() {
  const service = getService("data-protection")!;

  return (
    <>
      {/* Hero */}
      <div className="relative overflow-hidden bg-navy-950 text-white">
        <GridBackdrop />
        <Container className="relative py-16 sm:py-20 lg:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Badge
                tone="signal"
                className="bg-signal-500/15 text-signal-200 ring-signal-400/30"
              >
                <span className="size-1.5 rounded-full bg-signal-400" aria-hidden />
                {potraz.act}
              </Badge>

              <h1 className="font-display mt-6 text-4xl font-bold uppercase tracking-tight sm:text-5xl lg:text-6xl lg:leading-[1.05]">
                Is your organisation ready for a POTRAZ inspection?
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-relaxed text-navy-200 sm:text-lg">
                Mandatory data protection compliance inspections and assessments
                under the Cyber and Data Protection Act [Chapter 12:07],
                Zimbabwe.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/quote?service=data-protection" size="lg">
                  Request Consultation
                  <ArrowRightIcon className="size-4" />
                </ButtonLink>
                <ButtonLink href="#packages" variant="inverse" size="lg">
                  Get Compliance Assistance
                </ButtonLink>
                <ButtonLink
                  href="/quote?service=data-protection"
                  size="lg"
                  className="border border-white/25 bg-transparent text-white hover:bg-white/10"
                >
                  Request a Quote
                </ButtonLink>
              </div>
            </div>

            {/* Deadline card */}
            <div className="lg:col-span-5">
              <div className="rounded-3xl border border-white/15 bg-white/5 p-7 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-signal-400">
                  Inspections begin
                </p>
                <p className="font-display mt-3 text-4xl font-bold sm:text-5xl">
                  1 September
                </p>
                <p className="font-display text-4xl font-bold sm:text-5xl">2026</p>
                <div className="mt-6 border-t border-white/15 pt-5">
                  <p className="text-sm text-navy-200">
                    The Data Controller Licence deadline passed on{" "}
                    <strong className="font-semibold text-white">
                      {potraz.licenceDeadlinePassed}
                    </strong>
                    .
                  </p>
                </div>
                <div className="mt-5 rounded-xl bg-signal-600/20 p-4 ring-1 ring-signal-400/30">
                  <p className="text-sm text-navy-100">
                    Organisations that are not adequately prepared may face
                    regulatory enforcement, financial penalties, reputational
                    damage and operational disruption.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </div>

      {/* Regulatory readiness */}
      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <SectionHeading
                eyebrow="Regulatory readiness"
                title="What Changes in September 2026"
                description="From 1 September 2026, POTRAZ will commence mandatory risk-based inspections of organisations processing personal information."
              />
              <p className="mt-6 text-sm leading-relaxed text-muted">
                Risk-based means the regulator decides who to inspect and when,
                using the sensitivity and scale of your processing. You will not
                necessarily get notice, and being small is not an exemption.
              </p>

              <div className="mt-8 rounded-2xl border border-line bg-surface p-6">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                  Your Data Protection Officer
                </p>
                <p className="font-display mt-2 text-lg font-bold uppercase">
                  {potraz.officer}
                </p>
                <p className="text-sm text-signal-600 dark:text-signal-400">
                  {potraz.officerTitle}
                </p>
                <p className="mt-3 text-sm leading-relaxed text-muted">
                  Qualified Data Protection Officer, Systems Analyst, Data
                  Analyst and Systems Developer, with three years of industry
                  experience across compliance and technical delivery.
                </p>
              </div>
            </div>

            <div className="lg:col-span-7">
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight">
                Prevsol Digital executive readiness review
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-muted">
                Using the Prevsol Digital Data Protection Governance Review
                Toolkit, we assess your organisation&apos;s governance framework,
                regulatory compliance and operational readiness before
                inspection.
              </p>

              <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                {reviewDeliverables.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 rounded-xl border border-line bg-background px-4 py-3.5"
                  >
                    <CheckIcon className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                    <span className="text-sm font-medium">{item}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap items-center gap-4 rounded-2xl border border-line bg-surface p-6">
                <div className="flex-1">
                  <p className="font-display text-lg font-bold uppercase">
                    POTRAZ Readiness Review
                  </p>
                  <p className="mt-1 text-sm text-muted">
                    One-off executive review, delivered in two to three weeks.
                  </p>
                </div>
                <p className="font-display text-3xl font-bold">$850</p>
                <AddToCartButton
                  item={{
                    id: "potraz-readiness-review",
                    name: "POTRAZ Readiness Review",
                    detail: "One-off executive review",
                    price: 850,
                    per: null,
                    href: "/shop/potraz-readiness-review",
                  }}
                  label="Add to Cart"
                />
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Why Prevsol */}
      <Section tone="navy" className="relative overflow-hidden">
        <GridBackdrop />
        <Container className="relative">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="Our approach"
                title={`Why ${brand.name}`}
                tone="inverse"
                description="Our approach goes beyond compliance by helping Boards and Executive Leadership identify governance risks, strengthen accountability and demonstrate regulatory readiness."
              />
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              {[
                {
                  title: "Board-level, not just IT",
                  body: "Reporting written for directors, who carry the accountability, rather than only for the technical team.",
                },
                {
                  title: "Evidence, not assertions",
                  body: "We assemble the documentary evidence an inspector asks for, because saying you are compliant is not the same as showing it.",
                },
                {
                  title: "Prioritised remediation",
                  body: "A roadmap ordered by risk and effort, so you fix what matters most first rather than everything at once.",
                },
                {
                  title: "Ongoing, not one-off",
                  body: "Compliance is a standing obligation. Our retainers keep your position current as your processing changes.",
                },
              ].map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-white/15 bg-white/5 p-6 backdrop-blur"
                >
                  <h3 className="font-display text-base font-bold uppercase tracking-tight text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-navy-200">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* Service areas */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="Capabilities"
            title="Our Data Protection Services"
            description="Ten specialist areas covering the full compliance lifecycle."
            align="center"
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {serviceAreas.map((area) => (
              <div
                key={area.name}
                className="rounded-2xl border border-line bg-background p-6 shadow-card"
              >
                <span className="inline-flex size-10 items-center justify-center rounded-xl bg-navy-950 text-white">
                  <ShieldIcon className="size-5" />
                </span>
                <h3 className="font-display mt-4 text-base font-bold uppercase tracking-tight">
                  {area.name}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted">
                  {area.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Packages */}
      <Section id="packages" tone="surface">
        <Container>
          <SectionHeading
            eyebrow="Retainers"
            title="DPO Consultancy Packages"
            description="Ongoing outsourced Data Protection Officer support, billed monthly."
            align="center"
          />

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {service.packages?.map((pkg) => (
              <div
                key={pkg.name}
                className={
                  pkg.featured
                    ? "relative flex flex-col rounded-2xl border-2 border-signal-600 bg-background p-7 shadow-card-hover"
                    : "flex flex-col rounded-2xl border border-line bg-background p-7 shadow-card"
                }
              >
                {pkg.featured && (
                  <span className="absolute -top-3 left-7">
                    <Badge tone="signal">Recommended</Badge>
                  </span>
                )}
                <h3 className="font-display text-lg font-bold uppercase tracking-tight">
                  {pkg.name}
                </h3>
                <p className="mt-4">
                  <span className="font-display text-4xl font-bold">
                    ${pkg.price}
                  </span>
                  <span className="text-sm text-muted">/{pkg.per}</span>
                </p>
                <div className="mt-6 flex-1">
                  <FeatureList includes={pkg.includes} excludes={pkg.excludes} />
                </div>
                <AddToCartButton
                  item={{
                    id: `dpo-${pkg.name.toLowerCase()}`,
                    name: `DPO Consultancy — ${pkg.name}`,
                    detail: "Billed monthly",
                    price: pkg.price,
                    per: "mo",
                    href: `/shop/dpo-${pkg.name.toLowerCase()}`,
                  }}
                  label="Order Now"
                  variant={pkg.featured ? "primary" : "outline"}
                  className="mt-7 w-full"
                />
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Clients */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="Track record"
            title="Companies We Serve"
            description="Organisations across healthcare, education, insurance, logistics and contracting that rely on us for data protection."
            align="center"
          />
          <ul className="mx-auto mt-10 flex max-w-5xl flex-wrap justify-center gap-3">
            {clients.map((client) => (
              <li
                key={client}
                className="rounded-xl border border-line bg-background px-5 py-3 font-display text-sm font-bold uppercase tracking-wide text-navy-600 dark:text-navy-300"
              >
                {client}
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {/* FAQs */}
      <Section tone="surface">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <SectionHeading eyebrow="Questions" title="Compliance FAQs" />
            </div>
            <div className="lg:col-span-8">
              <FaqList faqs={service.faqs} />
            </div>
          </div>
        </Container>
      </Section>

      {/* CTA */}
      <Section>
        <Container>
          <div className="rounded-3xl bg-navy-950 px-6 py-14 text-center text-white sm:px-12">
            <h2 className="font-display mx-auto max-w-3xl text-3xl font-bold uppercase tracking-tight sm:text-4xl">
              Is your organisation ready for a POTRAZ inspection?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-navy-200">
              Find out before the regulator does. A readiness review takes two to
              three weeks and tells you exactly where you stand.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/quote?service=data-protection" size="lg">
                Request Consultation
              </ButtonLink>
              <ButtonLink href="/contact" variant="inverse" size="lg">
                Speak to our DPO
              </ButtonLink>
            </div>
            <p className="mt-8 text-sm text-navy-300">
              {brand.phone} · {brand.email}
            </p>
          </div>
        </Container>
      </Section>
    </>
  );
}
