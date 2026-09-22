"use client";

import { useActionState, useState } from "react";
import { replyToTicket } from "@/app/actions/portal";
import { Button, inputClass } from "@/components/ui";

/**
 * The only interactive part of the ticket page. The server action re-checks
 * ownership, so the hidden ticket id here is a convenience, not a trust point.
 */
export function TicketReplyForm({ ticketId }: { ticketId: string }) {
  const [state, formAction, pending] = useActionState(replyToTicket, null);
  const [draft, setDraft] = useState("");

  return (
    <form
      action={(formData) => {
        setDraft("");
        formAction(formData);
      }}
    >
      <input type="hidden" name="ticketId" value={ticketId} />
      <label htmlFor="reply" className="sr-only">
        Your reply
      </label>
      <textarea
        id="reply"
        name="body"
        rows={4}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Type your reply…"
        className={inputClass}
      />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={!draft.trim() || pending}>
          {pending ? "Sending…" : "Send Reply"}
        </Button>
        <p className="text-xs text-muted">
          Replying moves this ticket back to In Progress.
        </p>
      </div>
      {state && !state.ok && (
        <p className="mt-3 text-sm text-signal-600">{state.error}</p>
      )}
    </form>
  );
}
