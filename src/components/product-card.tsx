"use client";

import Link from "next/link";
import { useState } from "react";
import type { Product } from "@/content/products";
import { formatPrice } from "@/content/products";
import { useCart } from "@/lib/store";
import { CartIcon, CheckIcon } from "./icons";
import { Badge, Stars, buttonClass, cx } from "./ui";

/** Product tile for the shop grid and homepage featured band — §6. */
export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  function addToCart() {
    add({
      id: product.slug,
      name: product.name,
      detail: product.per ? `Billed ${product.per === "mo" ? "monthly" : product.per === "yr" ? "annually" : `per ${product.per}`}` : "One-off",
      price: product.price,
      per: product.per,
      href: `/shop/${product.slug}`,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-background shadow-card transition hover:border-navy-300 hover:shadow-card-hover">
      {/* Visual band — a generated pattern rather than a stock photo, so the
          card renders identically without any external asset. */}
      <div className="relative h-32 overflow-hidden bg-navy-950">
        <ProductPattern seed={product.slug} />
        {product.badge && (
          <span className="absolute top-3 left-3">
            <Badge tone={product.badge === "Best value" ? "signal" : "emerald"}>
              {product.badge}
            </Badge>
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-display text-base font-bold uppercase tracking-tight">
          <Link
            href={`/shop/${product.slug}`}
            className="transition hover:text-signal-600"
          >
            {product.name}
          </Link>
        </h3>

        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
          {product.summary}
        </p>

        <Stars rating={product.rating} reviews={product.reviews} className="mt-3" />

        <div className="mt-4 flex items-end justify-between gap-3">
          <div>
            <p className="font-display text-2xl font-bold">
              {formatPrice(product.price, product.per)}
            </p>
            {product.compareAt && (
              <p className="text-xs text-muted line-through">
                ${product.compareAt}
              </p>
            )}
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button
            type="button"
            onClick={addToCart}
            className={cx(buttonClass("primary", "sm"), "flex-1")}
            aria-label={`Add ${product.name} to cart`}
          >
            {added ? (
              <>
                <CheckIcon className="size-4" /> Added
              </>
            ) : (
              <>
                <CartIcon className="size-4" /> Add to Cart
              </>
            )}
          </button>
          <Link
            href={`/shop/${product.slug}`}
            className={buttonClass("outline", "sm")}
          >
            Details
          </Link>
        </div>
      </div>
    </article>
  );
}

/**
 * Deterministic decorative pattern, derived from the product slug so each
 * card looks distinct but never changes between renders.
 */
export function ProductPattern({ seed }: { seed: string }) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;

  const dots = Array.from({ length: 14 }, (_, i) => {
    // `>>> 0` keeps the value unsigned — a signed result would make `%` return
    // negatives, and a negative circle radius is invalid SVG.
    const a = ((h >>> (i % 12)) ^ (i * 2654435761)) >>> 0;
    return {
      cx: 8 + (a % 84),
      cy: 10 + ((a >>> 7) % 80),
      r: 1.5 + ((a >>> 13) % 4),
      o: 0.15 + ((a >>> 17) % 40) / 100,
    };
  });

  return (
    <svg
      className="absolute inset-0 size-full text-signal-500"
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <linearGradient id={`pg-${seed}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="currentColor" stopOpacity="0.35" />
          <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#pg-${seed})`} />
      {dots.map((d, i) => (
        <circle
          key={i}
          cx={d.cx}
          cy={d.cy}
          r={d.r}
          fill="white"
          opacity={d.o}
        />
      ))}
      <path
        d={`M0 ${60 + (h % 20)} Q 25 ${40 + (h % 30)} 50 ${55 + (h % 25)} T 100 ${45 + (h % 20)}`}
        fill="none"
        stroke="white"
        strokeOpacity="0.25"
        strokeWidth="1"
      />
    </svg>
  );
}
