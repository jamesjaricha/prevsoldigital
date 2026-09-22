import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { KbSearch } from "@/components/kb-search";
import { ButtonLink, Container, PageHero, Section } from "@/components/ui";
import {
  articlesIn,
  categoryBySlug,
  kbCategories,
  type KbCategorySlug,
} from "@/content/knowledge-base";

export function generateStaticParams() {
  return kbCategories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(
  props: PageProps<"/knowledge-base/category/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const category = categoryBySlug(slug as KbCategorySlug);
  if (!category) return { title: "Category not found" };
  return {
    title: `${category.name} — Knowledge Base`,
    description: category.blurb,
  };
}

export default async function KbCategoryPage(
  props: PageProps<"/knowledge-base/category/[slug]">,
) {
  const { slug } = await props.params;
  const category = categoryBySlug(slug as KbCategorySlug);
  if (!category) notFound();

  const list = articlesIn(category.slug);

  return (
    <>
      <PageHero
        eyebrow="Knowledge Base"
        title={category.name}
        description={category.blurb}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Knowledge Base", href: "/knowledge-base" },
          { label: category.name },
        ]}
      >
        <div className="max-w-2xl">
          <KbSearch variant="hero" />
        </div>
      </PageHero>

      <Section className="py-12 sm:py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12">
            {/* Articles */}
            <div className="lg:col-span-8">
              <h2 className="font-display text-xl font-bold uppercase tracking-tight">
                {list.length} {list.length === 1 ? "article" : "articles"}
              </h2>

              <ul className="mt-6 space-y-4">
                {list.map((article) => (
                  <li key={article.slug}>
                    <Link
                      href={`/knowledge-base/${article.slug}`}
                      className="block rounded-2xl border border-line bg-background p-5 transition hover:border-signal-300 hover:shadow-card"
                    >
                      <h3 className="font-semibold">{article.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted">
                        {article.excerpt}
                      </p>
                      <p className="mt-3 text-xs text-muted">
                        {article.minutes} min read · Updated {article.updated}
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Other categories */}
            <aside className="lg:col-span-4">
              <div className="rounded-2xl border border-line bg-background p-5 lg:sticky lg:top-28">
                <h2 className="font-display text-sm font-bold uppercase tracking-wider">
                  All categories
                </h2>
                <ul className="mt-4 space-y-1">
                  {kbCategories.map((c) => (
                    <li key={c.slug}>
                      <Link
                        href={`/knowledge-base/category/${c.slug}`}
                        aria-current={c.slug === category.slug ? "page" : undefined}
                        className={
                          c.slug === category.slug
                            ? "flex items-center justify-between rounded-lg bg-navy-950 px-3 py-2.5 text-sm font-semibold text-white"
                            : "flex items-center justify-between rounded-lg px-3 py-2.5 text-sm transition hover:bg-surface"
                        }
                      >
                        {c.name}
                        <span className="text-xs opacity-70">
                          {articlesIn(c.slug).length}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>

                <ButtonLink
                  href="/support/new"
                  variant="outline"
                  size="sm"
                  className="mt-5 w-full"
                >
                  Submit a ticket
                </ButtonLink>
              </div>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
