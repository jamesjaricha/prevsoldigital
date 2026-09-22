"use client";

/** Knowledge base search — the prominent "How can we help you?" bar, §13. */

import Link from "next/link";
import { useMemo, useState } from "react";
import { kbCategories, searchArticles } from "@/content/knowledge-base";
import { SearchIcon } from "./icons";
import { cx } from "./ui";

export function KbSearch({
  variant = "default",
}: {
  variant?: "default" | "hero";
}) {
  const [query, setQuery] = useState("");
  const hero = variant === "hero";

  const results = useMemo(
    () => (query.trim().length > 1 ? searchArticles(query).slice(0, 6) : []),
    [query],
  );

  return (
    <div className="relative">
      <div className="relative">
        <SearchIcon
          className={cx(
            "pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2",
            hero ? "text-navy-300" : "text-muted",
          )}
        />
        <label htmlFor="kb-search" className="sr-only">
          Search the knowledge base
        </label>
        <input
          id="kb-search"
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for an answer…"
          autoComplete="off"
          className={cx(
            "w-full rounded-xl py-4 pr-4 pl-12 text-base outline-none transition",
            hero
              ? "border border-white/20 bg-white/10 text-white backdrop-blur placeholder:text-navy-300 focus:border-white/40"
              : "border border-navy-200 bg-background placeholder:text-navy-400 focus:border-signal-500 focus:ring-2 focus:ring-signal-500/20 dark:border-navy-700",
          )}
        />
      </div>

      {/* Live results */}
      {query.trim().length > 1 && (
        <div className="absolute top-full right-0 left-0 z-30 mt-2 overflow-hidden rounded-2xl border border-line bg-background shadow-card-hover">
          {results.length === 0 ? (
            <p className="px-5 py-6 text-center text-sm text-muted">
              No articles matched “{query}”. Try a different term, or{" "}
              <Link
                href="/support/new"
                className="font-semibold text-signal-600 hover:underline"
              >
                open a ticket
              </Link>
              .
            </p>
          ) : (
            <ul className="divide-y divide-line" role="listbox">
              {results.map((article) => {
                const category = kbCategories.find(
                  (c) => c.slug === article.category,
                );
                return (
                  <li key={article.slug}>
                    <Link
                      href={`/knowledge-base/${article.slug}`}
                      className="block px-5 py-3.5 transition hover:bg-surface"
                    >
                      <p className="text-xs font-semibold uppercase tracking-wider text-signal-600">
                        {category?.name}
                      </p>
                      <p className="mt-1 font-semibold">{article.title}</p>
                      <p className="mt-0.5 line-clamp-1 text-sm text-muted">
                        {article.excerpt}
                      </p>
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
