"use client";

import { useActionState, useState } from "react";
import { replyAsStaff } from "@/app/actions/admin";
import { Button, Field, cx, inputClass } from "@/components/ui";
import type { TicketStatus } from "@/generated/prisma/client";
import { ticketStatusLabel } from "@/lib/portal-format";

const options = [
  "OPEN",
  "IN_PROGRESS",
  "AWAITING_CUSTOMER",
  "RESOLVED",
  "CLOSED",
] as const satisfies readonly TicketStatus[];

/**
 * Staff reply. The status the reply leaves the ticket in is chosen with the
 * reply itself, so a single submit both answers the client and moves the
 * ticket on — the reply is emailed to them either way.
 */
export function StaffReplyForm({
  ticketId,
  status,
}: {
  ticketId: string;
  status: TicketStatus;
}) {
  const [state, formAction, pending] = useActionState(replyAsStaff, null);
  const [draft, setDraft] = useState("");

  // A reply usually means the ball is back in the client's court.
  const suggested: TicketStatus =
    status === "CLOSED" || status === "RESOLVED" ? status : "AWAITING_CUSTOMER";

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
        rows={5}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        placeholder="Type your reply to the client…"
        className={inputClass}
      />

      <div className="mt-3 flex flex-wrap items-end gap-3">
        <Field
          label="Set status to"
          htmlFor="status"
          hint="Applied when the reply is sent."
          className="min-w-52"
        >
          <select
            id="status"
            name="status"
            defaultValue={suggested}
            className={cx(inputClass, "w-auto")}
          >
            {options.map((option) => (
              <option key={option} value={option}>
                {ticketStatusLabel(option)}
              </option>
            ))}
          </select>
        </Field>
        <Button type="submit" disabled={!draft.trim() || pending} className="mb-0.5">
          {pending ? "Sending…" : "Send reply"}
        </Button>
      </div>

      <p className="mt-3 text-xs text-muted">
        The reply is emailed to the client and, where they hold an account, added
        to their portal notifications.
      </p>

      {state && !state.ok && (
        <p className="mt-3 text-sm text-signal-600">{state.error}</p>
      )}
      {state?.ok && (
        <p className="mt-3 text-sm text-emerald-600">{state.message}</p>
      )}
    </form>
  );
}
