import Link from "next/link";
import { ButtonLink, Container, Section } from "@/components/ui";

export default function NotFound() {
  return (
    <Section className="py-20 sm:py-28">
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <p className="font-display text-7xl font-bold text-signal-600 sm:text-8xl">
            404
          </p>
          <h1 className="font-display mt-6 text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            Page not found
          </h1>
          <p className="mt-5 text-muted">
            The page you&apos;re looking for has moved or never existed. Here are a
            few places worth trying instead.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ButtonLink href="/" size="lg">
              Back to home
            </ButtonLink>
            <ButtonLink href="/services" variant="outline" size="lg">
              Our services
            </ButtonLink>
            <ButtonLink href="/support" variant="ghost" size="lg">
              Get support
            </ButtonLink>
          </div>

          <div className="mt-12 border-t border-line pt-8">
            <p className="text-sm font-semibold uppercase tracking-wider text-muted">
              Popular pages
            </p>
            <ul className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
              {[
                { label: "Domains", href: "/domains" },
                { label: "Hosting", href: "/hosting" },
                { label: "Shop", href: "/shop" },
                { label: "Data Protection", href: "/data-protection" },
                { label: "Knowledge Base", href: "/knowledge-base" },
                { label: "Client Portal", href: "/portal" },
                { label: "Contact", href: "/contact" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="font-medium text-signal-600 transition hover:underline"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}
