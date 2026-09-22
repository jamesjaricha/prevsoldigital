"use client";

/** Contact form — requirements doc §15 field list. Posts to a server action. */

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { submitContact } from "@/app/actions/enquiries";
import { services } from "@/content/services";
import { CheckIcon } from "./icons";
import { Button, ButtonLink, Field, cx, inputClass } from "./ui";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Sending…" : "Send Message"}
    </Button>
  );
}

export function ContactForm() {
  const [state, action] = useActionState(submitContact, null);

  if (state?.ok) {
    return (
      <div className="rounded-2xl border border-line bg-background p-8 text-center shadow-card">
        <span className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
          <CheckIcon className="size-7" />
        </span>
        <h3 className="font-display mt-5 text-xl font-bold uppercase">
          Message sent
        </h3>
        <p className="mt-3 text-sm text-muted">{state.message}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <ButtonLink href="/services" variant="outline" size="sm">
            Explore our services
          </ButtonLink>
        </div>
      </div>
    );
  }

  const fieldError = (name: string) => state?.fieldErrors?.[name]?.[0];

  return (
    <form
      action={action}
      className="rounded-2xl border border-line bg-background p-6 shadow-card sm:p-7"
    >
      {state?.error && (
        <p
          role="alert"
          className="mb-5 rounded-lg bg-signal-50 px-4 py-3 text-sm text-signal-800 dark:bg-signal-500/10 dark:text-signal-300"
        >
          {state.error}
        </p>
      )}

      {/* Honeypot — hidden from people, tempting to bots. */}
      <div aria-hidden className="absolute -left-[9999px]">
        <label htmlFor="c-website">Leave this empty</label>
        <input id="c-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" htmlFor="c-name" required hint={fieldError("name")}>
          <input
            id="c-name"
            name="name"
            required
            autoComplete="name"
            className={cx(inputClass, fieldError("name") && "border-signal-500")}
          />
        </Field>

        <Field label="Company" htmlFor="c-company">
          <input
            id="c-company"
            name="company"
            autoComplete="organization"
            className={inputClass}
          />
        </Field>

        <Field label="Email" htmlFor="c-email" required hint={fieldError("email")}>
          <input
            id="c-email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className={cx(inputClass, fieldError("email") && "border-signal-500")}
            placeholder="you@company.co.zw"
          />
        </Field>

        <Field label="Phone" htmlFor="c-phone" required hint={fieldError("phone")}>
          <input
            id="c-phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            className={cx(inputClass, fieldError("phone") && "border-signal-500")}
            placeholder="+263 …"
          />
        </Field>

        <Field
          label="Service interested in"
          htmlFor="c-service"
          className="sm:col-span-2"
        >
          <select id="c-service" name="service" className={inputClass}>
            <option value="">Select a service…</option>
            {services.map((s) => (
              <option key={s.slug} value={s.name}>
                {s.name}
              </option>
            ))}
            <option value="Something else">Something else</option>
          </select>
        </Field>

        <Field
          label="Subject"
          htmlFor="c-subject"
          required
          hint={fieldError("subject")}
          className="sm:col-span-2"
        >
          <input
            id="c-subject"
            name="subject"
            required
            className={cx(inputClass, fieldError("subject") && "border-signal-500")}
          />
        </Field>

        <Field
          label="Message"
          htmlFor="c-message"
          required
          hint={fieldError("message")}
          className="sm:col-span-2"
        >
          <textarea
            id="c-message"
            name="message"
            required
            rows={5}
            className={cx(inputClass, fieldError("message") && "border-signal-500")}
            placeholder="Tell us what you're trying to achieve…"
          />
        </Field>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-4">
        <SubmitButton />
        <p className="text-xs text-muted">We reply within one business day.</p>
      </div>
    </form>
  );
}
