"use client";

/**
 * Shopping cart — requirements doc §6.
 * Shows quantity, price, subtotal, discounts, taxes and total.
 */

import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { TrashIcon, ArrowRightIcon } from "@/components/icons";
import {
  ButtonLink,
  Container,
  EmptyState,
  PageHero,
  Section,
  SectionHeading,
} from "@/components/ui";
import { featuredProducts } from "@/content/products";
import { money, useCart } from "@/lib/store";

export default function CartPage() {
  const { items, setQuantity, remove, subtotal, discount, tax, total, ready, clear } =
    useCart();

  return (
    <>
      <PageHero
        eyebrow="Checkout"
        title="Your Cart"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Cart" }]}
      />

      <Section className="py-10 sm:py-14">
        <Container>
          {!ready ? (
            <p className="py-12 text-center text-muted">Loading your cart…</p>
          ) : items.length === 0 ? (
            <EmptyState
              title="Your cart is empty"
              description="Browse our products and services, or search for a domain to get started."
              action={
                <div className="flex flex-wrap justify-center gap-3">
                  <ButtonLink href="/shop">Browse the shop</ButtonLink>
                  <ButtonLink href="/domains" variant="outline">
                    Search domains
                  </ButtonLink>
                </div>
              }
            />
          ) : (
            <div className="grid gap-8 lg:grid-cols-12">
              {/* Line items */}
              <div className="lg:col-span-8">
                <div className="overflow-hidden rounded-2xl border border-line bg-background">
                  <table className="w-full">
                    <caption className="sr-only">Items in your cart</caption>
                    <thead className="border-b border-line bg-surface text-left text-xs font-semibold uppercase tracking-wider text-muted">
                      <tr>
                        <th scope="col" className="px-5 py-3">
                          Item
                        </th>
                        <th scope="col" className="px-3 py-3">
                          Qty
                        </th>
                        <th scope="col" className="px-5 py-3 text-right">
                          Price
                        </th>
                        <th scope="col" className="w-12 px-3 py-3">
                          <span className="sr-only">Remove</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {items.map((item) => (
                        <tr key={item.id}>
                          <td className="px-5 py-4">
                            {item.href ? (
                              <Link
                                href={item.href}
                                className="font-semibold transition hover:text-signal-600"
                              >
                                {item.name}
                              </Link>
                            ) : (
                              <span className="font-semibold">{item.name}</span>
                            )}
                            {item.detail && (
                              <p className="mt-0.5 text-xs text-muted">
                                {item.detail}
                              </p>
                            )}
                          </td>
                          <td className="px-3 py-4">
                            <label
                              htmlFor={`qty-${item.id}`}
                              className="sr-only"
                            >
                              Quantity for {item.name}
                            </label>
                            <input
                              id={`qty-${item.id}`}
                              type="number"
                              min={1}
                              max={99}
                              value={item.quantity}
                              onChange={(e) =>
                                setQuantity(item.id, Number(e.target.value))
                              }
                              className="w-16 rounded-lg border border-navy-200 bg-background px-2 py-1.5 text-center text-sm dark:border-navy-700"
                            />
                          </td>
                          <td className="px-5 py-4 text-right">
                            <span className="font-semibold">
                              {money(item.price * item.quantity)}
                            </span>
                            {item.per && (
                              <span className="text-xs text-muted">
                                /{item.per}
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-4">
                            <button
                              type="button"
                              onClick={() => remove(item.id)}
                              aria-label={`Remove ${item.name} from cart`}
                              className="rounded-lg p-2 text-muted transition hover:bg-signal-50 hover:text-signal-600 dark:hover:bg-signal-500/10"
                            >
                              <TrashIcon className="size-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex flex-wrap justify-between gap-3">
                  <ButtonLink href="/shop" variant="ghost" size="sm">
                    ← Continue shopping
                  </ButtonLink>
                  <button
                    type="button"
                    onClick={clear}
                    className="text-sm font-medium text-muted transition hover:text-signal-600"
                  >
                    Clear cart
                  </button>
                </div>
              </div>

              {/* Summary */}
              <div className="lg:col-span-4">
                <div className="rounded-2xl border border-line bg-surface p-6 lg:sticky lg:top-28">
                  <h2 className="font-display text-lg font-bold uppercase tracking-tight">
                    Order Summary
                  </h2>

                  <dl className="mt-5 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted">Subtotal</dt>
                      <dd className="font-medium">{money(subtotal)}</dd>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-emerald-700 dark:text-emerald-400">
                        <dt>Volume discount (5%)</dt>
                        <dd className="font-medium">−{money(discount)}</dd>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <dt className="text-muted">VAT (15%)</dt>
                      <dd className="font-medium">{money(tax)}</dd>
                    </div>
                    <div className="flex justify-between border-t border-line pt-3 text-base">
                      <dt className="font-display font-bold uppercase">Total</dt>
                      <dd className="font-display text-xl font-bold">
                        {money(total)}
                      </dd>
                    </div>
                  </dl>

                  {discount === 0 && subtotal > 700 && (
                    <p className="mt-4 rounded-lg bg-emerald-50 px-3 py-2.5 text-xs text-emerald-800 dark:bg-emerald-500/10 dark:text-emerald-300">
                      Add {money(1000 - subtotal)} more to unlock a 5% volume
                      discount.
                    </p>
                  )}

                  <ButtonLink href="/checkout" size="lg" className="mt-6 w-full">
                    Proceed to Checkout
                    <ArrowRightIcon className="size-4" />
                  </ButtonLink>

                  <p className="mt-4 text-center text-xs text-muted">
                    Recurring items are billed on their stated cycle. Taxes shown
                    where applicable.
                  </p>
                </div>
              </div>
            </div>
          )}
        </Container>
      </Section>

      {ready && items.length > 0 && (
        <Section tone="surface">
          <Container>
            <SectionHeading
              eyebrow="Recommended"
              title="You May Also Need"
            />
            <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts
                .filter((p) => !items.some((i) => i.id === p.slug))
                .slice(0, 4)
                .map((p) => (
                  <ProductCard key={p.slug} product={p} />
                ))}
            </div>
          </Container>
        </Section>
      )}
    </>
  );
}
