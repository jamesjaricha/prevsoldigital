import type { Metadata } from "next";
import { QuoteForm } from "@/components/quote-form";
import { CheckIcon, ClockIcon, ShieldIcon } from "@/components/icons";
import { Container, PageHero, Section } from "@/components/ui";

export const metadata: Metadata = {
  title: "Request a Quote",
  description:
    "Request a scoped, costed quote for website development, software, digital marketing, data protection consultancy, cybersecurity, cloud, IT consulting or hosting.",
};

export default async function QuotePage(props: PageProps<"/quote">) {
  const params = await props.searchParams;
  const service =
    typeof params.service === "string" ? params.service : undefined;
  const pkg = typeof params.package === "string" ? params.package : undefined;

  return (
    <>
      <PageHero
        eyebrow="Get started"
        title="Request a Quote"
        description="Tell us about your project and we'll come back with a scoped proposal and a firm number — usually within two working days."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Request a Quote" }]}
      />

      <Section className="py-12 sm:py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-8">
              <QuoteForm initialService={service} initialPackage={pkg} />
            </div>

            <aside className="lg:col-span-4">
              <div className="rounded-2xl border border-line bg-surface p-7 lg:sticky lg:top-28">
                <h2 className="font-display text-lg font-bold uppercase tracking-tight">
                  What happens next
                </h2>
                <ol className="mt-6 space-y-5">
                  {[
                    {
                      title: "We review your requirements",
                      body: "Usually the same day, and we'll come back with questions if anything is unclear.",
                    },
                    {
                      title: "We scope the work",
                      body: "We define exactly what's included so the number we quote doesn't move later.",
                    },
                    {
                      title: "You get a written proposal",
                      body: "Deliverables, timeline and cost, typically within two working days.",
                    },
                  ].map((step, i) => (
                    <li key={step.title} className="flex gap-3.5">
                      <span className="font-display flex size-7 shrink-0 items-center justify-center rounded-full bg-navy-950 text-xs font-bold text-white">
                        {i + 1}
                      </span>
                      <div>
                        <p className="font-semibold">{step.title}</p>
                        <p className="mt-1 text-sm text-muted">{step.body}</p>
                      </div>
                    </li>
                  ))}
                </ol>

                <ul className="mt-7 space-y-3 border-t border-line pt-6 text-sm">
                  {[
                    { icon: ClockIcon, text: "Response within two working days" },
                    { icon: CheckIcon, text: "No obligation, no pressure" },
                    { icon: ShieldIcon, text: "Your details are never shared" },
                  ].map((item) => {
                    const Icon = item.icon;
                    return (
                      <li key={item.text} className="flex items-center gap-2.5">
                        <Icon className="size-4 shrink-0 text-emerald-600" />
                        {item.text}
                      </li>
                    );
                  })}
                </ul>
              </div>
            </aside>
          </div>
        </Container>
      </Section>
    </>
  );
}
