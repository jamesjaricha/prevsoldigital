import Link from "next/link";
import type { Service } from "@/content/services";
import { serviceIcons, ArrowRightIcon } from "./icons";
import { cx } from "./ui";

/**
 * The compact services card.
 *
 * This is the pattern the client asked for: every service sits in one
 * section, and clicking any card opens that service's own dedicated page.
 * The whole card is the link target, with the heading carrying the
 * accessible name.
 */
export function ServiceCard({
  service,
  className,
}: {
  service: Service;
  className?: string;
}) {
  const Icon = serviceIcons[service.icon];

  return (
    <article
      className={cx(
        "group relative flex flex-col rounded-2xl border border-line bg-background p-6 shadow-card transition duration-200 hover:-translate-y-1 hover:border-signal-300 hover:shadow-card-hover",
        className,
      )}
    >
      {/* Icon tile */}
      <span className="inline-flex size-12 items-center justify-center rounded-xl bg-navy-950 text-white transition group-hover:bg-signal-600">
        <Icon className="size-6" />
      </span>

      <h3 className="font-display mt-5 text-lg font-bold uppercase tracking-tight">
        <Link
          href={`/services/${service.slug}`}
          className="after:absolute after:inset-0 focus-visible:outline-none"
        >
          {service.name}
          <span className="sr-only"> — view service details</span>
        </Link>
      </h3>

      <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted">
        {service.summary}
      </p>

      {/* Two representative capabilities, to hint at depth without crowding. */}
      <ul className="mt-4 space-y-1.5 text-xs text-muted">
        {service.capabilities.slice(0, 3).map((c) => (
          <li key={c} className="flex items-start gap-2">
            <span
              className="mt-1.5 size-1 shrink-0 rounded-full bg-signal-500"
              aria-hidden
            />
            {c}
          </li>
        ))}
      </ul>

      <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-signal-600 dark:text-signal-400">
        Explore service
        <ArrowRightIcon className="size-4 transition group-hover:translate-x-1" />
      </span>
    </article>
  );
}
