import type { Metadata } from "next";
import Link from "next/link";
import {
  CardIcon,
  MailIcon,
  PhoneIcon,
  ServerIcon,
  TicketIcon,
  WhatsAppIcon,
  ArrowRightIcon,
} from "@/components/icons";
import {
  ButtonLink,
  Container,
  FaqList,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/ui";
import { brand } from "@/content/brand";
import { articles, kbCategories } from "@/content/knowledge-base";

export const metadata: Metadata = {
  title: "Support Centre",
  description:
    "Submit a support ticket, browse the knowledge base, or contact technical, billing and sales support at Prevsol Digital.",
};

const departments = [
  {
    name: "Technical Support",
    blurb:
      "Websites, hosting, email, DNS, SSL and anything that has stopped working.",
    icon: ServerIcon,
    href: "/support/new?department=technical",
  },
  {
    name: "Billing Support",
    blurb: "Invoices, payments, renewals, upgrades and account credits.",
    icon: CardIcon,
    href: "/support/new?department=billing",
  },
  {
    name: "Sales Enquiries",
    blurb: "New services, quotes, package changes and consultations.",
    icon: MailIcon,
    href: "/support/new?department=sales",
  },
];

const faqs = [
  {
    q: "How quickly will I get a response?",
    a: "High priority technical tickets are answered within two business hours. Standard tickets are answered within one business day. Billing queries are usually resolved the same day.",
  },
  {
    q: "What are your support hours?",
    a: `${brand.hours}. Professional hosting clients also have 24/7 escalation for outages affecting a live site.`,
  },
  {
    q: "How do I report an urgent outage?",
    a: "Open a ticket marked High priority and call the office number. For live-site outages, calling gets attention fastest.",
  },
  {
    q: "Can I get support over WhatsApp?",
    a: "Yes, for quick questions. Anything requiring investigation should go through a ticket so there is a written record and the right specialist picks it up.",
  },
  {
    q: "What do the ticket statuses mean?",
    a: "Open means received and queued. In Progress means we are working on it. Awaiting Customer means we need something from you. Resolved means fixed — reply within 7 days to reopen. Closed means finished and archived.",
  },
  {
    q: "I've forgotten my portal password. What now?",
    a: "Use the forgot password link on the sign-in page. If the reset email doesn't arrive within ten minutes, check spam and then call us.",
  },
];

export default function SupportPage() {
  return (
    <>
      <PageHero
        eyebrow="Help"
        title="Support Centre"
        description="Open a ticket, search the knowledge base, or speak to someone. Whichever is fastest for what you need."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Support" }]}
      >
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/support/new" size="lg">
            <TicketIcon className="size-4" />
            Submit a Ticket
          </ButtonLink>
          <ButtonLink href="/portal/tickets" variant="inverse" size="lg">
            View Existing Tickets
          </ButtonLink>
          <ButtonLink
            href="/knowledge-base"
            size="lg"
            className="border border-white/25 bg-transparent text-white hover:bg-white/10"
          >
            Knowledge Base
          </ButtonLink>
        </div>
      </PageHero>

      {/* Departments */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="Get in touch"
            title="Choose a Department"
            description="Sending your request to the right team gets it answered faster."
            align="center"
          />

          <div className="mt-12 grid gap-5 lg:grid-cols-3">
            {departments.map((dept) => {
              const Icon = dept.icon;
              return (
                <Link
                  key={dept.name}
                  href={dept.href}
                  className="group rounded-2xl border border-line bg-background p-6 shadow-card transition hover:-translate-y-1 hover:border-signal-300 hover:shadow-card-hover"
                >
                  <span className="inline-flex size-12 items-center justify-center rounded-xl bg-navy-950 text-white transition group-hover:bg-signal-600">
                    <Icon className="size-6" />
                  </span>
                  <h3 className="font-display mt-5 text-lg font-bold uppercase tracking-tight">
                    {dept.name}
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-muted">
                    {dept.blurb}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-signal-600">
                    Open a ticket
                    <ArrowRightIcon className="size-4 transition group-hover:translate-x-1" />
                  </span>
                </Link>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Knowledge base teaser */}
      <Section tone="surface">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              eyebrow="Self-service"
              title="Knowledge Base"
              description={`${articles.length} articles across ${kbCategories.length} categories. Most questions are answered here in under a minute.`}
            />
            <ButtonLink href="/knowledge-base" variant="secondary">
              Browse all articles
            </ButtonLink>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {articles.slice(0, 6).map((article) => (
              <Link
                key={article.slug}
                href={`/knowledge-base/${article.slug}`}
                className="rounded-2xl border border-line bg-background p-5 transition hover:border-signal-300 hover:shadow-card"
              >
                <p className="text-xs font-semibold uppercase tracking-wider text-signal-600">
                  {kbCategories.find((c) => c.slug === article.category)?.name}
                </p>
                <h3 className="mt-2 font-semibold">{article.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  {article.excerpt}
                </p>
                <p className="mt-3 text-xs text-muted">
                  {article.minutes} min read
                </p>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      {/* Direct contact */}
      <Section>
        <Container>
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              {
                icon: PhoneIcon,
                label: "Call us",
                value: brand.phone,
                href: brand.phoneHref,
                note: brand.hours,
              },
              {
                icon: MailIcon,
                label: "Email us",
                value: brand.email,
                href: `mailto:${brand.email}`,
                note: "Replies within one business day",
              },
              {
                icon: WhatsAppIcon,
                label: "WhatsApp",
                value: brand.phone,
                href: `https://wa.me/${brand.whatsapp}`,
                note: "Quick questions during business hours",
              },
            ].map((channel) => {
              const Icon = channel.icon;
              return (
                <a
                  key={channel.label}
                  href={channel.href}
                  className="flex items-start gap-4 rounded-2xl border border-line bg-background p-6 transition hover:border-signal-300 hover:shadow-card"
                >
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-xl bg-surface text-signal-600">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                      {channel.label}
                    </p>
                    <p className="mt-1 font-semibold">{channel.value}</p>
                    <p className="mt-1 text-xs text-muted">{channel.note}</p>
                  </div>
                </a>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* FAQs */}
      <Section id="faqs" tone="surface">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <SectionHeading
                eyebrow="Questions"
                title="Frequently Asked Questions"
              />
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
