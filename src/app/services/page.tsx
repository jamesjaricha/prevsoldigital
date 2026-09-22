import type { Metadata } from "next";
import { ServiceCard } from "@/components/service-card";
import {
  ButtonLink,
  Container,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/ui";
import { industries } from "@/content/brand";
import { services } from "@/content/services";

export const metadata: Metadata = {
  title: "Our Services",
  description:
    "ICT solutions, website development, hosting, custom software, digital marketing, data protection consultancy, cloud, e-commerce and branding services from Prevsol Digital.",
};

export default function ServicesPage() {
  return (
    <>
      <PageHero
        eyebrow="What we do"
        title="Our Services"
        description="Ten service lines covering everything from your first website to full regulatory compliance. Each service has its own page with capabilities, packages, pricing and answers to the questions clients ask most."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
      />

      <Section>
        <Container>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <ServiceCard key={service.slug} service={service} />
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="surface">
        <Container>
          <SectionHeading
            eyebrow="Sectors"
            title="Industries We Serve"
            description="We work across the public and private sector, from single-site startups to multi-branch enterprises."
            align="center"
          />
          <ul className="mx-auto mt-10 flex max-w-4xl flex-wrap justify-center gap-2.5">
            {industries.map((industry) => (
              <li
                key={industry}
                className="rounded-full border border-line bg-background px-4 py-2 text-sm font-medium"
              >
                {industry}
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section>
        <Container>
          <div className="rounded-3xl bg-navy-950 px-6 py-14 text-center text-white sm:px-12">
            <h2 className="font-display mx-auto max-w-2xl text-3xl font-bold uppercase tracking-tight sm:text-4xl">
              Not sure which service you need?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-navy-200">
              Tell us the problem rather than the solution. We will tell you what
              it would actually take to fix it, and quote against that.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/quote" size="lg">
                Request a Quote
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
