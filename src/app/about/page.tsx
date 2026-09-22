import type { Metadata } from "next";
import { ServiceCard } from "@/components/service-card";
import { CheckIcon } from "@/components/icons";
import {
  ButtonLink,
  Container,
  GridBackdrop,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/ui";
import {
  brand,
  clients,
  industries,
  mission,
  values,
  vision,
  whyChooseUs,
} from "@/content/brand";
import { featuredServices } from "@/content/services";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Prevsol Digital is a technology and digital transformation company delivering ICT solutions and data protection services to organisations across Africa.",
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="Who we are"
        title="About Our Company"
        description="Prevsol Digital is a dynamic technology and digital transformation company committed to helping businesses harness the power of technology to improve efficiency, enhance customer experiences, and achieve sustainable growth."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "About Us" }]}
      />

      {/* Who we are */}
      <Section>
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-7">
              <SectionHeading eyebrow="Our story" title="Who We Are" />
              <div className="mt-8 space-y-5 leading-relaxed text-muted">
                <p>
                  We provide comprehensive Data Protection Services and ICT
                  solutions that enable organizations of all sizes — from
                  startups and SMEs to large enterprises — to thrive in an
                  increasingly digital world. Our expertise spans website
                  development, web hosting, custom software development, digital
                  marketing, cybersecurity, cloud solutions, IT consulting, and
                  data protection consultancy.
                </p>
                <p>
                  At Prevsol Digital, we believe technology should simplify
                  business operations rather than complicate them. Our team
                  combines technical expertise, innovation, and industry best
                  practices to deliver reliable, scalable, and secure solutions
                  tailored to each client&apos;s unique requirements.
                </p>
                <p>
                  We pride ourselves on building long-term partnerships by
                  delivering exceptional service, measurable value, and
                  continuous support.
                </p>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-line bg-surface p-7">
                <h3 className="font-display text-sm font-bold uppercase tracking-wider">
                  At a glance
                </h3>
                <dl className="mt-6 space-y-5">
                  {[
                    { label: "Head office", value: `${brand.address}, ${brand.city}` },
                    { label: "Service lines", value: "10 across ICT and compliance" },
                    { label: "Industries served", value: `${industries.length} sectors` },
                    { label: "Uptime target", value: "99.9% across all hosting" },
                  ].map((item) => (
                    <div key={item.label} className="border-b border-line pb-4 last:border-0 last:pb-0">
                      <dt className="text-xs font-semibold uppercase tracking-wider text-muted">
                        {item.label}
                      </dt>
                      <dd className="font-display mt-1.5 text-lg font-bold">
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* Vision & Mission */}
      <Section tone="navy" className="relative overflow-hidden">
        <GridBackdrop />
        <Container className="relative">
          <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
            <div>
              <SectionHeading
                eyebrow="Where we're going"
                title="Our Vision"
                tone="inverse"
                description={vision}
              />
            </div>
            <div>
              <SectionHeading
                eyebrow="How we get there"
                title="Our Mission"
                tone="inverse"
                description={mission}
              />
            </div>
          </div>
        </Container>
      </Section>

      {/* Values */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="What we stand for"
            title="Our Values"
            align="center"
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((value) => (
              <div
                key={value.name}
                className="rounded-2xl border border-line bg-background p-6 shadow-card"
              >
                <h3 className="font-display text-lg font-bold uppercase tracking-tight text-signal-600 dark:text-signal-400">
                  {value.name}
                </h3>
                <p className="mt-2.5 text-sm leading-relaxed text-muted">
                  {value.body}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      {/* Why choose us */}
      <Section tone="surface">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <SectionHeading
                eyebrow="Why us"
                title={`Why Choose ${brand.name}`}
                description="Ten reasons our clients stay with us — and refer us on."
              />
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

      {/* Expertise */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="Our expertise"
            title="What We Do Best"
            description="Our four core practice areas, each with dedicated specialists."
            align="center"
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredServices.map((service) => (
              <ServiceCard key={service.slug} service={service} />
            ))}
          </div>
        </Container>
      </Section>

      {/* Industries */}
      <Section tone="surface">
        <Container>
          <SectionHeading
            eyebrow="Sectors"
            title="Industries We Serve"
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

      {/* Clients */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="Trusted by"
            title="Companies We Serve"
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

      {/* Commitment CTA */}
      <Section tone="navy" className="relative overflow-hidden">
        <GridBackdrop />
        <Container className="relative text-center">
          <SectionHeading
            eyebrow="Our commitment"
            title="Let's Build Your Digital Future"
            tone="inverse"
            align="center"
            description="At Prevsol Digital, we measure our success by the success of our clients. We are committed to delivering innovative technology solutions that provide measurable business value and building long-term partnerships through reliable expertise and exceptional service."
          />
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/quote" size="lg">
              Request a Quote
            </ButtonLink>
            <ButtonLink href="/contact" variant="inverse" size="lg">
              Contact Us
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  );
}
