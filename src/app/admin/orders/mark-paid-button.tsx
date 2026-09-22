"use client";

import { useActionState } from "react";
import { markOrderPaid } from "@/app/actions/admin";
import { Button } from "@/components/ui";

/**
 * Confirms an offline payment. The action provisions the order's services and
 * emails the client, so it is deliberately a single deliberate press with no
 * optimistic state.
 */
export function MarkPaidButton({ orderId }: { orderId: string }) {
  const [state, formAction, pending] = useActionState(markOrderPaid, null);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-3">
      <input type="hidden" name="id" value={orderId} />
      <Button type="submit" size="sm" disabled={pending}>
        {pending ? "Processing…" : "Mark paid & provision"}
      </Button>
      {state && !state.ok && (
        <p className="text-xs text-signal-600">{state.error}</p>
      )}
      {state?.ok && <p className="text-xs text-emerald-600">{state.message}</p>}
    </form>
  );
}
