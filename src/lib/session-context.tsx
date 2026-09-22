"use client";

/**
 * Makes the server-resolved session available to client components.
 *
 * The session itself is established by an httpOnly cookie and read on the
 * server; this context only carries the resulting user down the tree so that
 * client components (the header, checkout) can render the right state. It is
 * NOT the source of truth and cannot be used to grant access — every server
 * action and page re-checks the session independently.
 */

import { createContext, useContext, type ReactNode } from "react";

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  clientRef: string;
};

const SessionContext = createContext<SessionUser | null>(null);

export function SessionProvider({
  user,
  children,
}: {
  user: SessionUser | null;
  children: ReactNode;
}) {
  return <SessionContext value={user}>{children}</SessionContext>;
}

/** The signed-in user, or null. */
export function useSession() {
  return useContext(SessionContext);
}
