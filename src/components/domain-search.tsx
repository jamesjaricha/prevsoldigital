"use client";

/**
 * Domain search — requirements doc §7.
 * Used on the homepage hero (compact) and the Domains page (full results).
 */

import { useRouter } from "next/navigation";
import { useState } from "react";
import { tlds } from "@/content/hosting";
import { SearchIcon } from "./icons";
import { buttonClass, cx } from "./ui";

export function DomainSearchForm({
  variant = "default",
  initialQuery = "",
  autoFocus = false,
}: {
  variant?: "default" | "hero";
  initialQuery?: string;
  autoFocus?: boolean;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);

  const hero = variant === "hero";

  return (
    <form
      role="search"
      aria-label="Domain availability search"
      onSubmit={(e) => {
        e.preventDefault();
        const q = query.trim();
        if (!q) return;
        router.push(`/domains?q=${encodeURIComponent(q)}`);
      }}
      className="w-full"
    >
      <div
        className={cx(
          "flex flex-col gap-2 sm:flex-row",
          hero &&
            "rounded-2xl bg-white/10 p-2 ring-1 ring-white/20 backdrop-blur sm:gap-0",
        )}
      >
        <div className="relative flex-1">
          <SearchIcon
            className={cx(
              "pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2",
              hero ? "text-navy-300" : "text-muted",
            )}
          />
          <label htmlFor="domain-query" className="sr-only">
            Search for a domain name
          </label>
          <input
            id="domain-query"
            name="q"
            type="text"
            autoFocus={autoFocus}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="yourcompany.co.zw"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            className={cx(
              "w-full rounded-xl py-3.5 pr-4 pl-12 text-base outline-none transition",
              hero
                ? "bg-transparent text-white placeholder:text-navy-300 focus:ring-0"
                : "border border-navy-200 bg-background placeholder:text-navy-400 focus:border-signal-500 focus:ring-2 focus:ring-signal-500/20 dark:border-navy-700",
            )}
          />
        </div>
        <button
          type="submit"
          className={cx(
            buttonClass("primary", "lg"),
            hero ? "rounded-xl sm:px-8" : "sm:px-8",
          )}
        >
          Search
        </button>
      </div>

      {/* Popular extensions with pricing, as a quick reference. */}
      <ul
        className={cx(
          "mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm",
          hero ? "text-navy-200" : "text-muted",
        )}
      >
        {tlds
          .filter((t) => t.popular)
          .map((t) => (
            <li key={t.ext} className="flex items-center gap-1.5">
              <span
                className={cx(
                  "font-display font-bold",
                  hero ? "text-white" : "text-navy-900 dark:text-white",
                )}
              >
                {t.ext}
              </span>
              <span className="text-xs">${t.register}/yr</span>
            </li>
          ))}
      </ul>
    </form>
  );
}
