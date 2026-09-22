import type { Metadata } from "next";
import { ContactForm } from "@/components/contact-form";
import {
  ClockIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
  WhatsAppIcon,
} from "@/components/icons";
import { Container, PageHero, Section } from "@/components/ui";
import { brand } from "@/content/brand";

export const metadata: Metadata = {
  title: "Contact Us",
  description: `Contact Prevsol Digital — ${brand.phone}, ${brand.email}, ${brand.address}, ${brand.city}, ${brand.country}.`,
};

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Get in touch"
        title="Contact Us"
        description="Tell us what you're trying to achieve and we'll come back with a scoped, costed proposal — usually within two working days."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact Us" }]}
      />

      <Section className="py-12 sm:py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
            {/* Form */}
            <div className="lg:col-span-7">
              <h2 className="font-display text-2xl font-bold uppercase tracking-tight">
                Send us a message
              </h2>
              <p className="mt-2 text-sm text-muted">
                Fields marked with an asterisk are required.
              </p>
              <div className="mt-8">
                <ContactForm />
              </div>
            </div>

            {/* Details */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-line bg-surface p-7">
                <h2 className="font-display text-lg font-bold uppercase tracking-tight">
                  Contact details
                </h2>

                <ul className="mt-6 space-y-5">
                  <li className="flex items-start gap-3.5">
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-navy-950 text-white">
                      <PhoneIcon className="size-5" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                        Telephone
                      </p>
                      <a
                        href={brand.phoneHref}
                        className="mt-1 block font-semibold transition hover:text-signal-600"
                      >
                        {brand.phone}
                      </a>
                    </div>
                  </li>

                  <li className="flex items-start gap-3.5">
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-navy-950 text-white">
                      <MailIcon className="size-5" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                        Email
                      </p>
                      <a
                        href={`mailto:${brand.email}`}
                        className="mt-1 block font-semibold transition hover:text-signal-600"
                      >
                        {brand.email}
                      </a>
                    </div>
                  </li>

                  <li className="flex items-start gap-3.5">
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-navy-950 text-white">
                      <PinIcon className="size-5" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                        Office
                      </p>
                      <p className="mt-1 font-semibold">
                        {brand.address}
                        <br />
                        {brand.city}, {brand.country}
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start gap-3.5">
                    <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-navy-950 text-white">
                      <ClockIcon className="size-5" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                        Business hours
                      </p>
                      <p className="mt-1 font-semibold">{brand.hours}</p>
                    </div>
                  </li>
                </ul>

                <a
                  href={`https://wa.me/${brand.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-7 flex w-full items-center justify-center gap-2 rounded-lg bg-[#25D366] px-5 py-3 font-semibold text-white transition hover:bg-[#20bd5a]"
                >
                  <WhatsAppIcon className="size-5" />
                  Chat on WhatsApp
                </a>
              </div>

              {/* Map */}
              <div className="mt-6 overflow-hidden rounded-2xl border border-line">
                <iframe
                  title={`Map showing ${brand.name} at ${brand.address}, ${brand.city}`}
                  src="https://www.openstreetmap.org/export/embed.html?bbox=31.06%2C-17.83%2C31.10%2C-17.80&layer=mapnik"
                  className="h-72 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
                <div className="bg-background px-5 py-3.5">
                  <p className="text-sm font-semibold">
                    {brand.address}, {brand.city}
                  </p>
                  <a
                    href="https://www.google.com/maps/search/?api=1&query=11+Armagh+Avenue+Eastlea+Harare"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-sm font-semibold text-signal-600 hover:underline"
                  >
                    Open in Google Maps →
                  </a>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
