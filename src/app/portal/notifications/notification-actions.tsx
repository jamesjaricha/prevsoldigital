"use client";

import Link from "next/link";
import { useTransition, type ReactNode } from "react";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/app/actions/portal";
import { Button } from "@/components/ui";

/** "Mark all as read", shown only while something is unread. */
export function MarkAllReadButton() {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() => startTransition(() => markAllNotificationsRead())}
    >
      Mark all as read
    </Button>
  );
}

/**
 * A notification row. Following the link also marks it read; the action
 * re-checks ownership server-side before writing.
 */
export function NotificationLink({
  id,
  href,
  className,
  children,
}: {
  id: string;
  href: string;
  className?: string;
  children: ReactNode;
}) {
  const [, startTransition] = useTransition();

  return (
    <Link
      href={href}
      className={className}
      onClick={() => startTransition(() => markNotificationRead(id))}
    >
      {children}
    </Link>
  );
}
