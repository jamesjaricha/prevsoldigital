import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ServiceCard } from "@/components/service-card";
import { serviceIcons, CheckIcon, ArrowRightIcon } from "@/components/icons";
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
import { brand } from "@/content/brand";
import { getRelated, getService, services } from "@/content/services";

/** Pre-render every service page at build time. */
export function generateStaticParams() {
  return services.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata(
  props: PageProps<"/services/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const service = getService(slug);
  if (!service) return { title: "Service not found" };
  return {
    title: service.title,
    description: service.summary,
    openGraph: { title: service.title, description: service.summary },
  };
}

export default async function ServicePage(props: PageProps<"/services/[slug]">) {
  const { slug } = await props.params;
  const service = getService(slug);
  if (!service) notFound();

  const Icon = serviceIcons[service.icon];
  const related = getRelated(service);

  return (
    <>
      <PageHero
        eyebrow="Service"
        title={service.title}
        description={service.overview}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Services", href: "/services" },
          { label: service.name },
        ]}
      >
        {/* Service page CTAs — requirements §5 */}
        <div className="flex flex-wrap gap-3">
          <ButtonLink href={`/quote?service=${service.slug}`} size="lg">
            Get a Quote
            <ArrowRightIcon className="size-4" />
          </ButtonLink>
          {service.packages && (
            <ButtonLink href="#packages" variant="inverse" size="lg">
              Order Now
            </ButtonLink>
          )}
          <ButtonLink
            href="/contact"
            size="lg"
            className="border border-white/25 bg-transparent text-white hover:bg-white/10"
          >
            Contact a Consultant
          </ButtonLink>
        </div>
      </PageHero>

      {/* Capabilities + benefits */}
      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-5">
              <span className="inline-flex size-14 items-center justify-center rounded-2xl bg-navy-950 text-white">
                <Icon className="size-7" />
              </span>
              <SectionHeading
                eyebrow="Overview"
                title="What's included"
                description={`Everything we deliver under ${service.name.toLowerCase()}.`}
              />
              <ul className="mt-8 space-y-2.5">
                {service.capabilities.map((capability) => (
                  <li key={capability} className="flex items-start gap-3">
                    <CheckIcon className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                    <span className="text-sm">{capability}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-7">
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight">
                Why it matters
              </h2>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                {service.benefits.map((benefit) => (
                  <div
                    key={benefit.title}
                    className="rounded-2xl border border-line bg-background p-6 shadow-card"
                  >
                    <h3 className="font-display text-base font-bold uppercase tracking-tight">
                      {benefit.title}
                    </h3>
                    <p className="mt-2.5 text-sm leading-relaxed text-muted">
                      {benefit.body}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Packages */}
      {service.packages && (
        <Section id="packages" tone="surface">
          <Container>
            <SectionHeading
              eyebrow="Pricing"
              title="Packages"
              description="Transparent published pricing. Every package can be tailored — request a quote if none of these fit."
              align="center"
            />

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {service.packages.map((pkg) => (
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
                      ${pkg.price.toLocaleString("en-US")}
                    </span>
                    {pkg.per && (
                      <span className="text-sm text-muted">/{pkg.per}</span>
                    )}
                  </p>
                  <div className="mt-6 flex-1">
                    <FeatureList includes={pkg.includes} excludes={pkg.excludes} />
                  </div>
                  <ButtonLink
                    href={`/quote?service=${service.slug}&package=${encodeURIComponent(pkg.name)}`}
                    variant={pkg.featured ? "primary" : "outline"}
                    className="mt-7 w-full"
                  >
                    Order {pkg.name}
                  </ButtonLink>
                </div>
              ))}
            </div>

            {service.pricingNote && (
              <p className="mx-auto mt-8 max-w-3xl text-center text-sm text-muted">
                {service.pricingNote}
              </p>
            )}
          </Container>
        </Section>
      )}

      {/* FAQs */}
      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <SectionHeading
                eyebrow="Questions"
                title="FAQs"
                description={`The questions we're asked most about ${service.name.toLowerCase()}.`}
              />
              <div className="mt-8 rounded-2xl border border-line bg-surface p-6">
                <p className="text-sm font-semibold">Still have a question?</p>
                <p className="mt-2 text-sm text-muted">
                  Call {brand.phone} or send us a message and we will come back
                  to you.
                </p>
                <ButtonLink href="/contact" variant="outline" size="sm" className="mt-4">
                  Contact us
                </ButtonLink>
              </div>
            </div>
            <div className="lg:col-span-8">
              <FaqList faqs={service.faqs} />
            </div>
          </div>
        </Container>
      </Section>

      {/* Related services */}
      {related.length > 0 && (
        <Section tone="surface">
          <Container>
            <div className="flex flex-wrap items-end justify-between gap-6">
              <SectionHeading
                eyebrow="Explore"
                title="Related Services"
                description="Services our clients commonly combine with this one."
              />
              <Link
                href="/services"
                className="pb-2 text-sm font-semibold text-signal-600 hover:text-signal-700"
              >
                View all services →
              </Link>
            </div>
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((r) => (
                <ServiceCard key={r.slug} service={r} />
              ))}
            </div>
          </Container>
        </Section>
      )}

      {/* Closing CTA */}
      <Section>
        <Container>
          <div className="rounded-3xl bg-navy-950 px-6 py-14 text-center text-white sm:px-12">
            <h2 className="font-display mx-auto max-w-2xl text-3xl font-bold uppercase tracking-tight sm:text-4xl">
              Ready to get started with {service.name.toLowerCase()}?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-navy-200">
              Request a quote and we will scope your requirements properly
              before quoting a number.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink href={`/quote?service=${service.slug}`} size="lg">
                Get a Quote
              </ButtonLink>
              <ButtonLink href="/contact" variant="inverse" size="lg">
                Contact a Consultant
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
