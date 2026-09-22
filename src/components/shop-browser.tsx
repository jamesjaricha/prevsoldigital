"use client";

/**
 * Shop browsing UI — requirements doc §6.
 * Search, category filters, price sorting, and the product grid.
 */

import { useMemo, useState } from "react";
import type { Product, ProductCategory } from "@/content/products";
import { ProductCard } from "./product-card";
import { FilterIcon, SearchIcon } from "./icons";
import { EmptyState, cx, inputClass } from "./ui";

type SortKey = "featured" | "price-asc" | "price-desc" | "rating" | "name";

const sorts: { key: SortKey; label: string }[] = [
  { key: "featured", label: "Featured" },
  { key: "price-asc", label: "Price: low to high" },
  { key: "price-desc", label: "Price: high to low" },
  { key: "rating", label: "Highest rated" },
  { key: "name", label: "Name A–Z" },
];

export function ShopBrowser({
  products,
  categories,
  initialCategory,
  initialQuery,
  initialSort,
}: {
  products: Product[];
  categories: { slug: ProductCategory; name: string; blurb: string }[];
  initialCategory?: string;
  initialQuery?: string;
  initialSort?: string;
}) {
  const [category, setCategory] = useState<string>(
    categories.some((c) => c.slug === initialCategory) ? initialCategory! : "all",
  );
  const [query, setQuery] = useState(initialQuery ?? "");
  const [sort, setSort] = useState<SortKey>(
    sorts.some((s) => s.key === initialSort) ? (initialSort as SortKey) : "featured",
  );

  const visible = useMemo(() => {
    let list = products;

    if (category !== "all") {
      list = list.filter((p) => p.category === category);
    }

    const q = query.trim().toLowerCase();
    if (q) {
      list = list.filter((p) =>
        [p.name, p.summary, p.description, ...p.includes]
          .join(" ")
          .toLowerCase()
          .includes(q),
      );
    }

    const sorted = [...list];
    switch (sort) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case "name":
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        // Badged items first, then by review volume.
        sorted.sort((a, b) => {
          if (Boolean(a.badge) !== Boolean(b.badge)) return a.badge ? -1 : 1;
          return b.reviews - a.reviews;
        });
    }
    return sorted;
  }, [products, category, query, sort]);

  const activeCategory = categories.find((c) => c.slug === category);

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      {/* Filters */}
      <aside className="lg:col-span-3">
        <div className="lg:sticky lg:top-28">
          <div className="flex items-center gap-2">
            <FilterIcon className="size-4 text-signal-600" />
            <h2 className="font-display text-sm font-bold uppercase tracking-wider">
              Categories
            </h2>
          </div>

          <ul className="mt-4 space-y-1">
            <li>
              <button
                type="button"
                onClick={() => setCategory("all")}
                aria-pressed={category === "all"}
                className={cx(
                  "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition",
                  category === "all"
                    ? "bg-navy-950 text-white"
                    : "hover:bg-surface",
                )}
              >
                All products
                <span className="text-xs opacity-70">{products.length}</span>
              </button>
            </li>
            {categories.map((cat) => {
              const count = products.filter((p) => p.category === cat.slug).length;
              return (
                <li key={cat.slug}>
                  <button
                    type="button"
                    onClick={() => setCategory(cat.slug)}
                    aria-pressed={category === cat.slug}
                    className={cx(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition",
                      category === cat.slug
                        ? "bg-navy-950 text-white"
                        : "hover:bg-surface",
                    )}
                  >
                    {cat.name}
                    <span className="text-xs opacity-70">{count}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </aside>

      {/* Results */}
      <div className="lg:col-span-9">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted" />
            <label htmlFor="shop-search" className="sr-only">
              Search products
            </label>
            <input
              id="shop-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products and services…"
              className={cx(inputClass, "pl-10")}
            />
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="shop-sort" className="text-sm text-muted">
              Sort
            </label>
            <select
              id="shop-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              className={cx(inputClass, "w-auto py-2.5")}
            >
              {sorts.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {activeCategory && (
          <p className="mt-5 text-sm text-muted">{activeCategory.blurb}</p>
        )}

        <p className="mt-4 text-sm text-muted" role="status" aria-live="polite">
          Showing {visible.length} {visible.length === 1 ? "item" : "items"}
        </p>

        {visible.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="Nothing matched"
              description="Try a different search term, or clear the filters to see everything we offer."
            />
          </div>
        ) : (
          <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {visible.map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
