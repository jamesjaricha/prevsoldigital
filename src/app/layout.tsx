import type { Metadata } from "next";
import { Inter, Oswald } from "next/font/google";
import { brand } from "@/content/brand";
import { DemoBanner } from "@/components/demo-banner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { CartProvider } from "@/lib/store";
import { SessionProvider } from "@/lib/session-context";
import { getCurrentUser } from "@/lib/auth";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/** Condensed display face, matching the company profile headings. */
const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(brand.url),
  title: {
    default: `${brand.name} — Technology, Security & Compliance`,
    template: `%s | ${brand.name}`,
  },
  description:
    "Prevsol Digital delivers ICT solutions, website development, hosting, custom software, digital marketing and data protection consultancy across Zimbabwe and Africa.",
  keywords: [
    "web hosting Zimbabwe",
    "domain registration Zimbabwe",
    "website development Harare",
    "data protection consultancy",
    "POTRAZ compliance",
    "Cyber and Data Protection Act",
    "DPO services Zimbabwe",
    "digital marketing Harare",
  ],
  openGraph: {
    type: "website",
    siteName: brand.name,
    locale: "en_ZW",
    title: `${brand.name} — Technology, Security & Compliance`,
    description:
      "ICT solutions, digital transformation and data protection consultancy for organisations across Africa.",
  },
  robots: { index: true, follow: true },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const user = await getCurrentUser();

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${inter.variable} ${oswald.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <SessionProvider
          user={
            user
              ? {
                  id: user.id,
                  name: user.name,
                  email: user.email,
                  company: user.company,
                  clientRef: user.clientRef,
                }
              : null
          }
        >
          <CartProvider>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-lg focus:bg-navy-950 focus:px-4 focus:py-2 focus:text-white"
            >
              Skip to content
            </a>
            <DemoBanner />
            <SiteHeader />
            <main id="main" className="flex-1">
              {children}
            </main>
            <SiteFooter />
            <WhatsAppButton />
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
