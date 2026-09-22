import type { Metadata } from "next";
import { ShopBrowser } from "@/components/shop-browser";
import { Container, PageHero, Section } from "@/components/ui";
import { categories, products } from "@/content/products";

export const metadata: Metadata = {
  title: "Shop ICT Products & Services",
  description:
    "Buy websites, hosting, domains, digital marketing retainers, video production, data protection retainers and branding online from Prevsol Digital.",
};

export default async function ShopPage(props: PageProps<"/shop">) {
  const params = await props.searchParams;
  const asString = (v: string | string[] | undefined) =>
    typeof v === "string" ? v : Array.isArray(v) ? v[0] : undefined;

  return (
    <>
      <PageHero
        eyebrow="Shop"
        title="ICT Products & Services"
        description="Everything we offer, purchasable online. Filter by category, sort by price, and check out in a few steps."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Shop" }]}
      />

      <Section className="py-10 sm:py-12">
        <Container>
          <ShopBrowser
            products={products}
            categories={categories}
            initialCategory={asString(params.category)}
            initialQuery={asString(params.q)}
            initialSort={asString(params.sort)}
          />
        </Container>
      </Section>
    </>
  );
}
