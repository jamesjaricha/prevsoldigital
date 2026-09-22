"use client";

import { useActionState } from "react";
import { markEnquiryHandled } from "@/app/actions/admin";
import { Button } from "@/components/ui";

/**
 * The only interactive part of the enquiries page. The action re-checks the
 * caller's role, so the hidden id here is a convenience, not a trust point.
 */
export function MarkHandledButton({ enquiryId }: { enquiryId: string }) {
  const [state, formAction, pending] = useActionState(markEnquiryHandled, null);

  return (
    <form action={formAction} className="flex flex-col items-end gap-1.5">
      <input type="hidden" name="id" value={enquiryId} />
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {pending ? "Saving…" : "Mark handled"}
      </Button>
      {state && !state.ok && (
        <p className="text-xs text-signal-600">{state.error}</p>
      )}
    </form>
  );
}
