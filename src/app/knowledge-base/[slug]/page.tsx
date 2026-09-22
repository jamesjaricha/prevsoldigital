import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ButtonLink, Container, PageHero, Section } from "@/components/ui";
import {
  articles,
  articlesIn,
  categoryBySlug,
  getArticle,
  type Block,
} from "@/content/knowledge-base";

export function generateStaticParams() {
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata(
  props: PageProps<"/knowledge-base/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const article = getArticle(slug);
  if (!article) return { title: "Article not found" };
  return { title: article.title, description: article.excerpt };
}

export default async function ArticlePage(
  props: PageProps<"/knowledge-base/[slug]">,
) {
  const { slug } = await props.params;
  const article = getArticle(slug);
  if (!article) notFound();

  const category = categoryBySlug(article.category);
  const siblings = articlesIn(article.category).filter((a) => a.slug !== slug);

  return (
    <>
      <PageHero
        eyebrow={category?.name}
        title={article.title}
        description={article.excerpt}
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Knowledge Base", href: "/knowledge-base" },
          ...(category
            ? [
                {
                  label: category.name,
                  href: `/knowledge-base/category/${category.slug}`,
                },
              ]
            : []),
          { label: article.title },
        ]}
      />

      <Section className="py-12 sm:py-16">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            {/* Body */}
            <article className="lg:col-span-8">
              <p className="text-sm text-muted">
                {article.minutes} min read · Last updated {article.updated}
              </p>

              <div className="mt-8 space-y-5">
                {article.body.map((block, i) => (
                  <ArticleBlock key={i} block={block} />
                ))}
              </div>

              {/* Feedback */}
              <div className="mt-12 rounded-2xl border border-line bg-surface p-6">
                <p className="font-semibold">Was this article helpful?</p>
                <p className="mt-1.5 text-sm text-muted">
                  If it didn&apos;t answer your question, open a ticket and we&apos;ll help
                  directly — and improve the article.
                </p>
                <div className="mt-4 flex flex-wrap gap-3">
                  <ButtonLink href="/support/new" size="sm">
                    Open a ticket
                  </ButtonLink>
                  <ButtonLink href="/knowledge-base" variant="outline" size="sm">
                    Back to knowledge base
                  </ButtonLink>
                </div>
              </div>
            </article>

            {/* Sidebar */}
            <aside className="lg:col-span-4">
              <div className="lg:sticky lg:top-28">
                {siblings.length > 0 && (
                  <div className="rounded-2xl border border-line bg-background p-5">
                    <h2 className="font-display text-sm font-bold uppercase tracking-wider">
                      More in {category?.name}
                    </h2>
                    <ul className="mt-4 space-y-3">
                      {siblings.map((sibling) => (
                        <li key={sibling.slug}>
                          <Link
                            href={`/knowledge-base/${sibling.slug}`}
                            className="group block"
                          >
                            <span className="text-sm font-medium transition group-hover:text-signal-600">
                              {sibling.title}
                            </span>
                            <span className="mt-0.5 block text-xs text-muted">
                              {sibling.minutes} min read
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="mt-5 rounded-2xl border border-line bg-navy-950 p-5 text-white">
                  <h2 className="font-display text-sm font-bold uppercase tracking-wider">
                    Still need help?
                  </h2>
                  <p className="mt-2.5 text-sm text-navy-200">
                    Our team answers standard tickets within one business day.
                  </p>
                  <ButtonLink href="/support/new" size="sm" className="mt-4 w-full">
                    Submit a ticket
                  </ButtonLink>
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}

function ArticleBlock({ block }: { block: Block }) {
  switch (block.kind) {
    case "h":
      return (
        <h2 className="font-display pt-4 text-xl font-bold uppercase tracking-tight">
          {block.text}
        </h2>
      );
    case "p":
      return <p className="leading-relaxed text-muted">{block.text}</p>;
    case "ul":
      return (
        <ul className="space-y-2.5">
          {block.items.map((item) => (
            <li key={item} className="flex items-start gap-3 text-muted">
              <span
                className="mt-2 size-1.5 shrink-0 rounded-full bg-signal-500"
                aria-hidden
              />
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ul>
      );
    case "ol":
      return (
        <ol className="space-y-3">
          {block.items.map((item, i) => (
            <li key={item} className="flex items-start gap-3 text-muted">
              <span className="font-display mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-navy-950 text-xs font-bold text-white">
                {i + 1}
              </span>
              <span className="leading-relaxed">{item}</span>
            </li>
          ))}
        </ol>
      );
    case "note":
      return (
        <div className="rounded-xl border-l-4 border-signal-600 bg-surface px-5 py-4">
          <p className="text-sm leading-relaxed">{block.text}</p>
        </div>
      );
  }
}
