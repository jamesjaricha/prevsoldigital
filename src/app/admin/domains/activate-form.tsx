"use client";

import { useActionState } from "react";
import { activateDomain } from "@/app/actions/admin";
import { Button, Field, inputClass } from "@/components/ui";

/**
 * Marks a manually-registered domain live.
 *
 * The registrar reference is optional because ZISPA does not always return one
 * — a staff member may only have the confirmation email to go on.
 */
export function ActivateDomainForm({
  domainId,
  fqdn,
}: {
  domainId: string;
  fqdn: string;
}) {
  const [state, formAction, pending] = useActionState(activateDomain, null);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-3">
      <input type="hidden" name="id" value={domainId} />
      <Field
        label="Registrar reference"
        htmlFor={`registrarRef-${domainId}`}
        hint="Optional — the ZISPA confirmation reference, if you have one."
        className="min-w-56 flex-1"
      >
        <input
          id={`registrarRef-${domainId}`}
          name="registrarRef"
          type="text"
          maxLength={120}
          placeholder="e.g. ZISPA-2026-0184"
          className={inputClass}
        />
      </Field>
      <Button type="submit" disabled={pending}>
        {pending ? "Activating…" : "Activate"}
      </Button>
      {state && !state.ok && (
        <p className="w-full text-sm text-signal-600">{state.error}</p>
      )}
      {state?.ok && (
        <p className="w-full text-sm text-emerald-600">
          {fqdn} is now live. The client has been emailed.
        </p>
      )}
    </form>
  );
}
