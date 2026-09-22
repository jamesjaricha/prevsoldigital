/**
 * Shared presentational primitives used across the marketing site and portal.
 */

import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { ArrowRightIcon, CheckIcon, StarIcon, XIcon } from "./icons";

export function cx(...parts: (string | false | null | undefined)[]) {
  return parts.filter(Boolean).join(" ");
}

/* ------------------------------------------------------------------ layout */

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cx("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>
      {children}
    </div>
  );
}

export function Section({
  children,
  className,
  id,
  tone = "default",
}: {
  children: ReactNode;
  className?: string;
  id?: string;
  tone?: "default" | "surface" | "navy";
}) {
  const tones = {
    default: "",
    surface: "bg-surface",
    navy: "bg-navy-950 text-white",
  };
  return (
    <section
      id={id}
      className={cx("py-16 sm:py-20 lg:py-24", tones[tone], className)}
    >
      {children}
    </section>
  );
}

/**
 * The navy + red double rule used under headings throughout the profile.
 * On dark backgrounds the navy bar would disappear, so `tone="inverse"`
 * swaps it for white.
 */
export function AccentRule({
  className,
  tone = "default",
}: {
  className?: string;
  tone?: "default" | "inverse";
}) {
  return (
    <div
      className={cx("rule-accent", tone === "inverse" && "rule-accent-inverse", className)}
      aria-hidden
    />
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "default",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  align?: "left" | "center";
  tone?: "default" | "inverse";
}) {
  return (
    <div
      className={cx(
        "max-w-3xl",
        align === "center" && "mx-auto text-center",
      )}
    >
      {eyebrow && (
        <p
          className={cx(
            "text-sm font-semibold uppercase tracking-[0.18em]",
            tone === "inverse" ? "text-signal-400" : "text-signal-600",
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        className={cx(
          "font-display mt-3 text-3xl font-bold uppercase tracking-tight sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]",
          tone === "inverse" ? "text-white" : "text-navy-950 dark:text-white",
        )}
      >
        {title}
      </h2>
      <AccentRule
        tone={tone === "inverse" ? "inverse" : "default"}
        className={cx("mt-5", align === "center" && "justify-center")}
      />
      {description && (
        <p
          className={cx(
            "mt-6 text-base leading-relaxed sm:text-lg",
            tone === "inverse" ? "text-navy-200" : "text-muted",
          )}
        >
          {description}
        </p>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ button */

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "inverse";
type ButtonSize = "sm" | "md" | "lg";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-signal-500 disabled:cursor-not-allowed disabled:opacity-50";

const buttonVariants: Record<ButtonVariant, string> = {
  primary:
    "bg-signal-600 text-white hover:bg-signal-700 active:bg-signal-800 shadow-sm",
  secondary:
    "bg-navy-900 text-white hover:bg-navy-800 active:bg-navy-950 shadow-sm dark:bg-white dark:text-navy-950 dark:hover:bg-navy-100",
  outline:
    "border border-navy-200 bg-background text-navy-900 hover:border-navy-300 hover:bg-navy-50 dark:border-navy-700 dark:text-white dark:hover:bg-navy-900",
  ghost:
    "text-navy-800 hover:bg-navy-50 dark:text-navy-100 dark:hover:bg-navy-900",
  inverse:
    "bg-white text-navy-950 hover:bg-navy-100 active:bg-navy-200 shadow-sm",
};

const buttonSizes: Record<ButtonSize, string> = {
  sm: "px-3.5 py-2 text-sm",
  md: "px-5 py-2.5 text-sm sm:text-base",
  lg: "px-6 py-3 text-base",
};

export function buttonClass(
  variant: ButtonVariant = "primary",
  size: ButtonSize = "md",
  className?: string,
) {
  return cx(buttonBase, buttonVariants[variant], buttonSizes[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: ButtonVariant; size?: ButtonSize }) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

/* -------------------------------------------------------------------- card */

export function Card({
  children,
  className,
  as: Tag = "div",
}: {
  children: ReactNode;
  className?: string;
  as?: "div" | "article" | "li";
}) {
  return (
    <Tag
      className={cx(
        "rounded-2xl border border-line bg-background shadow-card",
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export function Badge({
  children,
  tone = "navy",
  className,
}: {
  children: ReactNode;
  tone?: "navy" | "signal" | "emerald" | "amber" | "neutral";
  className?: string;
}) {
  const tones = {
    navy: "bg-navy-100 text-navy-800 ring-navy-600/15 dark:bg-navy-500/15 dark:text-navy-100 dark:ring-navy-300/25",
    signal:
      "bg-signal-50 text-signal-700 ring-signal-600/20 dark:bg-signal-500/15 dark:text-signal-200 dark:ring-signal-400/25",
    emerald:
      "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-400/25",
    amber:
      "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-400/25",
    neutral:
      "bg-surface text-muted ring-line dark:ring-navy-700",
  };
  return (
    <span
      className={cx(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Feature list with check/cross markers, as used on every pricing card. */
export function FeatureList({
  includes,
  excludes,
  tone = "default",
}: {
  includes: readonly string[];
  excludes?: readonly string[];
  tone?: "default" | "inverse";
}) {
  return (
    <ul className="space-y-3 text-sm">
      {includes.map((item) => (
        <li key={item} className="flex gap-3">
          <CheckIcon
            className={cx(
              "mt-0.5 size-4 shrink-0",
              tone === "inverse" ? "text-emerald-400" : "text-emerald-600",
            )}
          />
          <span className={tone === "inverse" ? "text-navy-100" : ""}>
            {item}
          </span>
        </li>
      ))}
      {excludes?.map((item) => (
        <li key={item} className="flex gap-3 opacity-55">
          <XIcon className="mt-0.5 size-4 shrink-0" />
          <span className="line-through">{item}</span>
        </li>
      ))}
    </ul>
  );
}

export function Stars({
  rating,
  reviews,
  className,
}: {
  rating: number;
  reviews?: number;
  className?: string;
}) {
  return (
    <div className={cx("flex items-center gap-1.5", className)}>
      <div className="flex text-amber-500" aria-hidden>
        {[1, 2, 3, 4, 5].map((n) => (
          <StarIcon
            key={n}
            className={cx("size-3.5", n > Math.round(rating) && "text-navy-200 dark:text-navy-700")}
          />
        ))}
      </div>
      <span className="text-xs text-muted">
        {rating.toFixed(1)}
        {reviews !== undefined && ` (${reviews})`}
        <span className="sr-only"> out of 5</span>
      </span>
    </div>
  );
}

/* --------------------------------------------------------------- breadcrumb */

export function Breadcrumbs({
  items,
}: {
  items: { label: string; href?: string }[];
}) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm">
        {items.map((item, i) => (
          <li key={item.label} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-navy-300 dark:text-navy-600">/</span>}
            {item.href ? (
              <Link
                href={item.href}
                className="text-muted transition hover:text-signal-600"
              >
                {item.label}
              </Link>
            ) : (
              <span className="font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/* --------------------------------------------------------------------- FAQ */

export function FaqList({ faqs }: { faqs: { q: string; a: string }[] }) {
  return (
    <div className="divide-y divide-line rounded-2xl border border-line bg-background">
      {faqs.map((faq) => (
        <details key={faq.q} className="group px-5 py-4 sm:px-6">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
            {faq.q}
            <span
              className="relative size-5 shrink-0 text-signal-600 transition group-open:rotate-45"
              aria-hidden
            >
              <span className="absolute top-1/2 left-0 h-0.5 w-5 -translate-y-1/2 rounded bg-current" />
              <span className="absolute top-0 left-1/2 h-5 w-0.5 -translate-x-1/2 rounded bg-current" />
            </span>
          </summary>
          <p className="mt-3 text-sm leading-relaxed text-muted">{faq.a}</p>
        </details>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------- hero */

export function PageHero({
  eyebrow,
  title,
  description,
  breadcrumbs,
  children,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  breadcrumbs?: { label: string; href?: string }[];
  children?: ReactNode;
}) {
  return (
    <div className="relative overflow-hidden bg-navy-950 text-white">
      <GridBackdrop />
      <Container className="relative py-14 sm:py-18 lg:py-22">
        {breadcrumbs && (
          <div className="mb-6 [&_a]:text-navy-300 [&_a:hover]:text-white [&_span]:text-navy-400 [&_li>span.font-medium]:text-white">
            <Breadcrumbs items={breadcrumbs} />
          </div>
        )}
        {eyebrow && (
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-signal-400">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display mt-3 max-w-4xl text-4xl font-bold uppercase tracking-tight sm:text-5xl lg:text-6xl lg:leading-[1.05]">
          {title}
        </h1>
        <AccentRule tone="inverse" className="mt-6" />
        {description && (
          <p className="mt-6 max-w-3xl text-base leading-relaxed text-navy-200 sm:text-lg">
            {description}
          </p>
        )}
        {children && <div className="mt-8">{children}</div>}
      </Container>
    </div>
  );
}

/** Faint technical grid, echoing the pricing table artwork. */
export function GridBackdrop({ className }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={cx("pointer-events-none absolute inset-0 overflow-hidden", className)}
    >
      <svg className="absolute inset-0 size-full opacity-[0.07]">
        <defs>
          <pattern
            id="prevsol-grid"
            width="56"
            height="56"
            patternUnits="userSpaceOnUse"
          >
            <path d="M56 0H0V56" fill="none" stroke="currentColor" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#prevsol-grid)" />
      </svg>
      <div className="absolute -top-24 -right-24 size-96 rounded-full bg-signal-600/20 blur-3xl" />
      <div className="absolute -bottom-32 -left-20 size-96 rounded-full bg-navy-500/25 blur-3xl" />
    </div>
  );
}

/* ------------------------------------------------------------------ misc */

export function ArrowLink({
  href,
  children,
  className,
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cx(
        "group inline-flex items-center gap-1.5 text-sm font-semibold text-signal-600 transition hover:text-signal-700 dark:text-signal-400 dark:hover:text-signal-300",
        className,
      )}
    >
      {children}
      <ArrowRightIcon className="size-4 transition group-hover:translate-x-0.5" />
    </Link>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-line px-6 py-14 text-center">
      <h3 className="font-display text-xl font-bold uppercase">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-muted">{description}</p>
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}

/** Labelled form field wrapper. */
export function Field({
  label,
  htmlFor,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={htmlFor} className="block text-sm font-semibold">
        {label}
        {required && <span className="ml-0.5 text-signal-600">*</span>}
      </label>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
      <div className="mt-2">{children}</div>
    </div>
  );
}

export const inputClass =
  "w-full rounded-lg border border-navy-200 bg-background px-3.5 py-2.5 text-sm outline-none transition placeholder:text-navy-400 focus:border-signal-500 focus:ring-2 focus:ring-signal-500/20 dark:border-navy-700 dark:placeholder:text-navy-500";
