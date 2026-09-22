"use client";

/**
 * Quote request form — requirements doc §16.
 * "The form should dynamically display additional questions depending on the
 * selected service." Each service below carries its own follow-up questions.
 */

import { useActionState, useState } from "react";
import { useFormStatus } from "react-dom";
import { submitQuote } from "@/app/actions/enquiries";
import { CheckIcon } from "./icons";
import { Button, ButtonLink, Field, cx, inputClass } from "./ui";

type Question =
  | { kind: "text"; id: string; label: string; hint?: string; placeholder?: string }
  | { kind: "textarea"; id: string; label: string; hint?: string }
  | { kind: "select"; id: string; label: string; options: string[]; hint?: string }
  | { kind: "checkboxes"; id: string; label: string; options: string[] };

type QuoteService = {
  value: string;
  label: string;
  questions: Question[];
};

/** The nine service options listed in §16, each with tailored questions. */
const quoteServices: QuoteService[] = [
  {
    value: "website-development",
    label: "Website Development",
    questions: [
      {
        kind: "select",
        id: "site-type",
        label: "What kind of website do you need?",
        options: [
          "Brochure / corporate site",
          "E-commerce store",
          "School or institution site",
          "Healthcare site",
          "NGO site",
          "Portfolio",
          "Landing page",
          "Redesign of an existing site",
        ],
      },
      {
        kind: "select",
        id: "site-pages",
        label: "Roughly how many pages?",
        options: ["Up to 5", "6–10", "11–20", "More than 20", "Not sure yet"],
      },
      {
        kind: "checkboxes",
        id: "site-features",
        label: "Which features do you need?",
        options: [
          "Online store and payments",
          "Booking or appointments",
          "Client login area",
          "Blog or news",
          "Multi-language",
          "Live chat",
          "Newsletter signup",
        ],
      },
      {
        kind: "text",
        id: "site-existing",
        label: "Existing website address",
        hint: "Leave blank if this is a new site.",
        placeholder: "https://",
      },
    ],
  },
  {
    value: "software-development",
    label: "Software Development",
    questions: [
      {
        kind: "select",
        id: "sw-type",
        label: "What type of system?",
        options: [
          "Business management system",
          "School management system",
          "HR system",
          "Inventory system",
          "CRM",
          "Booking system",
          "Customer portal",
          "Mobile app",
          "ERP",
          "Something else",
        ],
      },
      {
        kind: "select",
        id: "sw-users",
        label: "How many people will use it?",
        options: ["1–10", "11–50", "51–200", "More than 200", "Not sure yet"],
      },
      {
        kind: "textarea",
        id: "sw-process",
        label: "What process should it replace or improve?",
        hint: "Describe how the work is done today, including any spreadsheets or paper.",
      },
      {
        kind: "text",
        id: "sw-integrations",
        label: "Systems it must integrate with",
        placeholder: "Accounting, payroll, payment gateway…",
      },
    ],
  },
  {
    value: "digital-marketing",
    label: "Digital Marketing",
    questions: [
      {
        kind: "checkboxes",
        id: "dm-channels",
        label: "Which channels matter to you?",
        options: [
          "Facebook",
          "Instagram",
          "LinkedIn",
          "WhatsApp channel",
          "Google Search",
          "Email marketing",
        ],
      },
      {
        kind: "select",
        id: "dm-goal",
        label: "What is the primary goal?",
        options: [
          "Generate leads",
          "Drive online sales",
          "Grow brand awareness",
          "Grow followers and engagement",
          "Launch a new product",
        ],
      },
      {
        kind: "select",
        id: "dm-spend",
        label: "Monthly advertising budget",
        options: [
          "Under $100",
          "$100 – $300",
          "$300 – $1,000",
          "Over $1,000",
          "Not decided yet",
        ],
      },
      {
        kind: "text",
        id: "dm-handles",
        label: "Your current social handles",
        placeholder: "@yourcompany",
      },
    ],
  },
  {
    value: "data-protection",
    label: "Data Protection Consultancy",
    questions: [
      {
        kind: "select",
        id: "dp-licence",
        label: "Do you hold a Data Controller Licence?",
        options: ["Yes", "No", "Application in progress", "Not sure"],
        hint: "The licensing deadline passed on 12 March 2025.",
      },
      {
        kind: "select",
        id: "dp-dpo",
        label: "Have you appointed a Data Protection Officer?",
        options: [
          "Yes, internally",
          "Yes, outsourced",
          "No",
          "Not sure whether we need one",
        ],
      },
      {
        kind: "checkboxes",
        id: "dp-needs",
        label: "What do you need help with?",
        options: [
          "POTRAZ inspection readiness",
          "Data Controller licensing",
          "Outsourced DPO services",
          "Policies and privacy notices",
          "Records of Processing Activities (ROPA)",
          "Data Protection Impact Assessments",
          "Staff training",
          "Breach response planning",
        ],
      },
      {
        kind: "select",
        id: "dp-size",
        label: "How many staff does your organisation have?",
        options: ["1–10", "11–50", "51–200", "201–500", "More than 500"],
      },
      {
        kind: "select",
        id: "dp-sensitive",
        label: "Do you process sensitive personal data?",
        options: [
          "Yes — health data",
          "Yes — financial data",
          "Yes — biometric data",
          "Yes — children's data",
          "No",
          "Not sure",
        ],
      },
    ],
  },
  {
    value: "cybersecurity",
    label: "Cybersecurity",
    questions: [
      {
        kind: "checkboxes",
        id: "cs-needs",
        label: "What do you need?",
        options: [
          "Security assessment",
          "Penetration testing",
          "Incident response",
          "Staff security awareness training",
          "Endpoint protection",
          "Network security review",
        ],
      },
      {
        kind: "select",
        id: "cs-incident",
        label: "Are you dealing with an active incident?",
        options: ["No", "Yes — suspected", "Yes — confirmed"],
        hint: "If yes, call us on +263 78 640 6989 rather than waiting for a quote.",
      },
      {
        kind: "text",
        id: "cs-scope",
        label: "Roughly how many devices or endpoints?",
        placeholder: "e.g. 25 laptops, 3 servers",
      },
    ],
  },
  {
    value: "cloud-services",
    label: "Cloud Services",
    questions: [
      {
        kind: "select",
        id: "cl-platform",
        label: "Which platform are you considering?",
        options: [
          "Microsoft 365",
          "Google Workspace",
          "Not sure — advise me",
          "Other cloud infrastructure",
        ],
      },
      {
        kind: "select",
        id: "cl-users",
        label: "How many users need licences?",
        options: ["1–10", "11–50", "51–200", "More than 200"],
      },
      {
        kind: "select",
        id: "cl-current",
        label: "What are you migrating from?",
        options: [
          "On-premise server",
          "Another cloud provider",
          "Consumer email (Gmail, Yahoo)",
          "Nothing — starting fresh",
        ],
      },
    ],
  },
  {
    value: "it-consulting",
    label: "IT Consulting",
    questions: [
      {
        kind: "checkboxes",
        id: "it-areas",
        label: "Which areas do you need advice on?",
        options: [
          "Digital transformation strategy",
          "ICT strategy",
          "Infrastructure planning",
          "Process automation",
          "IT governance",
          "Project management",
          "CCTV and access control",
        ],
      },
      {
        kind: "textarea",
        id: "it-challenge",
        label: "What problem are you trying to solve?",
        hint: "Describe the business problem rather than the technology you think you need.",
      },
    ],
  },
  {
    value: "hosting",
    label: "Hosting",
    questions: [
      {
        kind: "select",
        id: "h-type",
        label: "What type of hosting?",
        options: [
          "Shared hosting",
          "Business hosting",
          "VPS",
          "Cloud hosting",
          "Email hosting only",
          "Not sure — advise me",
        ],
      },
      {
        kind: "select",
        id: "h-migration",
        label: "Are you migrating an existing site?",
        options: ["Yes", "No — new site", "Not sure"],
      },
      {
        kind: "text",
        id: "h-traffic",
        label: "Approximate monthly visitors",
        placeholder: "e.g. 5,000",
      },
    ],
  },
  {
    value: "other",
    label: "Other",
    questions: [
      {
        kind: "textarea",
        id: "other-detail",
        label: "What do you need?",
        hint: "Describe what you're looking for and we'll point you at the right team.",
      },
    ],
  },
];

/** Maps service page slugs onto the quote form's service values. */
const slugAliases: Record<string, string> = {
  "website-design-development": "website-development",
  "custom-software": "software-development",
  "digital-marketing": "digital-marketing",
  "data-protection": "data-protection",
  "cloud-solutions": "cloud-services",
  "it-consultancy": "it-consulting",
  "web-hosting": "hosting",
  "ecommerce-consultancy": "website-development",
  branding: "other",
  "photography-videography": "other",
};


function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Sending…" : "Request Quote"}
    </Button>
  );
}

export function QuoteForm({
  initialService,
  initialPackage,
}: {
  initialService?: string;
  initialPackage?: string;
}) {
  const resolved = initialService
    ? (slugAliases[initialService] ?? initialService)
    : "";
  const [service, setService] = useState(
    quoteServices.some((s) => s.value === resolved) ? resolved : "",
  );
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [state, action] = useActionState(submitQuote, null);

  const active = quoteServices.find((s) => s.value === service);
  const fieldError = (name: string) => state?.fieldErrors?.[name]?.[0];

  function setAnswer(id: string, value: string | string[]) {
    setAnswers((current) => ({ ...current, [id]: value }));
  }

  function toggleCheckbox(id: string, option: string) {
    setAnswers((current) => {
      const existing = Array.isArray(current[id]) ? (current[id] as string[]) : [];
      return {
        ...current,
        [id]: existing.includes(option)
          ? existing.filter((o) => o !== option)
          : [...existing, option],
      };
    });
  }

  if (state?.ok) {
    return (
      <div className="rounded-2xl border border-line bg-background p-8 text-center shadow-card sm:p-12">
        <span className="mx-auto flex size-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
          <CheckIcon className="size-8" />
        </span>
        <h2 className="font-display mt-6 text-2xl font-bold uppercase tracking-tight">
          Quote Request Received
        </h2>
        <p className="mt-4 text-muted">{state.message}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/services" size="lg">
            Explore our services
          </ButtonLink>
          <ButtonLink href="/" variant="outline" size="lg">
            Back to home
          </ButtonLink>
        </div>
      </div>
    );
  }

  return (
    <form
      action={action}
      className="rounded-2xl border border-line bg-background p-6 shadow-card sm:p-8"
    >
      {state?.ok === false && (
        <p
          role="alert"
          className="mb-6 rounded-lg bg-signal-50 px-4 py-3 text-sm text-signal-800 dark:bg-signal-500/10 dark:text-signal-300"
        >
          {state.error}
        </p>
      )}

      {/* Honeypot */}
      <div aria-hidden className="absolute -left-[9999px]">
        <label htmlFor="q-website">Leave this empty</label>
        <input id="q-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {/* The dynamic answers travel as one JSON field. */}
      <input type="hidden" name="answers" value={JSON.stringify(answers)} />

      {/* Service selection */}
      <fieldset>
        <legend className="font-display text-lg font-bold uppercase tracking-tight">
          What do you need a quote for?
        </legend>
        <div className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {quoteServices.map((s) => (
            <label
              key={s.value}
              className={cx(
                "flex cursor-pointer items-center gap-2.5 rounded-xl border px-4 py-3 text-sm font-medium transition",
                service === s.value
                  ? "border-signal-600 bg-signal-50/60 ring-1 ring-signal-600 dark:bg-signal-500/10"
                  : "border-line hover:border-navy-300",
              )}
            >
              <input
                type="radio"
                name="service"
                value={s.label}
                checked={service === s.value}
                onChange={() => {
                  setService(s.value);
                  setAnswers({});
                }}
                className="size-4 shrink-0 accent-signal-600"
                required
              />
              {s.label}
            </label>
          ))}
        </div>
      </fieldset>

      {/* Dynamic questions for the selected service */}
      {active && active.questions.length > 0 && (
        <fieldset className="mt-8 border-t border-line pt-8">
          <legend className="font-display text-lg font-bold uppercase tracking-tight">
            About your {active.label.toLowerCase()} project
          </legend>

          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            {active.questions.map((q) => {
              const wide =
                q.kind === "textarea" || q.kind === "checkboxes"
                  ? "sm:col-span-2"
                  : undefined;

              if (q.kind === "checkboxes") {
                const selected = Array.isArray(answers[q.id])
                  ? (answers[q.id] as string[])
                  : [];
                return (
                  <div key={q.id} className={wide}>
                    <p className="text-sm font-semibold">{q.label}</p>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      {q.options.map((option) => (
                        <label
                          key={option}
                          className="flex items-center gap-2.5 rounded-lg border border-line px-3.5 py-2.5 text-sm transition hover:border-navy-300"
                        >
                          <input
                            type="checkbox"
                            checked={selected.includes(option)}
                            onChange={() => toggleCheckbox(q.id, option)}
                            className="size-4 shrink-0 rounded accent-signal-600"
                          />
                          {option}
                        </label>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <Field
                  key={q.id}
                  label={q.label}
                  htmlFor={q.id}
                  hint={q.hint}
                  className={wide}
                >
                  {q.kind === "select" ? (
                    <select
                      id={q.id}
                      value={(answers[q.id] as string) ?? ""}
                      onChange={(e) => setAnswer(q.id, e.target.value)}
                      className={inputClass}
                    >
                      <option value="">Select…</option>
                      {q.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : q.kind === "textarea" ? (
                    <textarea
                      id={q.id}
                      rows={4}
                      value={(answers[q.id] as string) ?? ""}
                      onChange={(e) => setAnswer(q.id, e.target.value)}
                      className={inputClass}
                    />
                  ) : (
                    <input
                      id={q.id}
                      type="text"
                      placeholder={q.placeholder}
                      value={(answers[q.id] as string) ?? ""}
                      onChange={(e) => setAnswer(q.id, e.target.value)}
                      className={inputClass}
                    />
                  )}
                </Field>
              );
            })}
          </div>
        </fieldset>
      )}

      {/* Contact details */}
      <fieldset className="mt-8 border-t border-line pt-8">
        <legend className="font-display text-lg font-bold uppercase tracking-tight">
          How can we reach you?
        </legend>

        <div className="mt-5 grid gap-5 sm:grid-cols-2">
          <Field label="Full name" htmlFor="q-name" required hint={fieldError("name")}>
            <input
              id="q-name"
              name="name"
              required
              autoComplete="name"
              className={cx(inputClass, fieldError("name") && "border-signal-500")}
            />
          </Field>
          <Field label="Company" htmlFor="q-company">
            <input
              id="q-company"
              name="company"
              autoComplete="organization"
              className={inputClass}
            />
          </Field>
          <Field label="Email" htmlFor="q-email" required hint={fieldError("email")}>
            <input
              id="q-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className={cx(inputClass, fieldError("email") && "border-signal-500")}
            />
          </Field>
          <Field label="Phone" htmlFor="q-phone" required hint={fieldError("phone")}>
            <input
              id="q-phone"
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              className={cx(inputClass, fieldError("phone") && "border-signal-500")}
              placeholder="+263 …"
            />
          </Field>
          <Field label="Indicative budget" htmlFor="q-budget">
            <select id="q-budget" name="budget" className={inputClass}>
              <option value="">Prefer not to say</option>
              <option>Under $500</option>
              <option>$500 – $1,500</option>
              <option>$1,500 – $5,000</option>
              <option>$5,000 – $15,000</option>
              <option>Over $15,000</option>
            </select>
          </Field>
          <Field label="When do you need this?" htmlFor="q-timeline">
            <select id="q-timeline" name="timeline" className={inputClass}>
              <option value="">No fixed deadline</option>
              <option>As soon as possible</option>
              <option>Within a month</option>
              <option>Within three months</option>
              <option>Later this year</option>
            </select>
          </Field>
          <Field
            label="Anything else we should know?"
            htmlFor="q-notes"
            className="sm:col-span-2"
          >
            <textarea
              id="q-notes"
              name="notes"
              rows={4}
              defaultValue={
                initialPackage ? `Interested in the ${initialPackage} package.` : ""
              }
              className={inputClass}
            />
          </Field>
        </div>
      </fieldset>

      <div className="mt-8 flex flex-wrap items-center gap-4">
        <SubmitButton />
        <p className="text-sm text-muted">
          No obligation. We respond within two working days.
        </p>
      </div>
    </form>
  );
}
