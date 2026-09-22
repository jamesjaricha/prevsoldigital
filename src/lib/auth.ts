import "server-only";

import { hash, verify } from "@node-rs/argon2";
import { createHash, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { cache } from "react";
import { db } from "./db";
import type { Role, User } from "@/generated/prisma/client";

/**
 * Session-cookie authentication.
 *
 * Passwords are hashed with Argon2id. Session tokens are random 32-byte values
 * sent to the browser in an httpOnly cookie; only their SHA-256 hash is stored,
 * so a database leak does not hand an attacker usable sessions.
 */

const SESSION_COOKIE = "prevsol_session";
const SESSION_DAYS = 30;

/** OWASP-recommended Argon2id parameters. */
const ARGON_OPTIONS = {
  memoryCost: 19456,
  timeCost: 2,
  parallelism: 1,
} as const;

export async function hashPassword(password: string) {
  return hash(password, ARGON_OPTIONS);
}

export async function verifyPassword(hashed: string, password: string) {
  try {
    return await verify(hashed, password, ARGON_OPTIONS);
  } catch {
    return false;
  }
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

/** Constant-time comparison, for anything secret compared against user input. */
export function safeEqual(a: string, b: string) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

/* ------------------------------------------------------------------ sessions */

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);

  const headerList = await headers();
  await db.session.create({
    data: {
      tokenHash: sha256(token),
      userId,
      expiresAt,
      userAgent: headerList.get("user-agent")?.slice(0, 255),
      ip:
        headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
        headerList.get("x-real-ip") ??
        undefined,
    },
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });

  return token;
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await db.session
      .deleteMany({ where: { tokenHash: sha256(token) } })
      .catch(() => {
        // Already gone — signing out is still successful.
      });
  }
  cookieStore.delete(SESSION_COOKIE);
}

export type SessionUser = Pick<
  User,
  "id" | "email" | "name" | "company" | "clientRef" | "role" | "phone" | "city" | "address"
>;

/**
 * The signed-in user, or null. Wrapped in `cache` so multiple components in one
 * render share a single database query.
 */
export const getCurrentUser = cache(async (): Promise<SessionUser | null> => {
  if (!process.env.DATABASE_URL) return null;

  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const session = await db.session
    .findUnique({
      where: { tokenHash: sha256(token) },
      select: {
        expiresAt: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            company: true,
            clientRef: true,
            role: true,
            phone: true,
            city: true,
            address: true,
          },
        },
      },
    })
    .catch(() => null);

  if (!session) return null;

  if (session.expiresAt < new Date()) {
    await db.session
      .deleteMany({ where: { tokenHash: sha256(token) } })
      .catch(() => {});
    return null;
  }

  return session.user;
});

/** Throws to the caller's error boundary if not signed in. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) throw new Error("UNAUTHENTICATED");
  return user;
}

export async function requireRole(...roles: Role[]): Promise<SessionUser> {
  const user = await requireUser();
  if (!roles.includes(user.role)) throw new Error("FORBIDDEN");
  return user;
}

/* ------------------------------------------------------- one-time tokens */

/**
 * Issues a single-use token for email verification or password reset.
 * Returns the raw token — store only the hash, and email the raw value.
 */
export async function issueToken(
  userId: string,
  purpose: "EMAIL_VERIFICATION" | "PASSWORD_RESET",
  ttlMinutes = 60,
) {
  const token = randomBytes(32).toString("base64url");
  await db.verificationToken.create({
    data: {
      tokenHash: sha256(token),
      userId,
      purpose,
      expiresAt: new Date(Date.now() + ttlMinutes * 60_000),
    },
  });
  return token;
}

/** Consumes a token, returning the user id when it is valid and unused. */
export async function consumeToken(
  token: string,
  purpose: "EMAIL_VERIFICATION" | "PASSWORD_RESET",
) {
  const record = await db.verificationToken.findUnique({
    where: { tokenHash: sha256(token) },
  });

  if (
    !record ||
    record.purpose !== purpose ||
    record.usedAt !== null ||
    record.expiresAt < new Date()
  ) {
    return null;
  }

  await db.verificationToken.update({
    where: { id: record.id },
    data: { usedAt: new Date() },
  });

  return record.userId;
}

/* ----------------------------------------------------------------- audit */

/** Records a security-relevant event. Never throws — logging must not break flows. */
export async function audit(
  action: string,
  options: { userId?: string; detail?: string } = {},
) {
  try {
    const headerList = await headers();
    await db.auditEvent.create({
      data: {
        action,
        userId: options.userId,
        detail: options.detail,
        ip:
          headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ??
          headerList.get("x-real-ip") ??
          undefined,
        userAgent: headerList.get("user-agent")?.slice(0, 255),
      },
    });
  } catch {
    // Auditing is best-effort.
  }
}

/** Generates the next human-facing client reference, e.g. PVS-10429. */
/**
 * Generates the next client reference from a Postgres sequence.
 * Counting rows would race under concurrent registrations and collide on the
 * unique column.
 */
export async function nextClientRef() {
  const rows = await db.$queryRaw<{ nextval: bigint }[]>`
    SELECT nextval('client_ref_seq') AS nextval
  `;
  return `PVS-${Number(rows[0].nextval)}`;
}
