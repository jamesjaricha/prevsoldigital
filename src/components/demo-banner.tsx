import Link from "next/link";
import { Container } from "./ui";

/**
 * Demo-mode banner.
 *
 * Shown only when NEXT_PUBLIC_DEMO_MODE is "true". Its job is to make sure
 * nobody mistakes the showcase deployment for the live business: payments are
 * disabled there, and the data is sample data that resets.
 */
export function DemoBanner() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") return null;

  return (
    <div className="border-b border-amber-300 bg-amber-100 text-amber-950 dark:border-amber-700 dark:bg-amber-950/60 dark:text-amber-100">
      <Container className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 py-2 text-center text-xs sm:text-sm">
        <span className="font-semibold uppercase tracking-wide">
          Demonstration site
        </span>
        <span aria-hidden className="hidden sm:inline">
          ·
        </span>
        <span>
          Sample data only. Payments are disabled and no order is real.
        </span>
        <Link
          href="/demo"
          className="font-semibold underline underline-offset-2 hover:no-underline"
        >
          Demo logins
        </Link>
      </Container>
    </div>
  );
}

/** True when this deployment is the public showcase rather than production. */
export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
