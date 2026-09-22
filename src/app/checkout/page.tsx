"use client";

/**
 * Checkout — requirements doc §18.
 * Order Summary → Customer Details → Payment → Confirmation.
 *
 * Prices shown here are indicative; the server re-prices every line from the
 * catalogue before creating the order, so a tampered cart cannot set its own
 * total.
 */

import Link from "next/link";
import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { placeOrder } from "@/app/actions/checkout";
import { isDemoMode } from "@/components/demo-banner";
import { CheckIcon, LockIcon, ShieldIcon } from "@/components/icons";
import {
  Button,
  ButtonLink,
  Container,
  EmptyState,
  Field,
  PageHero,
  Section,
  cx,
  inputClass,
} from "@/components/ui";
import { brand } from "@/content/brand";
import { money, useCart } from "@/lib/store";
import { useSession } from "@/lib/session-context";

type Step = 1 | 2 | 3;

const steps = [
  { n: 1, label: "Order Summary" },
  { n: 2, label: "Customer Details" },
  { n: 3, label: "Payment" },
  { n: 4, label: "Confirmation" },
] as const;

const paymentMethods = [
  {
    id: "PAYNOW_ECOCASH",
    name: "EcoCash",
    blurb: "You will get a prompt on your phone to approve the payment.",
    needsPhone: true,
  },
  {
    id: "PAYNOW_ONEMONEY",
    name: "OneMoney",
    blurb: "You will get a prompt on your phone to approve the payment.",
    needsPhone: true,
  },
  {
    id: "PAYNOW_CARD",
    name: "Card payment",
    blurb: "Visa or Mastercard, processed securely by Paynow.",
    needsPhone: false,
  },
  {
    id: "BANK_TRANSFER",
    name: "Bank transfer",
    blurb: "We will email banking details. One to two business days to reflect.",
    needsPhone: false,
  },
  {
    id: "CASH",
    name: "Cash at our offices",
    blurb: `Pay at ${brand.address} during business hours.`,
    needsPhone: false,
  },
];

function PlaceOrderButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      <ShieldIcon className="size-4" />
      {pending ? "Placing your order…" : "Place Order"}
    </Button>
  );
}

export default function CheckoutPage() {
  const { items, subtotal, discount, tax, total, ready, clear } = useCart();
  const session = useSession();

  const [step, setStep] = useState<Step>(1);
  const [method, setMethod] = useState("PAYNOW_ECOCASH");
  const [state, action] = useActionState(placeOrder, null);

  const chosen = paymentMethods.find((m) => m.id === method);
  const done = state?.ok === true;

  // Clear the cart once the order is safely recorded, and follow any redirect
  // the gateway asked for. The ref guards against running twice: `clear()`
  // changes the cart, which re-renders this component, and re-entering would
  // reset the confirmation before it could be read.
  const settled = useRef(false);
  useEffect(() => {
    if (!done || settled.current) return;
    settled.current = true;
    clear();
    if (state.redirectUrl) window.location.href = state.redirectUrl;
  }, [done, state, clear]);

  if (ready && items.length === 0 && !done) {
    return (
      <>
        <PageHero
          eyebrow="Checkout"
          title="Checkout"
          breadcrumbs={[{ label: "Home", href: "/" }, { label: "Checkout" }]}
        />
        <Section>
          <Container>
            <EmptyState
              title="There's nothing to check out"
              description="Add a product, service or domain to your cart first."
              action={<ButtonLink href="/shop">Browse the shop</ButtonLink>}
            />
          </Container>
        </Section>
      </>
    );
  }

  const currentStep = done ? 4 : step;

  return (
    <>
      <PageHero
        eyebrow="Secure checkout"
        title="Checkout"
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Checkout" }]}
      />

      <Section className="py-10 sm:py-14">
        <Container>
          <ol className="mb-10 flex flex-wrap items-center gap-y-3">
            {steps.map((s, i) => (
              <li key={s.n} className="flex items-center">
                <span
                  className={cx(
                    "flex items-center gap-2.5 rounded-full py-1.5 pr-4 pl-1.5 text-sm font-medium transition",
                    currentStep === s.n && "bg-navy-950 text-white",
                    currentStep > s.n && "text-emerald-700 dark:text-emerald-400",
                    currentStep < s.n && "text-muted",
                  )}
                  aria-current={currentStep === s.n ? "step" : undefined}
                >
                  <span
                    className={cx(
                      "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                      currentStep === s.n && "bg-signal-600 text-white",
                      currentStep > s.n &&
                        "bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
                      currentStep < s.n && "bg-surface",
                    )}
                  >
                    {currentStep > s.n ? <CheckIcon className="size-4" /> : s.n}
                  </span>
                  <span className="hidden sm:inline">{s.label}</span>
                </span>
                {i < steps.length - 1 && (
                  <span className="mx-1 h-px w-4 bg-line sm:w-8" aria-hidden />
                )}
              </li>
            ))}
          </ol>

          {done ? (
            <Confirmation
              reference={state.reference}
              invoiceNumber={state.invoiceNumber}
              manual={state.manual}
              instructions={state.instructions}
              methodName={chosen?.name ?? "your chosen method"}
            />
          ) : (
            <form action={action}>
              {/* The server re-prices these; they are the request, not the price. */}
              <input
                type="hidden"
                name="items"
                value={JSON.stringify(
                  items.map((i) => ({
                    id: i.id,
                    name: i.name,
                    detail: i.detail,
                    quantity: i.quantity,
                  })),
                )}
              />
              <input type="hidden" name="method" value={method} />

              <div className="grid gap-8 lg:grid-cols-12">
                <div className="lg:col-span-7">
                  {state?.ok === false && (
                    <p
                      role="alert"
                      className="mb-6 rounded-lg bg-signal-50 px-4 py-3 text-sm text-signal-800 dark:bg-signal-500/10 dark:text-signal-300"
                    >
                      {state.error}
                    </p>
                  )}

                  {/* Step 1 */}
                  <div className={step === 1 ? "" : "hidden"}>
                    <h2 className="font-display text-2xl font-bold uppercase tracking-tight">
                      Order Summary
                    </h2>
                    <p className="mt-2 text-sm text-muted">
                      Check what you are buying before continuing.
                    </p>

                    <ul className="mt-6 divide-y divide-line rounded-2xl border border-line bg-background">
                      {items.map((item) => (
                        <li
                          key={item.id}
                          className="flex justify-between gap-4 px-5 py-4"
                        >
                          <div>
                            <p className="font-semibold">{item.name}</p>
                            {item.detail && (
                              <p className="mt-0.5 text-xs text-muted">
                                {item.detail}
                              </p>
                            )}
                            <p className="mt-1 text-xs text-muted">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                          <p className="shrink-0 font-semibold">
                            {money(item.price * item.quantity)}
                            {item.per && (
                              <span className="text-xs font-normal text-muted">
                                /{item.per}
                              </span>
                            )}
                          </p>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <Button type="button" onClick={() => setStep(2)} size="lg">
                        Continue to Customer Details
                      </Button>
                      <ButtonLink href="/cart" variant="outline" size="lg">
                        Edit cart
                      </ButtonLink>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className={step === 2 ? "" : "hidden"}>
                    <h2 className="font-display text-2xl font-bold uppercase tracking-tight">
                      Customer Details
                    </h2>
                    <p className="mt-2 text-sm text-muted">
                      We use these details for your invoice and account.
                    </p>

                    <div className="mt-6 grid gap-5 sm:grid-cols-2">
                      <Field label="Full name" htmlFor="co-name" required>
                        <input
                          id="co-name"
                          name="name"
                          required
                          defaultValue={session?.name ?? ""}
                          className={inputClass}
                          autoComplete="name"
                        />
                      </Field>
                      <Field label="Company" htmlFor="co-company">
                        <input
                          id="co-company"
                          name="company"
                          defaultValue={session?.company ?? ""}
                          className={inputClass}
                          autoComplete="organization"
                        />
                      </Field>
                      <Field label="Email" htmlFor="co-email" required>
                        <input
                          id="co-email"
                          name="email"
                          type="email"
                          required
                          defaultValue={session?.email ?? ""}
                          className={inputClass}
                          autoComplete="email"
                        />
                      </Field>
                      <Field label="Phone" htmlFor="co-phone" required>
                        <input
                          id="co-phone"
                          name="phone"
                          type="tel"
                          required
                          className={inputClass}
                          autoComplete="tel"
                          placeholder="+263 …"
                        />
                      </Field>
                      <Field label="Address" htmlFor="co-address" className="sm:col-span-2">
                        <input
                          id="co-address"
                          name="address"
                          className={inputClass}
                          autoComplete="street-address"
                        />
                      </Field>
                      <Field label="City" htmlFor="co-city">
                        <input
                          id="co-city"
                          name="city"
                          className={inputClass}
                          autoComplete="address-level2"
                        />
                      </Field>
                      <Field
                        label="Order notes"
                        htmlFor="co-notes"
                        hint="Anything we should know before we start."
                        className="sm:col-span-2"
                      >
                        <textarea
                          id="co-notes"
                          name="notes"
                          rows={3}
                          className={inputClass}
                        />
                      </Field>
                    </div>

                    <div className="mt-7 flex flex-wrap gap-3">
                      <Button type="button" onClick={() => setStep(3)} size="lg">
                        Continue to Payment
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setStep(1)}
                        variant="outline"
                        size="lg"
                      >
                        Back
                      </Button>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className={step === 3 ? "" : "hidden"}>
                    <h2 className="font-display text-2xl font-bold uppercase tracking-tight">
                      Payment
                    </h2>
                    <p className="mt-2 text-sm text-muted">
                      {isDemoMode
                        ? `Choose a method to see the flow. Nothing is charged on the demonstration site.`
                        : `Choose how you would like to pay ${money(total)}.`}
                    </p>

                    <fieldset className="mt-6">
                      <legend className="sr-only">Payment method</legend>
                      <div className="space-y-3">
                        {paymentMethods.map((pm) => (
                          <label
                            key={pm.id}
                            className={cx(
                              "flex cursor-pointer items-start gap-3 rounded-2xl border p-5 transition",
                              method === pm.id
                                ? "border-signal-600 bg-signal-50/50 ring-1 ring-signal-600 dark:bg-signal-500/5"
                                : "border-line hover:border-navy-300",
                            )}
                          >
                            <input
                              type="radio"
                              name="methodChoice"
                              value={pm.id}
                              checked={method === pm.id}
                              onChange={() => setMethod(pm.id)}
                              className="mt-1 size-4 accent-signal-600"
                            />
                            <span>
                              <span className="block font-semibold">{pm.name}</span>
                              <span className="mt-0.5 block text-sm text-muted">
                                {pm.blurb}
                              </span>
                            </span>
                          </label>
                        ))}
                      </div>
                    </fieldset>

                    {chosen?.needsPhone && (
                      <div className="mt-5">
                        <Field
                          label={`${chosen.name} number to charge`}
                          htmlFor="co-payphone"
                          required
                          hint={
                            state?.ok === false
                              ? state.fieldErrors?.payPhone?.[0]
                              : "The number that will receive the payment prompt."
                          }
                        >
                          <input
                            id="co-payphone"
                            name="payPhone"
                            type="tel"
                            className={inputClass}
                            placeholder="0771234567"
                          />
                        </Field>
                      </div>
                    )}

                    <div className="mt-6 flex items-start gap-3 rounded-xl border border-line bg-surface p-4">
                      <LockIcon className="mt-0.5 size-4 shrink-0 text-emerald-600" />
                      <p className="text-xs text-muted">
                        Card and mobile money payments are processed by Paynow.
                        We never see or store your card or PIN details.
                      </p>
                    </div>

                    <div className="mt-7 flex flex-wrap gap-3">
                      <PlaceOrderButton />
                      <Button
                        type="button"
                        onClick={() => setStep(2)}
                        variant="outline"
                        size="lg"
                      >
                        Back
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-5">
                  <OrderTotals
                    items={items}
                    subtotal={subtotal}
                    discount={discount}
                    tax={tax}
                    total={total}
                  />
                </div>
              </div>
            </form>
          )}
        </Container>
      </Section>
    </>
  );
}

/* ------------------------------------------------------------ confirmation */

function Confirmation({
  reference,
  invoiceNumber,
  manual,
  instructions,
  methodName,
}: {
  reference: string;
  invoiceNumber: string;
  manual: boolean;
  instructions?: string;
  methodName: string;
}) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
        <CheckIcon className="size-8" />
      </span>
      <h2 className="font-display mt-6 text-3xl font-bold uppercase tracking-tight">
        Order Received
      </h2>
      <p className="mt-4 text-muted">
        Thank you. Your order reference is{" "}
        <span className="font-display font-bold text-navy-950 dark:text-white">
          {reference}
        </span>
        , and invoice{" "}
        <span className="font-display font-bold text-navy-950 dark:text-white">
          {invoiceNumber}
        </span>{" "}
        is in your portal.{" "}
        {isDemoMode ? "No email is sent on the demonstration site." : "We have emailed you a confirmation."}
      </p>

      {instructions && (
        <div className="mt-6 rounded-2xl border border-signal-200 bg-signal-50 p-5 text-left dark:border-signal-800 dark:bg-signal-500/10">
          <p className="font-semibold text-signal-800 dark:text-signal-200">
            Approve the payment on your phone
          </p>
          <p className="mt-2 text-sm text-signal-700 dark:text-signal-300">
            {instructions}
          </p>
        </div>
      )}

      <div className="mt-8 rounded-2xl border border-line bg-surface p-6 text-left">
        <h3 className="font-display text-sm font-bold uppercase tracking-wider">
          What happens next
        </h3>
        <ol className="mt-4 space-y-3 text-sm text-muted">
          <li className="flex gap-3">
            <span className="font-display font-bold text-signal-600">1.</span>
            {isDemoMode
              ? "This is a demonstration, so no payment was taken and no email was sent. On the live site you would receive payment instructions here."
              : manual
                ? `We will email you the details to complete payment by ${methodName.toLowerCase()}.`
                : "Once your payment clears, we are notified automatically."}
          </li>
          <li className="flex gap-3">
            <span className="font-display font-bold text-signal-600">2.</span>
            We provision your services and email your login details. Domains
            ending in .co.zw are registered manually and take one to three
            working days.
          </li>
          <li className="flex gap-3">
            <span className="font-display font-bold text-signal-600">3.</span>
            Track everything from your client portal.
          </li>
        </ol>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/portal/invoices" size="lg">
          View your invoice
        </ButtonLink>
        <ButtonLink href="/shop" variant="outline" size="lg">
          Continue shopping
        </ButtonLink>
      </div>

      <p className="mt-6 text-sm text-muted">
        Questions about this order?{" "}
        <Link
          href="/support/new"
          className="font-semibold text-signal-600 hover:underline"
        >
          Open a support ticket
        </Link>
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ totals */

function OrderTotals({
  items,
  subtotal,
  discount,
  tax,
  total,
}: {
  items: ReturnType<typeof useCart>["items"];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
}) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-6 lg:sticky lg:top-28">
      <h2 className="font-display text-lg font-bold uppercase tracking-tight">
        Your Order
      </h2>

      <ul className="mt-4 space-y-2.5 text-sm">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between gap-3">
            <span className="text-muted">
              {item.name}
              {item.quantity > 1 && ` × ${item.quantity}`}
            </span>
            <span className="shrink-0 font-medium">
              {money(item.price * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <dl className="mt-5 space-y-3 border-t border-line pt-5 text-sm">
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
          <dd className="font-display text-xl font-bold">{money(total)}</dd>
        </div>
      </dl>

      <div className="mt-5 flex items-center gap-2 text-xs text-muted">
        <LockIcon className="size-3.5 text-emerald-600" />
        Secure checkout
      </div>
    </div>
  );
}
