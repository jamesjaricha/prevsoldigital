import type { Metadata } from "next";
import Link from "next/link";
import {
  Container,
  EmptyState,
  ButtonLink,
  PageHero,
  Section,
} from "@/components/ui";
import { articles, kbCategories } from "@/content/knowledge-base";
import { products, formatPrice } from "@/content/products";
import { services } from "@/content/services";

export const metadata: Metadata = {
  title: "Search",
  description: "Search services, products, and help articles across Prevsol Digital.",
};

export default async function SearchPage(props: PageProps<"/search">) {
  const params = await props.searchParams;
  const raw = params.q;
  const query = (typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "")
    .trim();
  const q = query.toLowerCase();

  const matchedServices = q
    ? services.filter((s) =>
        [s.name, s.summary, s.overview, ...s.capabilities]
          .join(" ")
          .toLowerCase()
          .includes(q),
      )
    : [];

  const matchedProducts = q
    ? products.filter((p) =>
        [p.name, p.summary, p.description, ...p.includes]
          .join(" ")
          .toLowerCase()
          .includes(q),
      )
    : [];

  const matchedArticles = q
    ? articles.filter((a) =>
        [
          a.title,
          a.excerpt,
          ...a.body.flatMap((b) =>
            b.kind === "ul" || b.kind === "ol" ? b.items : [b.text],
          ),
        ]
          .join(" ")
          .toLowerCase()
          .includes(q),
      )
    : [];

  const total =
    matchedServices.length + matchedProducts.length + matchedArticles.length;

  return (
    <>
      <PageHero
        eyebrow="Search"
        title={query ? `Results for “${query}”` : "Search"}
        description={
          query
            ? `${total} ${total === 1 ? "result" : "results"} across services, products and help articles.`
            : "Search our services, products and knowledge base."
        }
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Search" }]}
      />

      <Section className="py-12 sm:py-16">
        <Container>
          {!query ? (
            <EmptyState
              title="What are you looking for?"
              description="Use the search icon in the header to search services, products, domains and help articles."
              action={<ButtonLink href="/services">Browse our services</ButtonLink>}
            />
          ) : total === 0 ? (
            <EmptyState
              title="Nothing matched"
              description={`We couldn't find anything for “${query}”. Try a different term, or get in touch and we'll point you in the right direction.`}
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  <ButtonLink href="/contact">Contact us</ButtonLink>
                  <ButtonLink href="/knowledge-base" variant="outline">
                    Browse knowledge base
                  </ButtonLink>
                </div>
              }
            />
          ) : (
            <div className="space-y-12">
              {matchedServices.length > 0 && (
                <section>
                  <h2 className="font-display text-xl font-bold uppercase tracking-tight">
                    Services ({matchedServices.length})
                  </h2>
                  <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {matchedServices.map((s) => (
                      <li key={s.slug}>
                        <Link
                          href={`/services/${s.slug}`}
                          className="block h-full rounded-2xl border border-line bg-background p-5 transition hover:border-signal-300 hover:shadow-card"
                        >
                          <p className="font-display font-bold uppercase">
                            {s.name}
                          </p>
                          <p className="mt-2 text-sm text-muted">{s.summary}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {matchedProducts.length > 0 && (
                <section>
                  <h2 className="font-display text-xl font-bold uppercase tracking-tight">
                    Products ({matchedProducts.length})
                  </h2>
                  <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {matchedProducts.map((p) => (
                      <li key={p.slug}>
                        <Link
                          href={`/shop/${p.slug}`}
                          className="block h-full rounded-2xl border border-line bg-background p-5 transition hover:border-signal-300 hover:shadow-card"
                        >
                          <p className="font-display font-bold uppercase">
                            {p.name}
                          </p>
                          <p className="mt-2 text-sm text-muted">{p.summary}</p>
                          <p className="font-display mt-3 text-lg font-bold">
                            {formatPrice(p.price, p.per)}
                          </p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {matchedArticles.length > 0 && (
                <section>
                  <h2 className="font-display text-xl font-bold uppercase tracking-tight">
                    Help articles ({matchedArticles.length})
                  </h2>
                  <ul className="mt-5 grid gap-4 sm:grid-cols-2">
                    {matchedArticles.map((a) => (
                      <li key={a.slug}>
                        <Link
                          href={`/knowledge-base/${a.slug}`}
                          className="block h-full rounded-2xl border border-line bg-background p-5 transition hover:border-signal-300 hover:shadow-card"
                        >
                          <p className="text-xs font-semibold uppercase tracking-wider text-signal-600">
                            {kbCategories.find((c) => c.slug === a.category)?.name}
                          </p>
                          <p className="mt-1.5 font-semibold">{a.title}</p>
                          <p className="mt-2 text-sm text-muted">{a.excerpt}</p>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
