"use client";

/**
 * Domain search results — requirements doc §7.
 * Clearly shows available vs unavailable, registration and renewal price,
 * Add to Cart / Buy Now, and alternative suggestions.
 */

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { DomainResult, DomainSearch } from "@/lib/domains";
import { useCart } from "@/lib/store";
import { CartIcon, CheckIcon, XIcon } from "./icons";
import { Badge, buttonClass, cx } from "./ui";

export function DomainResults({ results }: { results: DomainSearch }) {
  const { exact, alternatives, suggestions, name } = results;
  const availableCount = alternatives.filter((a) => a.available).length;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="font-display text-2xl font-bold uppercase tracking-tight">
          Results for “{name}”
        </h2>
        <p className="text-sm text-muted">
          {availableCount + (exact?.available ? 1 : 0)} available across{" "}
          {alternatives.length + (exact ? 1 : 0)} extensions
        </p>
      </div>

      {/* Exact match, when the user typed an extension. */}
      {exact && (
        <div className="mt-6">
          <DomainRow result={exact} emphasis />
        </div>
      )}

      {/* Suggested variations when the exact match is taken. */}
      {suggestions.length > 0 && (
        <div className="mt-8">
          <h3 className="font-display text-sm font-bold uppercase tracking-wider text-muted">
            Available alternatives on {exact?.ext}
          </h3>
          <ul className="mt-3 space-y-2.5">
            {suggestions.map((s) => (
              <li key={s.fqdn}>
                <DomainRow result={s} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Every other extension. */}
      <div className="mt-8">
        <h3 className="font-display text-sm font-bold uppercase tracking-wider text-muted">
          {exact ? "Other extensions" : "Available extensions"}
        </h3>
        <ul className="mt-3 space-y-2.5">
          {alternatives.map((alt) => (
            <li key={alt.fqdn}>
              <DomainRow result={alt} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function DomainRow({
  result,
  emphasis = false,
}: {
  result: DomainResult;
  emphasis?: boolean;
}) {
  const { add } = useCart();
  const router = useRouter();
  const [added, setAdded] = useState(false);

  const cartItem = {
    id: `domain:${result.fqdn}`,
    name: result.fqdn,
    detail: `Domain registration · 1 year · renews at $${result.renew}/yr`,
    price: result.register,
    per: "yr" as const,
    href: "/domains",
  };

  function addToCart() {
    add(cartItem);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  function buyNow() {
    add(cartItem);
    router.push("/checkout");
  }

  return (
    <div
      className={cx(
        "flex flex-wrap items-center justify-between gap-4 rounded-2xl border px-5 py-4",
        emphasis
          ? "border-2 border-navy-300 bg-surface dark:border-navy-600"
          : "border-line bg-background",
        !result.available && "opacity-75",
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <span
          className={cx(
            "inline-flex size-8 shrink-0 items-center justify-center rounded-full",
            result.available
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300"
              : "bg-signal-100 text-signal-700 dark:bg-signal-500/15 dark:text-signal-300",
          )}
        >
          {result.available ? (
            <CheckIcon className="size-4" />
          ) : (
            <XIcon className="size-4" />
          )}
        </span>
        <div className="min-w-0">
          <p className="font-display truncate text-lg font-bold">
            {result.name}
            <span className="text-signal-600 dark:text-signal-400">
              {result.ext}
            </span>
          </p>
          <p className="text-xs text-muted">
            {result.available ? (
              <>Renews at ${result.renew}/yr</>
            ) : (
              result.reason
            )}
          </p>
        </div>
        {result.popular && result.available && (
          <Badge tone="navy" className="hidden sm:inline-flex">
            Popular
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-3">
        {result.available ? (
          <>
            <p className="text-right">
              <span className="font-display text-xl font-bold">
                ${result.register}
              </span>
              <span className="text-xs text-muted">/yr</span>
            </p>
            <button
              type="button"
              onClick={addToCart}
              className={buttonClass("outline", "sm")}
              aria-label={`Add ${result.fqdn} to cart`}
            >
              {added ? (
                <>
                  <CheckIcon className="size-4" /> Added
                </>
              ) : (
                <>
                  <CartIcon className="size-4" /> Add
                </>
              )}
            </button>
            <button
              type="button"
              onClick={buyNow}
              className={buttonClass("primary", "sm")}
            >
              Buy Now
            </button>
          </>
        ) : (
          <Badge tone="signal">Unavailable</Badge>
        )}
      </div>
    </div>
  );
}
