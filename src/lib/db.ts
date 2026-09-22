import "server-only";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

/**
 * Prisma client singleton.
 *
 * Two things this has to survive:
 *
 *  1. **Hot reload.** Next.js re-evaluates modules on every edit, which would
 *     otherwise open a new connection pool each time until Postgres refuses
 *     new clients. The instance is cached on `globalThis`.
 *
 *  2. **Build time with no database.** Static generation imports this module
 *     while prerendering, and on a fresh deployment DATABASE_URL may not be
 *     set yet. Constructing eagerly would fail the whole build, so the client
 *     is created lazily on first query. Pages that catch their own errors then
 *     degrade to an empty state instead of taking the site down.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createClient() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and fill it in.",
    );
  }

  return new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createClient();
  }
  return globalForPrisma.prisma;
}

/**
 * The database client.
 *
 * A Proxy so the underlying client is only constructed when a property is
 * actually read — i.e. on the first query, not when the module is imported.
 */
export const db = new Proxy({} as PrismaClient, {
  get(_target, property, receiver) {
    const client = getClient();
    const value = Reflect.get(client, property, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});

/** True when a database is configured, so callers can degrade gracefully. */
export const hasDatabase = () => Boolean(process.env.DATABASE_URL);
