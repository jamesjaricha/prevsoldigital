import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCartButton, BuyNowButton } from "@/components/add-to-cart-button";
import { ProductCard, ProductPattern } from "@/components/product-card";
import { CheckIcon, ShieldIcon, ClockIcon, ArrowRightIcon } from "@/components/icons";
import {
  Badge,
  Breadcrumbs,
  ButtonLink,
  Container,
  Section,
  SectionHeading,
  Stars,
} from "@/components/ui";
import {
  categories,
  formatPrice,
  getProduct,
  products,
  relatedProducts,
} from "@/content/products";
import { getService } from "@/content/services";

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  props: PageProps<"/shop/[slug]">,
): Promise<Metadata> {
  const { slug } = await props.params;
  const product = getProduct(slug);
  if (!product) return { title: "Product not found" };
  return {
    title: product.name,
    description: product.summary,
    openGraph: { title: product.name, description: product.summary },
  };
}

export default async function ProductPage(props: PageProps<"/shop/[slug]">) {
  const { slug } = await props.params;
  const product = getProduct(slug);
  if (!product) notFound();

  const category = categories.find((c) => c.slug === product.category);
  const service = product.service ? getService(product.service) : undefined;
  const related = relatedProducts(product);

  const cartItem = {
    id: product.slug,
    name: product.name,
    detail: product.per
      ? `Billed ${product.per === "mo" ? "monthly" : product.per === "yr" ? "annually" : `per ${product.per}`}`
      : "One-off purchase",
    price: product.price,
    per: product.per,
    href: `/shop/${product.slug}`,
  };

  return (
    <>
      <div className="border-b border-line bg-surface py-5">
        <Container>
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Shop", href: "/shop" },
              ...(category
                ? [{ label: category.name, href: `/shop?category=${category.slug}` }]
                : []),
              { label: product.name },
            ]}
          />
        </Container>
      </div>

      <Section className="py-10 sm:py-14">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Visual */}
            <div className="lg:col-span-5">
              <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-navy-950">
                <ProductPattern seed={product.slug} />
                {product.badge && (
                  <span className="absolute top-4 left-4">
                    <Badge
                      tone={product.badge === "Best value" ? "signal" : "emerald"}
                    >
                      {product.badge}
                    </Badge>
                  </span>
                )}
              </div>

              <ul className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  { icon: ShieldIcon, label: "Secure checkout" },
                  { icon: ClockIcon, label: "Fast turnaround" },
                  { icon: CheckIcon, label: "Local support" },
                ].map(({ icon: Icon, label }) => (
                  <li
                    key={label}
                    className="flex items-center gap-2 rounded-xl border border-line bg-background px-3 py-2.5 text-xs font-medium"
                  >
                    <Icon className="size-4 shrink-0 text-signal-600" />
                    {label}
                  </li>
                ))}
              </ul>
            </div>

            {/* Detail */}
            <div className="lg:col-span-7">
              {category && (
                <Link
                  href={`/shop?category=${category.slug}`}
                  className="text-sm font-semibold text-signal-600 hover:text-signal-700"
                >
                  {category.name}
                </Link>
              )}

              <h1 className="font-display mt-2 text-3xl font-bold uppercase tracking-tight sm:text-4xl">
                {product.name}
              </h1>

              <Stars
                rating={product.rating}
                reviews={product.reviews}
                className="mt-3"
              />

              <p className="mt-5 text-base leading-relaxed text-muted">
                {product.description}
              </p>

              <div className="mt-7 flex items-end gap-3">
                <p className="font-display text-4xl font-bold">
                  {formatPrice(product.price, product.per)}
                </p>
                {product.compareAt && (
                  <p className="pb-1.5 text-lg text-muted line-through">
                    ${product.compareAt}
                  </p>
                )}
              </div>
              <p className="mt-1 text-sm text-muted">
                {product.per === "mo"
                  ? "Billed monthly. Cancel or change at any time."
                  : product.per === "yr"
                    ? "Billed annually."
                    : product.per === "hr"
                      ? "Charged per hour. Transport is quoted separately."
                      : "One-off payment."}
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <AddToCartButton item={cartItem} size="lg" variant="outline" />
                <BuyNowButton item={cartItem} size="lg" />
                <ButtonLink
                  href={`/quote${service ? `?service=${service.slug}` : ""}`}
                  variant="ghost"
                  size="lg"
                >
                  Get a Quote
                </ButtonLink>
              </div>

              {/* Included */}
              <div className="mt-9 rounded-2xl border border-line bg-surface p-6">
                <h2 className="font-display text-sm font-bold uppercase tracking-wider">
                  What&apos;s included
                </h2>
                <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
                  {product.includes.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm">
                      <CheckIcon className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {service && (
                <Link
                  href={`/services/${service.slug}`}
                  className="group mt-6 flex items-center justify-between gap-4 rounded-2xl border border-line bg-background p-5 transition hover:border-signal-300 hover:shadow-card"
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                      Part of
                    </p>
                    <p className="font-display mt-1 text-base font-bold uppercase">
                      {service.name}
                    </p>
                    <p className="mt-1 text-sm text-muted">{service.summary}</p>
                  </div>
                  <ArrowRightIcon className="size-5 shrink-0 text-signal-600 transition group-hover:translate-x-1" />
                </Link>
              )}
            </div>
          </div>
        </Container>
      </Section>

      {related.length > 0 && (
        <Section tone="surface">
          <Container>
            <SectionHeading
              eyebrow="You may also need"
              title="Related Products"
            />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}
