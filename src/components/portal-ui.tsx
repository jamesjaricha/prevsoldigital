import Link from "next/link";
import type { ReactNode } from "react";
import type {
  InvoiceStatus,
  ServiceStatus,
  TicketStatus,
} from "@/generated/prisma/client";
import {
  invoiceStatusLabel,
  serviceStatusLabel,
  ticketStatusLabel,
} from "@/lib/portal-format";
import { cx } from "./ui";

/* The pill palettes live here now that the seed-data module no longer owns
   them. Colours are unchanged — only the keys became Prisma enum values. */

const statusStyles: Record<ServiceStatus, string> = {
  ACTIVE:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/30",
  PENDING:
    "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/30",
  EXPIRING_SOON:
    "bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-400/30",
  SUSPENDED:
    "bg-signal-50 text-signal-700 ring-signal-600/20 dark:bg-signal-500/10 dark:text-signal-300 dark:ring-signal-400/30",
  TERMINATED:
    "bg-navy-100 text-navy-700 ring-navy-600/20 dark:bg-navy-500/10 dark:text-navy-300 dark:ring-navy-400/30",
};

const ticketStatusStyles: Record<TicketStatus, string> = {
  OPEN: "bg-sky-50 text-sky-700 ring-sky-600/20 dark:bg-sky-500/10 dark:text-sky-300 dark:ring-sky-400/30",
  IN_PROGRESS:
    "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/30",
  AWAITING_CUSTOMER:
    "bg-orange-50 text-orange-700 ring-orange-600/20 dark:bg-orange-500/10 dark:text-orange-300 dark:ring-orange-400/30",
  RESOLVED:
    "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/30",
  CLOSED:
    "bg-navy-100 text-navy-700 ring-navy-600/20 dark:bg-navy-500/10 dark:text-navy-300 dark:ring-navy-400/30",
};

const invoiceStatusStyles: Record<InvoiceStatus, string> = {
  PAID: "bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/30",
  UNPAID:
    "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/30",
  DRAFT:
    "bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-400/30",
  OVERDUE:
    "bg-signal-50 text-signal-700 ring-signal-600/20 dark:bg-signal-500/10 dark:text-signal-300 dark:ring-signal-400/30",
  CANCELLED:
    "bg-navy-100 text-navy-700 ring-navy-600/20 dark:bg-navy-500/10 dark:text-navy-300 dark:ring-navy-400/30",
  REFUNDED:
    "bg-navy-100 text-navy-700 ring-navy-600/20 dark:bg-navy-500/10 dark:text-navy-300 dark:ring-navy-400/30",
};

/** Panel used for every card-shaped block inside the portal. */
export function Panel({
  title,
  action,
  children,
  className,
  padded = true,
}: {
  title?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <section
      className={cx(
        "rounded-2xl border border-line bg-background shadow-card",
        className,
      )}
    >
      {title && (
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <h2 className="font-display text-base font-bold uppercase tracking-tight">
            {title}
          </h2>
          {action}
        </div>
      )}
      <div className={padded ? "p-5" : undefined}>{children}</div>
    </section>
  );
}

export function StatusPill({
  status,
}: {
  status: ServiceStatus;
}) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        statusStyles[status],
      )}
    >
      {serviceStatusLabel(status)}
    </span>
  );
}

export function TicketPill({ status }: { status: TicketStatus }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        ticketStatusStyles[status],
      )}
    >
      {ticketStatusLabel(status)}
    </span>
  );
}

export function InvoicePill({ status }: { status: InvoiceStatus }) {
  return (
    <span
      className={cx(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        invoiceStatusStyles[status],
      )}
    >
      {invoiceStatusLabel(status)}
    </span>
  );
}

/** Overview metric card used across the top of the dashboard. */
export function StatCard({
  label,
  value,
  detail,
  href,
  tone = "default",
  icon,
}: {
  label: string;
  value: string | number;
  detail?: string;
  href?: string;
  tone?: "default" | "alert";
  icon?: ReactNode;
}) {
  const inner = (
    <>
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-muted">
          {label}
        </p>
        {icon && (
          <span
            className={cx(
              "shrink-0",
              tone === "alert" ? "text-signal-600" : "text-navy-400",
            )}
          >
            {icon}
          </span>
        )}
      </div>
      <p
        className={cx(
          "font-display mt-3 text-3xl font-bold",
          tone === "alert" && "text-signal-600 dark:text-signal-400",
        )}
      >
        {value}
      </p>
      {detail && <p className="mt-1 text-xs text-muted">{detail}</p>}
    </>
  );

  const className = cx(
    "block rounded-2xl border bg-background p-5 shadow-card transition",
    tone === "alert" ? "border-signal-200 dark:border-signal-800" : "border-line",
    href && "hover:-translate-y-0.5 hover:shadow-card-hover",
  );

  return href ? (
    <Link href={href} className={className}>
      {inner}
    </Link>
  ) : (
    <div className={className}>{inner}</div>
  );
}

/** Consistent page heading inside the portal. */
export function PortalHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-xl font-bold uppercase tracking-tight">
          {title}
        </h2>
        {description && <p className="mt-1.5 text-sm text-muted">{description}</p>}
      </div>
      {action}
    </div>
  );
}
