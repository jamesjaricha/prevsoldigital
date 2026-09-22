"use client";

/** Interactive forms inside the portal, posting to server actions. */

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import { changePassword, updateProfile } from "@/app/actions/auth";
import { CheckIcon, LockIcon } from "./icons";
import { Button, Field, cx, inputClass } from "./ui";

function SaveButton({ label = "Save changes" }: { label?: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Saving…" : label}
    </Button>
  );
}

export function ProfileForm({
  defaults,
  email,
}: {
  defaults: {
    name: string;
    company: string;
    phone: string;
    address: string;
    city: string;
  };
  email: string;
}) {
  const [state, action] = useActionState(updateProfile, null);
  const fieldError = (name: string) => state?.fieldErrors?.[name]?.[0];

  return (
    <form action={action}>
      {state?.ok === false && (
        <p
          role="alert"
          className="mb-5 rounded-lg bg-signal-50 px-4 py-3 text-sm text-signal-800 dark:bg-signal-500/10 dark:text-signal-300"
        >
          {state.error}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Full name" htmlFor="pf-name" required hint={fieldError("name")}>
          <input
            id="pf-name"
            name="name"
            required
            defaultValue={defaults.name}
            className={cx(inputClass, fieldError("name") && "border-signal-500")}
          />
        </Field>

        <Field label="Company" htmlFor="pf-company">
          <input
            id="pf-company"
            name="company"
            defaultValue={defaults.company}
            className={inputClass}
          />
        </Field>

        <Field
          label="Email address"
          htmlFor="pf-email"
          hint="Contact support to change the address on your account."
        >
          <input
            id="pf-email"
            type="email"
            value={email}
            readOnly
            disabled
            className={cx(inputClass, "cursor-not-allowed opacity-60")}
          />
        </Field>

        <Field label="Phone" htmlFor="pf-phone">
          <input
            id="pf-phone"
            name="phone"
            type="tel"
            defaultValue={defaults.phone}
            className={inputClass}
          />
        </Field>

        <Field label="Address" htmlFor="pf-address" className="sm:col-span-2">
          <input
            id="pf-address"
            name="address"
            defaultValue={defaults.address}
            className={inputClass}
          />
        </Field>

        <Field label="City" htmlFor="pf-city">
          <input
            id="pf-city"
            name="city"
            defaultValue={defaults.city}
            className={inputClass}
          />
        </Field>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <SaveButton />
        {state?.ok && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-700 dark:text-emerald-400">
            <CheckIcon className="size-4" />
            {state.message}
          </span>
        )}
      </div>
    </form>
  );
}

export function ChangePasswordForm() {
  const [state, action] = useActionState(changePassword, null);
  const fieldError = (name: string) => state?.fieldErrors?.[name]?.[0];

  return (
    <form action={action}>
      {state?.ok === false && (
        <p
          role="alert"
          className="mb-5 rounded-lg bg-signal-50 px-4 py-3 text-sm text-signal-800 dark:bg-signal-500/10 dark:text-signal-300"
        >
          {state.error}
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Current password"
          htmlFor="sec-current"
          className="sm:col-span-2"
          required
        >
          <input
            id="sec-current"
            name="current"
            type="password"
            required
            autoComplete="current-password"
            className={inputClass}
          />
        </Field>

        <Field
          label="New password"
          htmlFor="sec-new"
          hint={fieldError("password") ?? "At least 8 characters."}
          required
        >
          <input
            id="sec-new"
            name="password"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className={cx(inputClass, fieldError("password") && "border-signal-500")}
          />
        </Field>

        <Field
          label="Confirm new password"
          htmlFor="sec-confirm"
          required
          hint={fieldError("confirm")}
        >
          <input
            id="sec-confirm"
            name="confirm"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            className={cx(inputClass, fieldError("confirm") && "border-signal-500")}
          />
        </Field>
      </div>

      <div className="mt-6 flex items-center gap-4">
        <Button type="submit">
          <LockIcon className="size-4" />
          Update password
        </Button>
        {state?.ok && (
          <span className="flex items-center gap-1.5 text-sm text-emerald-700 dark:text-emerald-400">
            <CheckIcon className="size-4" />
            {state.message}
          </span>
        )}
      </div>
    </form>
  );
}
