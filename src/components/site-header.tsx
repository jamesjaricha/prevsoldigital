"use client";

/**
 * Main site navigation — requirements doc §3.
 * Home | Services | Domains | Hosting | Shop | Data Protection | Support |
 * About Us | Contact Us | Client Portal, plus search, cart, account and
 * a Get a Quote button. Stays accessible while scrolling.
 */

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { services } from "@/content/services";
import { useCart } from "@/lib/store";
import { useSession } from "@/lib/session-context";
import {
  CartIcon,
  ChevronDownIcon,
  CloseIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
} from "./icons";
import { LogoLink } from "./logo";
import { ButtonLink, Container, cx, inputClass } from "./ui";

type NavItem = { label: string; href: string; children?: { label: string; href: string; blurb?: string }[] };

const nav: NavItem[] = [
  { label: "Home", href: "/" },
  {
    label: "Services",
    href: "/services",
    children: services.map((s) => ({
      label: s.name,
      href: `/services/${s.slug}`,
      blurb: s.summary,
    })),
  },
  { label: "Domains", href: "/domains" },
  { label: "Hosting", href: "/hosting" },
  { label: "Shop", href: "/shop" },
  { label: "Data Protection", href: "/data-protection" },
  {
    label: "Support",
    href: "/support",
    children: [
      { label: "Support Centre", href: "/support", blurb: "Submit and track tickets" },
      { label: "Knowledge Base", href: "/knowledge-base", blurb: "Self-service help articles" },
      { label: "FAQs", href: "/support#faqs", blurb: "Common questions answered" },
      { label: "Submit a Ticket", href: "/support/new", blurb: "Open a new support request" },
    ],
  },
  { label: "About Us", href: "/about" },
  { label: "Contact Us", href: "/contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const { count, ready } = useCart();
  const session = useSession();

  // Menus record the route they were opened on, so navigating anywhere closes
  // them without an effect syncing state to `pathname`.
  const [openedOn, setOpenedOn] = useState<{
    mobile: string | null;
    search: string | null;
  }>({ mobile: null, search: null });

  const mobileOpen = openedOn.mobile === pathname;
  const searchOpen = openedOn.search === pathname;

  const setMobileOpen = (open: boolean) =>
    setOpenedOn((s) => ({ ...s, mobile: open ? pathname : null }));
  const setSearchOpen = (open: boolean) =>
    setOpenedOn((s) => ({ ...s, search: open ? pathname : null }));

  // Lock body scroll behind the mobile drawer.
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      {/* Utility strip */}
      <div className="hidden border-b border-line bg-navy-950 text-navy-200 lg:block">
        <Container className="flex h-9 items-center justify-between text-xs">
          <p>
            POTRAZ inspections begin 1 September 2026.{" "}
            <Link
              href="/data-protection"
              className="font-semibold text-white underline underline-offset-2 hover:text-signal-300"
            >
              Check your readiness
            </Link>
          </p>
          <div className="flex items-center gap-5">
            <a href="tel:+263786406989" className="hover:text-white">
              +263 78 640 6989
            </a>
            <a href="mailto:sales@prevsoldigital.com" className="hover:text-white">
              sales@prevsoldigital.com
            </a>
          </div>
        </Container>
      </div>

      <Container>
        <div className="flex h-18 items-center justify-between gap-4 py-3">
          <LogoLink showTagline={false} height={34} priority />

          <nav aria-label="Main" className="hidden xl:block">
            <ul className="flex items-center gap-0.5">
              {nav.map((item) => (
                <NavLink key={item.href} item={item} pathname={pathname} />
              ))}
            </ul>
          </nav>


          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              aria-expanded={searchOpen}
              aria-label="Search"
              className="rounded-lg p-2.5 transition hover:bg-surface"
            >
              <SearchIcon className="size-5" />
            </button>

            <Link
              href="/cart"
              className="relative rounded-lg p-2.5 transition hover:bg-surface"
              aria-label={`Shopping cart${ready && count ? `, ${count} items` : ""}`}
            >
              <CartIcon className="size-5" />
              {ready && count > 0 && (
                <span className="absolute -top-0.5 -right-0.5 flex size-5 items-center justify-center rounded-full bg-signal-600 text-[0.65rem] font-bold text-white">
                  {count > 9 ? "9+" : count}
                </span>
              )}
            </Link>

            <Link
              href={session ? "/portal" : "/login"}
              className="hidden rounded-lg p-2.5 transition hover:bg-surface sm:block"
              aria-label={session ? "Client portal" : "Login or register"}
            >
              <UserIcon className="size-5" />
            </Link>

            <ButtonLink href="/quote" size="sm" className="ml-1 hidden sm:inline-flex">
              Get a Quote
            </ButtonLink>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
              className="rounded-lg p-2.5 transition hover:bg-surface xl:hidden"
            >
              <MenuIcon className="size-5" />
            </button>
          </div>
        </div>
      </Container>

      {searchOpen && <SearchBar onClose={() => setSearchOpen(false)} />}
      {mobileOpen && <MobileMenu onClose={() => setMobileOpen(false)} />}
    </header>
  );
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active =
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);

  if (!item.children) {
    return (
      <li>
        <Link
          href={item.href}
          aria-current={active ? "page" : undefined}
          className={cx(
            "rounded-lg px-2.5 py-2 text-sm font-medium whitespace-nowrap transition",
            active
              ? "text-signal-600 dark:text-signal-400"
              : "hover:bg-surface hover:text-signal-600",
          )}
        >
          {item.label}
        </Link>
      </li>
    );
  }

  return (
    <li className="group relative">
      <Link
        href={item.href}
        aria-current={active ? "page" : undefined}
        className={cx(
          "flex items-center gap-1 rounded-lg px-2.5 py-2 text-sm font-medium whitespace-nowrap transition",
          active
            ? "text-signal-600 dark:text-signal-400"
            : "hover:bg-surface hover:text-signal-600",
        )}
      >
        {item.label}
        <ChevronDownIcon className="size-3.5 transition group-hover:rotate-180" />
      </Link>
      <div className="invisible absolute top-full left-0 z-50 pt-2 opacity-0 transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
        <ul className="w-80 rounded-2xl border border-line bg-background p-2 shadow-card-hover">
          {item.children.map((child) => (
            <li key={child.href}>
              <Link
                href={child.href}
                className="block rounded-xl px-3 py-2.5 transition hover:bg-surface"
              >
                <span className="block text-sm font-semibold">{child.label}</span>
                {child.blurb && (
                  <span className="mt-0.5 block text-xs leading-snug text-muted">
                    {child.blurb}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}

function SearchBar({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="border-t border-line bg-surface">
      <Container className="py-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!query.trim()) return;
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
          }}
          role="search"
        >
          <div className="flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
              <input
                ref={inputRef}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search services, products, domains and help articles…"
                aria-label="Search the site"
                className={cx(inputClass, "pl-10")}
              />
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-3 text-sm font-medium text-muted transition hover:bg-background"
            >
              Cancel
            </button>
          </div>
        </form>
      </Container>
    </div>
  );
}

function MobileMenu({ onClose }: { onClose: () => void }) {
  const session = useSession();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 xl:hidden">
      <button
        type="button"
        className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close menu"
      />
      <div className="absolute inset-y-0 right-0 flex w-full max-w-sm flex-col bg-background shadow-2xl">
        <div className="flex items-center justify-between border-b border-line px-4 py-4">
          <LogoLink showTagline={false} height={32} />
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="rounded-lg p-2 transition hover:bg-surface"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>

        <nav aria-label="Mobile" className="flex-1 overflow-y-auto px-4 py-4">
          <ul className="space-y-1">
            {nav.map((item) => (
              <li key={item.href}>
                {item.children ? (
                  <details className="group">
                    <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg px-3 py-3 font-medium transition hover:bg-surface [&::-webkit-details-marker]:hidden">
                      {item.label}
                      <ChevronDownIcon className="size-4 transition group-open:rotate-180" />
                    </summary>
                    <ul className="mt-1 ml-3 space-y-0.5 border-l border-line pl-3">
                      <li>
                        <Link
                          href={item.href}
                          className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-signal-600 transition hover:bg-surface"
                        >
                          All {item.label}
                        </Link>
                      </li>
                      {item.children.map((child) => (
                        <li key={child.href}>
                          <Link
                            href={child.href}
                            className="block rounded-lg px-3 py-2.5 text-sm transition hover:bg-surface"
                          >
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                ) : (
                  <Link
                    href={item.href}
                    className="block rounded-lg px-3 py-3 font-medium transition hover:bg-surface"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
            <li>
              <Link
                href={session ? "/portal" : "/login"}
                className="block rounded-lg px-3 py-3 font-medium transition hover:bg-surface"
              >
                Client Portal
              </Link>
            </li>
          </ul>
        </nav>

        <div className="space-y-2 border-t border-line px-4 py-4">
          <ButtonLink href="/quote" className="w-full" size="lg">
            Get a Quote
          </ButtonLink>
          <ButtonLink
            href={session ? "/portal" : "/login"}
            variant="outline"
            className="w-full"
            size="lg"
          >
            {session ? "Go to Portal" : "Login / Register"}
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
