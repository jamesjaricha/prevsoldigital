"use client";

import Link from "next/link";
import { use, useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitTicket } from "@/app/actions/enquiries";
import { CheckIcon } from "@/components/icons";
import {
  Button,
  ButtonLink,
  Container,
  Field,
  PageHero,
  Section,
  cx,
  inputClass,
} from "@/components/ui";

const departments = [
  { value: "TECHNICAL", label: "Technical Support" },
  { value: "BILLING", label: "Billing Support" },
  { value: "SALES", label: "Sales Enquiries" },
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Submitting…" : "Submit Ticket"}
    </Button>
  );
}

export default function NewTicketPage(props: PageProps<"/support/new">) {
  const search = use(props.searchParams);
  const raw = typeof search.department === "string" ? search.department : "";
  const preselected =
    raw === "billing" ? "BILLING" : raw === "sales" ? "SALES" : "TECHNICAL";

  const [state, action] = useActionState(submitTicket, null);
  const fieldError = (name: string) => state?.fieldErrors?.[name]?.[0];

  return (
    <>
      <PageHero
        eyebrow="Support"
        title="Submit a Ticket"
        description="Tell us what's happening and we'll get the right person on it."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Support", href: "/support" },
          { label: "Submit a Ticket" },
        ]}
      />

      <Section className="py-12 sm:py-16">
        <Container>
          <div className="mx-auto max-w-3xl">
            {state?.ok ? (
              <div className="rounded-2xl border border-line bg-background p-8 text-center shadow-card sm:p-12">
                <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <CheckIcon className="size-8" />
                </span>
                <h2 className="font-display mt-6 text-2xl font-bold uppercase tracking-tight">
                  Ticket Submitted
                </h2>
                <p className="mt-4 text-muted">
                  Your reference is{" "}
                  <span className="font-display font-bold text-navy-950 dark:text-white">
                    {state.reference}
                  </span>
                  . We&apos;ve emailed you a confirmation.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <ButtonLink href="/portal/tickets" size="lg">
                    View my tickets
                  </ButtonLink>
                  <ButtonLink href="/knowledge-base" variant="outline" size="lg">
                    Browse knowledge base
                  </ButtonLink>
                </div>
              </div>
            ) : (
              <form
                action={action}
                className="rounded-2xl border border-line bg-background p-6 shadow-card sm:p-8"
              >
                {state?.ok === false && (
                  <p
                    role="alert"
                    className="mb-5 rounded-lg bg-signal-50 px-4 py-3 text-sm text-signal-800 dark:bg-signal-500/10 dark:text-signal-300"
                  >
                    {state.error}
                  </p>
                )}

                <div aria-hidden className="absolute -left-[9999px]">
                  <label htmlFor="t-website">Leave this empty</label>
                  <input id="t-website" name="website" tabIndex={-1} autoComplete="off" />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <Field label="Your name" htmlFor="t-name" required hint={fieldError("name")}>
                    <input
                      id="t-name"
                      name="name"
                      required
                      autoComplete="name"
                      className={cx(inputClass, fieldError("name") && "border-signal-500")}
                    />
                  </Field>

                  <Field label="Email address" htmlFor="t-email" required hint={fieldError("email")}>
                    <input
                      id="t-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      className={cx(inputClass, fieldError("email") && "border-signal-500")}
                    />
                  </Field>

                  <Field label="Department" htmlFor="t-dept" required>
                    <select
                      id="t-dept"
                      name="department"
                      required
                      defaultValue={preselected}
                      className={inputClass}
                    >
                      {departments.map((d) => (
                        <option key={d.value} value={d.value}>
                          {d.label}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Priority" htmlFor="t-priority" required>
                    <select
                      id="t-priority"
                      name="priority"
                      required
                      defaultValue="MEDIUM"
                      className={inputClass}
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </Field>

                  <Field
                    label="Related service"
                    htmlFor="t-service"
                    hint="Optional — helps us find your account faster."
                    className="sm:col-span-2"
                  >
                    <input
                      id="t-service"
                      name="relatedService"
                      className={inputClass}
                      placeholder="e.g. Business Hosting, or your domain name"
                    />
                  </Field>

                  <Field
                    label="Subject"
                    htmlFor="t-subject"
                    required
                    hint={fieldError("subject")}
                    className="sm:col-span-2"
                  >
                    <input
                      id="t-subject"
                      name="subject"
                      required
                      className={cx(inputClass, fieldError("subject") && "border-signal-500")}
                      placeholder="Briefly, what's the issue?"
                    />
                  </Field>

                  <Field
                    label="Message"
                    htmlFor="t-message"
                    hint={
                      fieldError("message") ??
                      "Include any error messages, the URL affected, and what you were doing when it happened."
                    }
                    required
                    className="sm:col-span-2"
                  >
                    <textarea
                      id="t-message"
                      name="message"
                      required
                      rows={6}
                      className={cx(inputClass, fieldError("message") && "border-signal-500")}
                    />
                  </Field>
                </div>

                <div className="mt-7 flex flex-wrap items-center gap-4">
                  <SubmitButton />
                  <p className="text-sm text-muted">
                    Or{" "}
                    <Link
                      href="/knowledge-base"
                      className="font-semibold text-signal-600 hover:underline"
                    >
                      search the knowledge base
                    </Link>{" "}
                    first.
                  </p>
                </div>
              </form>
            )}
          </div>
        </Container>
      </Section>
    </>
  );
}
