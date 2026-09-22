import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { PortalChrome } from "@/components/portal-chrome";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";

/**
 * Client portal shell — requirements doc §11.
 *
 * The guard lives here, on the server: an unauthenticated visitor is
 * redirected before any portal markup is generated, so protected data never
 * reaches the browser. Every page below re-checks independently.
 */

/**
 * These pages are per-user and must never be prerendered: they depend on the
 * session cookie, and at build time there is no request and no database.
 */
export const dynamic = "force-dynamic";

export default async function PortalLayout({
  children,
}: {
  children: ReactNode;
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const unread = await db.notification
    .count({ where: { userId: user.id, readAt: null } })
    .catch(() => 0);

  return (
    <PortalChrome
      user={{
        name: user.name,
        company: user.company,
        clientRef: user.clientRef,
      }}
      unread={unread}
    >
      {children}
    </PortalChrome>
  );
}
