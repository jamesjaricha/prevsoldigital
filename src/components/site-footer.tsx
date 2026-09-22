/**
 * Site footer — requirements doc §19.
 * Company / Services / Support / Legal columns, social icons, contact details,
 * newsletter subscription and copyright.
 */

import Link from "next/link";
import { brand } from "@/content/brand";
import { MailIcon, PhoneIcon, PinIcon, ClockIcon } from "./icons";
import { Logo } from "./logo";
import { Container, inputClass, cx } from "./ui";

const columns = [
  {
    heading: "Company",
    links: [
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Careers", href: "/careers" },
      { label: "Terms & Conditions", href: "/legal/terms" },
    ],
  },
  {
    heading: "Services",
    links: [
      { label: "Web Development", href: "/services/website-design-development" },
      { label: "Hosting", href: "/hosting" },
      { label: "Domains", href: "/domains" },
      { label: "Cybersecurity", href: "/services/data-protection" },
      { label: "Digital Marketing", href: "/services/digital-marketing" },
      { label: "Data Protection", href: "/data-protection" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Support Centre", href: "/support" },
      { label: "Knowledge Base", href: "/knowledge-base" },
      { label: "Submit Ticket", href: "/support/new" },
      { label: "FAQs", href: "/support#faqs" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "/legal/privacy" },
      { label: "Cookie Policy", href: "/legal/cookies" },
      { label: "Terms of Service", href: "/legal/terms" },
      { label: "Refund Policy", href: "/legal/refunds" },
      { label: "Data Protection Notice", href: "/legal/data-protection-notice" },
    ],
  },
];

const socials = [
  { label: "Facebook", href: "https://facebook.com", path: "M13.5 21v-7.5h2.5l.4-2.9h-2.9V8.7c0-.84.23-1.41 1.44-1.41h1.54V4.68A20.6 20.6 0 0 0 14.24 4.5c-2.22 0-3.74 1.36-3.74 3.85v2.15H8v2.9h2.5V21Z" },
  { label: "LinkedIn", href: "https://linkedin.com", path: "M6.94 8.5H4.25V20h2.69Zm.18-3.06A1.56 1.56 0 1 0 5.6 7 1.55 1.55 0 0 0 7.12 5.44ZM20 13.4c0-3.1-1.66-4.55-3.87-4.55a3.34 3.34 0 0 0-3 1.66h-.06V8.5H10.5V20h2.69v-5.7c0-1.5.29-2.96 2.15-2.96s1.87 1.72 1.87 3.05V20H20Z" },
  { label: "Instagram", href: "https://instagram.com", path: "M12 4.5c2.44 0 2.73.01 3.7.05.89.04 1.37.19 1.69.31.42.17.73.36 1.05.68s.51.63.68 1.05c.12.32.27.8.31 1.69.04.97.05 1.26.05 3.7s-.01 2.73-.05 3.7c-.04.89-.19 1.37-.31 1.69a2.8 2.8 0 0 1-.68 1.05c-.32.32-.63.51-1.05.68-.32.12-.8.27-1.69.31-.97.04-1.26.05-3.7.05s-2.73-.01-3.7-.05c-.89-.04-1.37-.19-1.69-.31a2.8 2.8 0 0 1-1.05-.68 2.8 2.8 0 0 1-.68-1.05c-.12-.32-.27-.8-.31-1.69C4.51 14.73 4.5 14.44 4.5 12s.01-2.73.05-3.7c.04-.89.19-1.37.31-1.69.17-.42.36-.73.68-1.05s.63-.51 1.05-.68c.32-.12.8-.27 1.69-.31.97-.04 1.26-.05 3.7-.05Zm0 4.05A3.45 3.45 0 1 0 15.45 12 3.45 3.45 0 0 0 12 8.55Zm0 5.69A2.24 2.24 0 1 1 14.24 12 2.24 2.24 0 0 1 12 14.24Zm4.39-5.83a.81.81 0 1 0-.81-.8.81.81 0 0 0 .81.8Z" },
  { label: "X", href: "https://x.com", path: "m13.8 10.6 5.5-6.4h-1.3l-4.8 5.6-3.8-5.6H5l5.8 8.4-5.8 6.7h1.3l5-5.9 4 5.9h4.4Zm-1.8 2.1-.6-.8-4.6-6.6h2l3.7 5.3.6.8 4.8 6.9h-2Z" },
];

export function SiteFooter() {
  return (
    <footer className="mt-auto bg-navy-950 text-navy-200">
      <Container className="py-14 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Brand + contact */}
          <div className="lg:col-span-4">
            <Logo tone="inverse" height={42} />
            <p className="mt-5 max-w-sm text-sm leading-relaxed">
              A full-service digital agency specialising in data protection,
              website development, hosting, system development, domain
              registration, digital marketing and branding.
            </p>

            <ul className="mt-6 space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <PhoneIcon className="mt-0.5 size-4 shrink-0 text-signal-400" />
                <a href={brand.phoneHref} className="hover:text-white">
                  {brand.phone}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MailIcon className="mt-0.5 size-4 shrink-0 text-signal-400" />
                <a href={`mailto:${brand.email}`} className="hover:text-white">
                  {brand.email}
                </a>
              </li>
              <li className="flex items-start gap-3">
                <PinIcon className="mt-0.5 size-4 shrink-0 text-signal-400" />
                <span>
                  {brand.address}, {brand.city}, {brand.country}
                </span>
              </li>
              <li className="flex items-start gap-3">
                <ClockIcon className="mt-0.5 size-4 shrink-0 text-signal-400" />
                <span>{brand.hours}</span>
              </li>
            </ul>
          </div>

          {/* Link columns */}
          <div className="grid gap-8 sm:grid-cols-2 lg:col-span-5 lg:grid-cols-4 lg:gap-6">
            {columns.map((col) => (
              <div key={col.heading}>
                <h2 className="font-display text-sm font-bold uppercase tracking-wider text-white">
                  {col.heading}
                </h2>
                <ul className="mt-4 space-y-2.5 text-sm">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="transition hover:text-white">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-3">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-white">
              Newsletter
            </h2>
            <p className="mt-4 text-sm leading-relaxed">
              Compliance deadlines, technology updates and offers. No more than
              once a month.
            </p>
            <form
              className="mt-4 space-y-2"
              action="/contact"
              aria-label="Newsletter subscription"
            >
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                name="email"
                type="email"
                required
                placeholder="you@company.co.zw"
                className={cx(
                  inputClass,
                  "border-navy-700 bg-navy-900 text-white placeholder:text-navy-500",
                )}
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-signal-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-signal-700"
              >
                Subscribe
              </button>
            </form>

            <div className="mt-6 flex gap-2">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="rounded-lg border border-navy-700 p-2 transition hover:border-signal-500 hover:bg-navy-900 hover:text-white"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="size-4" aria-hidden>
                    <path d={s.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-navy-800 pt-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {brand.name}. All rights reserved.
          </p>
          <p className="text-navy-400">
            {brand.tagline} · Registered in {brand.country}
          </p>
        </div>
      </Container>
    </footer>
  );
}
