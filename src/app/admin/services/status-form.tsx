"use client";

import { useActionState, useState } from "react";
import { setServiceStatus } from "@/app/actions/admin";
import { Button, cx, inputClass } from "@/components/ui";
import type { ServiceStatus } from "@/generated/prisma/client";
import { serviceStatusLabel } from "@/lib/portal-format";

const options = [
  "PENDING",
  "ACTIVE",
  "EXPIRING_SOON",
  "SUSPENDED",
  "TERMINATED",
] as const satisfies readonly ServiceStatus[];

/**
 * Status dropdown for one service. Setting a service to Active notifies the
 * client, so the change is applied on submit rather than on selection.
 */
export function ServiceStatusForm({
  serviceId,
  status,
}: {
  serviceId: string;
  status: ServiceStatus;
}) {
  const [state, formAction, pending] = useActionState(setServiceStatus, null);
  const [choice, setChoice] = useState<ServiceStatus>(status);

  return (
    <form action={formAction} className="flex flex-wrap items-center justify-end gap-2">
      <input type="hidden" name="id" value={serviceId} />
      <label htmlFor={`status-${serviceId}`} className="sr-only">
        Service status
      </label>
      <select
        id={`status-${serviceId}`}
        name="status"
        value={choice}
        onChange={(e) => setChoice(e.target.value as ServiceStatus)}
        className={cx(inputClass, "w-auto py-2 text-xs")}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {serviceStatusLabel(option)}
          </option>
        ))}
      </select>
      <Button
        type="submit"
        variant="outline"
        size="sm"
        disabled={pending || choice === status}
      >
        {pending ? "Saving…" : "Update"}
      </Button>
      {state && !state.ok && (
        <p className="w-full text-right text-xs text-signal-600">{state.error}</p>
      )}
    </form>
  );
}
