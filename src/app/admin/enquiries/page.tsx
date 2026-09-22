import Link from "next/link";
import { Panel, PortalHeading } from "@/components/portal-ui";
import { Badge, EmptyState, cx } from "@/components/ui";
import type { EnquiryKind, Prisma } from "@/generated/prisma/client";
import { formatDate } from "@/lib/billing";
import { db } from "@/lib/db";
import { formatDateTime } from "@/lib/portal-format";
import { MarkHandledButton } from "./handled-button";

/**
 * Contact, quote and newsletter submissions.
 *
 * Nothing is deleted here — "handled" is a timestamp, so a lead can always be
 * read back. Quote answers arrive as free-form JSON from the quote wizard, so
 * they are rendered as a definition list rather than dumped as raw JSON.
 */

const kinds = ["CONTACT", "QUOTE", "NEWSLETTER"] as const;

function kindLabel(kind: EnquiryKind) {
  switch (kind) {
    case "CONTACT":
      return "Contact";
    case "QUOTE":
      return "Quote";
    case "NEWSLETTER":
      return "Newsletter";
  }
}

/** Turns "budgetRange" or "budget_range" into "Budget range". */
function humanise(key: string) {
  const spaced = key
    .replace(/[_-]+/g, " ")
    .replace(/([a-z\d])([A-Z])/g, "$1 $2")
    .trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** Renders any JSON value as readable text, never as raw JSON. */
function renderValue(value: Prisma.JsonValue): string {
  if (value === null) return "—";
  if (Array.isArray(value)) {
    return value.length ? value.map(renderValue).join(", ") : "—";
  }
  if (typeof value === "object") {
    return Object.entries(value)
      .map(([k, v]) => `${humanise(k)}: ${renderValue(v ?? null)}`)
      .join(" · ");
  }
  if (typeof value === "boolean") return value ? "Yes" : "No";
  const text = String(value).trim();
  return text.length ? text : "—";
}

/** The quote wizard's JSON answers, as a definition list. */
function AnswerList({ answers }: { answers: Prisma.JsonValue }) {
  if (answers === null || typeof answers !== "object" || Array.isArray(answers)) {
    return null;
  }

  const entries = Object.entries(answers);
  if (entries.length === 0) return null;

  return (
    <div className="mt-4 rounded-xl border border-line bg-surface p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted">
        Quote answers
      </p>
      <dl className="mt-3 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
        {entries.map(([key, value]) => (
          <div key={key}>
            <dt className="text-xs font-semibold text-muted">{humanise(key)}</dt>
            <dd className="mt-0.5 text-sm">{renderValue(value ?? null)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={cx(
        "rounded-lg px-3.5 py-2 text-sm font-medium transition",
        active
          ? "bg-navy-950 text-white dark:bg-white dark:text-navy-950"
          : "border border-line text-muted hover:bg-surface",
      )}
    >
      {children}
    </Link>
  );
}

export default async function AdminEnquiriesPage(
  props: PageProps<"/admin/enquiries">,
) {
  const search = await props.searchParams;

  const rawKind = Array.isArray(search.kind) ? search.kind[0] : search.kind;
  const kind = kinds.find((k) => k === rawKind);

  const rawStatus = Array.isArray(search.status) ? search.status[0] : search.status;
  const status = rawStatus === "all" ? "all" : "new";

  const enquiries = await db.enquiry.findMany({
    where: {
      ...(kind ? { kind } : {}),
      ...(status === "new" ? { handledAt: null } : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const query = (next: { kind?: string; status?: string }) => {
    const params = new URLSearchParams();
    const nextKind = next.kind ?? kind;
    const nextStatus = next.status ?? status;
    if (nextKind) params.set("kind", nextKind);
    if (nextStatus === "all") params.set("status", "all");
    const qs = params.toString();
    return qs ? `/admin/enquiries?${qs}` : "/admin/enquiries";
  };

  return (
    <div className="space-y-6">
      <PortalHeading
        title="Enquiries"
        description="Contact, quote and newsletter submissions, newest first. Nothing is deleted — marking one handled simply clears it from the new queue."
      />

      <Panel>
        <div className="space-y-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Kind
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <FilterLink href={query({ kind: "" })} active={!kind}>
                All kinds
              </FilterLink>
              {kinds.map((k) => (
                <FilterLink key={k} href={query({ kind: k })} active={kind === k}>
                  {kindLabel(k)}
                </FilterLink>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Status
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <FilterLink href={query({ status: "new" })} active={status === "new"}>
                Not yet handled
              </FilterLink>
              <FilterLink href={query({ status: "all" })} active={status === "all"}>
                All submissions
              </FilterLink>
            </div>
          </div>
        </div>
      </Panel>

      {enquiries.length === 0 ? (
        <EmptyState
          title="Nothing to show"
          description={
            status === "new"
              ? "Every enquiry matching this filter has been handled."
              : "No enquiries have been submitted under this filter yet."
          }
        />
      ) : (
        <div className="space-y-4">
          {enquiries.map((enquiry) => (
            <Panel key={enquiry.id}>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Badge tone={enquiry.handledAt ? "neutral" : "signal"}>
                      {kindLabel(enquiry.kind)}
                    </Badge>
                    {enquiry.handledAt ? (
                      <Badge tone="emerald">
                        Handled {formatDate(enquiry.handledAt)}
                      </Badge>
                    ) : (
                      <Badge tone="amber">Awaiting a response</Badge>
                    )}
                  </div>
                  <p className="font-display mt-2.5 text-lg font-bold">
                    {enquiry.subject ?? `${kindLabel(enquiry.kind)} from ${enquiry.name}`}
                  </p>
                  <p className="mt-0.5 text-sm text-muted">
                    Received {formatDateTime(enquiry.createdAt)}
                  </p>
                </div>

                {!enquiry.handledAt && (
                  <MarkHandledButton enquiryId={enquiry.id} />
                )}
              </div>

              <dl className="mt-4 grid gap-x-6 gap-y-2.5 border-t border-line pt-4 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                  <dt className="text-xs font-semibold text-muted">Name</dt>
                  <dd className="mt-0.5 text-sm">{enquiry.name}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold text-muted">Email</dt>
                  <dd className="mt-0.5 text-sm">
                    <a
                      href={`mailto:${enquiry.email}`}
                      className="transition hover:text-signal-600"
                    >
                      {enquiry.email}
                    </a>
                  </dd>
                </div>
                {enquiry.phone && (
                  <div>
                    <dt className="text-xs font-semibold text-muted">Phone</dt>
                    <dd className="mt-0.5 text-sm">
                      <a
                        href={`tel:${enquiry.phone}`}
                        className="transition hover:text-signal-600"
                      >
                        {enquiry.phone}
                      </a>
                    </dd>
                  </div>
                )}
                {enquiry.company && (
                  <div>
                    <dt className="text-xs font-semibold text-muted">Company</dt>
                    <dd className="mt-0.5 text-sm">{enquiry.company}</dd>
                  </div>
                )}
                {enquiry.service && (
                  <div>
                    <dt className="text-xs font-semibold text-muted">Service</dt>
                    <dd className="mt-0.5 text-sm">{enquiry.service}</dd>
                  </div>
                )}
                {enquiry.budget && (
                  <div>
                    <dt className="text-xs font-semibold text-muted">Budget</dt>
                    <dd className="mt-0.5 text-sm">{enquiry.budget}</dd>
                  </div>
                )}
                {enquiry.timeline && (
                  <div>
                    <dt className="text-xs font-semibold text-muted">Timeline</dt>
                    <dd className="mt-0.5 text-sm">{enquiry.timeline}</dd>
                  </div>
                )}
              </dl>

              {enquiry.message && (
                <div className="mt-4 rounded-xl border border-line bg-surface p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                    Message
                  </p>
                  <p className="mt-2 text-sm leading-relaxed whitespace-pre-line">
                    {enquiry.message}
                  </p>
                </div>
              )}

              {enquiry.answers !== null && enquiry.answers !== undefined && (
                <AnswerList answers={enquiry.answers} />
              )}
            </Panel>
          ))}
        </div>
      )}
    </div>
  );
}
