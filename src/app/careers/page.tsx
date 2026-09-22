import type { Metadata } from "next";
import { CheckIcon, MailIcon } from "@/components/icons";
import {
  ButtonLink,
  Container,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/ui";
import { brand, values } from "@/content/brand";

export const metadata: Metadata = {
  title: "Careers",
  description: `Join ${brand.name} — open roles in development, data protection, digital marketing and IT support.`,
};

const roles = [
  {
    title: "Full-Stack Developer",
    type: "Full-time",
    location: `${brand.city}, ${brand.country}`,
    blurb:
      "Build client websites and custom business systems across our stack, from database design through to front-end delivery.",
    requirements: [
      "Three or more years building production web applications",
      "Strong JavaScript/TypeScript, plus a server-side language",
      "Comfortable owning a feature end to end",
      "Able to explain technical decisions to non-technical clients",
    ],
  },
  {
    title: "Data Protection Consultant",
    type: "Full-time",
    location: `${brand.city}, ${brand.country}`,
    blurb:
      "Advise clients on compliance with the Cyber and Data Protection Act, run readiness reviews and support POTRAZ inspection preparation.",
    requirements: [
      "Working knowledge of the Cyber and Data Protection Act [Chapter 12:07]",
      "Experience conducting audits, DPIAs or compliance assessments",
      "Confident presenting findings to boards and executives",
      "A relevant privacy or legal qualification is an advantage",
    ],
  },
  {
    title: "Digital Marketing Specialist",
    type: "Full-time",
    location: `${brand.city}, ${brand.country}`,
    blurb:
      "Plan and run campaigns across social and search for a portfolio of retainer clients, and report on what actually converted.",
    requirements: [
      "Two or more years running paid social and search campaigns",
      "Hands-on with content creation and scheduling tools",
      "Comfortable reading analytics and reporting on outcomes",
      "Strong written English",
    ],
  },
  {
    title: "IT Support Technician",
    type: "Full-time",
    location: `${brand.city}, ${brand.country}`,
    blurb:
      "First-line support across hosting, email, domains and client infrastructure, with escalation to our senior engineers.",
    requirements: [
      "Experience with cPanel, DNS, email configuration and SSL",
      "Methodical troubleshooting and clear written communication",
      "Patience — many clients are not technical",
      "Relevant certification is an advantage",
    ],
  },
];

export default function CareersPage() {
  return (
    <>
      <PageHero
        eyebrow="Join us"
        title="Careers"
        description="We're a small team doing serious work for clients who depend on us. If that appeals, we'd like to hear from you."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Careers" }]}
      />

      <Section>
        <Container>
          <SectionHeading
            eyebrow="Open roles"
            title="Current Vacancies"
            description="Don't see your role? We still want to hear from good people — send us your CV."
          />

          <div className="mt-12 space-y-5">
            {roles.map((role) => (
              <div
                key={role.title}
                className="rounded-2xl border border-line bg-background p-6 shadow-card sm:p-7"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="font-display text-xl font-bold uppercase tracking-tight">
                      {role.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-muted">
                      {role.type} · {role.location}
                    </p>
                  </div>
                  <ButtonLink
                    href={`mailto:${brand.email}?subject=${encodeURIComponent(`Application — ${role.title}`)}`}
                    size="sm"
                  >
                    Apply
                  </ButtonLink>
                </div>

                <p className="mt-4 leading-relaxed text-muted">{role.blurb}</p>

                <div className="mt-5 border-t border-line pt-5">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    What we&apos;re looking for
                  </p>
                  <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                    {role.requirements.map((req) => (
                      <li key={req} className="flex items-start gap-2.5 text-sm">
                        <CheckIcon className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="surface">
        <Container>
          <SectionHeading
            eyebrow="How we work"
            title="What We Value"
            align="center"
          />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {values.map((value) => (
              <div
                key={value.name}
                className="rounded-2xl border border-line bg-background p-6"
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

      <Section>
        <Container>
          <div className="rounded-3xl bg-navy-950 px-6 py-14 text-center text-white sm:px-12">
            <h2 className="font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
              No suitable role open?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-navy-200">
              Send us your CV and a short note about what you&apos;d want to work on.
              We keep good applications on file and get in touch when something
              fits.
            </p>
            <ButtonLink
              href={`mailto:${brand.email}?subject=Speculative%20application`}
              size="lg"
              className="mt-8"
            >
              <MailIcon className="size-4" />
              {brand.email}
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  );
}
