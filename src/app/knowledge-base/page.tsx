import type { Metadata } from "next";
import Link from "next/link";
import { KbSearch } from "@/components/kb-search";
import { kbIcons } from "@/components/icons";
import {
  ButtonLink,
  Container,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/ui";
import { articles, articlesIn, kbCategories } from "@/content/knowledge-base";

export const metadata: Metadata = {
  title: "Knowledge Base",
  description:
    "Self-service help articles covering domains, hosting, email setup, website management, billing, payments, cybersecurity, data protection and troubleshooting.",
};

export default function KnowledgeBasePage() {
  return (
    <>
      <PageHero
        eyebrow="Self-service"
        title="How can we help you?"
        description={`${articles.length} articles across ${kbCategories.length} categories, written to answer the question rather than describe the feature.`}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Knowledge Base" }]}
      >
        <div className="max-w-2xl">
          <KbSearch variant="hero" />
        </div>
      </PageHero>

      {/* Categories */}
      <Section>
        <Container>
          <SectionHeading
            eyebrow="Browse"
            title="Categories"
            align="center"
          />

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
            {kbCategories.map((category) => {
              const Icon = kbIcons[category.icon as keyof typeof kbIcons];
              const count = articlesIn(category.slug).length;
              return (
                <Link
                  key={category.slug}
                  href={`/knowledge-base/category/${category.slug}`}
                  className="group rounded-2xl border border-line bg-background p-5 shadow-card transition hover:-translate-y-1 hover:border-signal-300 hover:shadow-card-hover"
                >
                  <span className="inline-flex size-11 items-center justify-center rounded-xl bg-navy-950 text-white transition group-hover:bg-signal-600">
                    {Icon && <Icon className="size-5" />}
                  </span>
                  <h3 className="font-display mt-4 text-base font-bold uppercase tracking-tight">
                    {category.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {category.blurb}
                  </p>
                  <p className="mt-3 text-xs font-semibold text-signal-600">
                    {count} {count === 1 ? "article" : "articles"}
                  </p>
                </Link>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Popular articles */}
      <Section tone="surface">
        <Container>
          <SectionHeading
            eyebrow="Most read"
            title="Popular Articles"
            align="center"
          />

          <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2">
            {[
              "potraz-inspection-readiness",
              "my-website-is-down",
              "setting-up-email-on-your-phone",
              "enabling-two-factor-authentication",
              "payment-methods-we-accept",
              "migrating-your-website-to-us",
            ].map((slug) => {
              const article = articles.find((a) => a.slug === slug);
              if (!article) return null;
              const category = kbCategories.find(
                (c) => c.slug === article.category,
              );
              return (
                <Link
                  key={slug}
                  href={`/knowledge-base/${slug}`}
                  className="rounded-2xl border border-line bg-background p-5 transition hover:border-signal-300 hover:shadow-card"
                >
                  <p className="text-xs font-semibold uppercase tracking-wider text-signal-600">
                    {category?.name}
                  </p>
                  <h3 className="mt-2 font-semibold">{article.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">
                    {article.excerpt}
                  </p>
                  <p className="mt-3 text-xs text-muted">
                    {article.minutes} min read · Updated {article.updated}
                  </p>
                </Link>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* Still stuck */}
      <Section>
        <Container>
          <div className="rounded-3xl bg-navy-950 px-6 py-14 text-center text-white sm:px-12">
            <h2 className="font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
              Didn&apos;t find your answer?
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-navy-200">
              Open a ticket and a specialist will pick it up — usually within one
              business day, and within two hours for anything urgent.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <ButtonLink href="/support/new" size="lg">
                Submit a Ticket
              </ButtonLink>
              <ButtonLink href="/contact" variant="inverse" size="lg">
                Contact Us
              </ButtonLink>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
