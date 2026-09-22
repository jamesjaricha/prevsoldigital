import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, PageHero, Section } from "@/components/ui";
import { legalBySlug, legalPages } from "@/content/legal";

export function generateStaticParams() {
  return legalPages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  props: PageProps<"/legal/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const page = legalBySlug.get(slug);
  if (!page) return { title: "Not found" };
  return { title: page.title, description: page.summary };
}

export default async function LegalPage(props: PageProps<"/legal/[slug]">) {
  const { slug } = await props.params;
  const page = legalBySlug.get(slug);
  if (!page) notFound();

  return (
    <>
      <PageHero
        eyebrow="Legal"
        title={page.title}
        description={page.summary}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: page.title }]}
      />

      <Section className="py-12 sm:py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Contents */}
            <aside className="lg:col-span-3">
              <div className="lg:sticky lg:top-28">
                <h2 className="font-display text-sm font-bold uppercase tracking-wider">
                  On this page
                </h2>
                <ul className="mt-4 space-y-2">
                  {page.sections.map((section) => (
                    <li key={section.heading}>
                      <a
                        href={`#${slugify(section.heading)}`}
                        className="text-sm text-muted transition hover:text-signal-600"
                      >
                        {section.heading}
                      </a>
                    </li>
                  ))}
                </ul>

                <div className="mt-8 border-t border-line pt-6">
                  <h2 className="font-display text-sm font-bold uppercase tracking-wider">
                    Other policies
                  </h2>
                  <ul className="mt-4 space-y-2">
                    {legalPages
                      .filter((p) => p.slug !== page.slug)
                      .map((p) => (
                        <li key={p.slug}>
                          <Link
                            href={`/legal/${p.slug}`}
                            className="text-sm text-muted transition hover:text-signal-600"
                          >
                            {p.title}
                          </Link>
                        </li>
                      ))}
                  </ul>
                </div>
              </div>
            </aside>

            {/* Body */}
            <article className="lg:col-span-9">
              <p className="text-sm text-muted">Last updated {page.updated}</p>

              <div className="mt-8 space-y-10">
                {page.sections.map((section) => (
                  <section key={section.heading} id={slugify(section.heading)}>
                    <h2 className="font-display text-xl font-bold uppercase tracking-tight">
                      {section.heading}
                    </h2>
                    <div className="mt-4 space-y-4">
                      {section.paragraphs.map((paragraph, i) => (
                        <p key={i} className="leading-relaxed text-muted">
                          {paragraph}
                        </p>
                      ))}
                    </div>
                  </section>
                ))}
              </div>

              <div className="mt-12 rounded-2xl border border-line bg-surface p-6">
                <p className="text-sm text-muted">
                  These policies are provided as a starting point and should be
                  reviewed by a qualified legal practitioner before being relied
                  upon. Questions?{" "}
                  <Link
                    href="/contact"
                    className="font-semibold text-signal-600 hover:underline"
                  >
                    Get in touch
                  </Link>
                  .
                </p>
              </div>
            </article>
          </div>
        </Container>
      </Section>
    </>
  );
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
