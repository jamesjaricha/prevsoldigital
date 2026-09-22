import type { Metadata } from "next";
import { DomainSearchForm } from "@/components/domain-search";
import { DomainResults } from "@/components/domain-results";
import {
  Container,
  FaqList,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/ui";
import { tlds } from "@/content/hosting";
import { searchDomains } from "@/lib/domains";

export const metadata: Metadata = {
  title: "Domain Registration & Search",
  description:
    "Search and register .co.zw, .com, .africa and .tech domains. Registration and renewal pricing shown upfront, with the domain registered in your own name.",
};

const faqs = [
  {
    q: "How quickly does a domain go live?",
    a: "Most extensions are active within fifteen minutes of payment. Some country-code registries, including .co.zw, can take a few hours during busy periods.",
  },
  {
    q: "Who owns the domain I register?",
    a: "You do. We register domains with your organisation as the legal registrant, so you can transfer away at any time without asking our permission.",
  },
  {
    q: "Why is the renewal price different from registration?",
    a: "Some registries discount the first year to attract registrations, then charge the standard rate on renewal. We show both figures before you buy so there are no surprises.",
  },
  {
    q: "Can I transfer a domain I registered elsewhere?",
    a: "Yes. Unlock it at your current registrar, get the authorisation code, and open a ticket. Transfers usually complete within five to seven days and add a year to your registration.",
  },
  {
    q: "Do I need hosting as well as a domain?",
    a: "A domain is just the address; hosting is where the website lives. If you only want to reserve a name for later, a domain on its own is fine.",
  },
];

export default async function DomainsPage(props: PageProps<"/domains">) {
  const params = await props.searchParams;
  const raw = params.q;
  const query = typeof raw === "string" ? raw : Array.isArray(raw) ? raw[0] : "";
  const results = query ? searchDomains(query) : null;

  return (
    <>
      <PageHero
        eyebrow="Domains"
        title="Find Your Perfect Domain"
        description="Search across .co.zw, .com, .africa, .tech and more. Registration and renewal pricing is shown upfront, and every domain is registered in your own name."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Domains" }]}
      >
        <div className="max-w-3xl">
          <DomainSearchForm variant="hero" initialQuery={query} autoFocus={!query} />
        </div>
      </PageHero>

      {results && (
        <Section className="py-12 sm:py-14">
          <Container>
            <DomainResults results={results} />
          </Container>
        </Section>
      )}

      {/* Pricing table */}
      <Section tone={results ? "surface" : "default"}>
        <Container>
          <SectionHeading
            eyebrow="Pricing"
            title="Domain Pricing"
            description="All prices in USD. Renewal pricing applies from the second year onward."
            align="center"
          />

          <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-2xl border border-line bg-background shadow-card">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <caption className="sr-only">
                  Domain extension registration and renewal pricing
                </caption>
                <thead className="bg-navy-950 text-left text-white">
                  <tr>
                    <th scope="col" className="px-5 py-3.5 font-semibold">
                      Extension
                    </th>
                    <th scope="col" className="px-5 py-3.5 font-semibold">
                      Registration
                    </th>
                    <th scope="col" className="px-5 py-3.5 font-semibold">
                      Renewal
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {tlds.map((tld) => (
                    <tr key={tld.ext}>
                      <th
                        scope="row"
                        className="px-5 py-3.5 text-left font-display font-bold"
                      >
                        {tld.ext}
                        {tld.note && (
                          <span className="ml-2 text-xs font-normal text-muted">
                            {tld.note}
                          </span>
                        )}
                      </th>
                      <td className="px-5 py-3.5">${tld.register}/yr</td>
                      <td className="px-5 py-3.5 text-muted">${tld.renew}/yr</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Container>
      </Section>

      <Section tone={results ? "default" : "surface"}>
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="lg:col-span-4">
              <SectionHeading
                eyebrow="Questions"
                title="Domain FAQs"
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
