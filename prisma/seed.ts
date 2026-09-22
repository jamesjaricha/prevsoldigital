/**
 * Seeds the database.
 *
 * Safe to run repeatedly: products are upserted by slug, and the admin user is
 * only created if it does not already exist. It never deletes anything.
 *
 *   npm run db:seed
 */

import "dotenv/config";
import { hash } from "@node-rs/argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { products } from "../src/content/products";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set. Copy .env.example to .env first.");
  process.exit(1);
}

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

const ARGON_OPTIONS = { memoryCost: 19456, timeCost: 2, parallelism: 1 } as const;

async function main() {
  // --- catalogue ---------------------------------------------------------
  console.log(`Seeding ${products.length} products…`);
  for (const product of products) {
    await db.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        category: product.category,
        priceCents: Math.round(product.price * 100),
        billingUnit: product.per,
        summary: product.summary,
        active: true,
      },
      create: {
        slug: product.slug,
        name: product.name,
        category: product.category,
        priceCents: Math.round(product.price * 100),
        billingUnit: product.per,
        summary: product.summary,
      },
    });
  }
  console.log("  ✓ products");

  // --- admin account -----------------------------------------------------
  const email = (process.env.SEED_ADMIN_EMAIL ?? "").trim().toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD ?? "";

  if (!email || !password) {
    console.log(
      "\nSkipping admin user — set SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD in .env to create one.",
    );
  } else if (password.length < 12) {
    console.error(
      "\nSEED_ADMIN_PASSWORD must be at least 12 characters. No admin created.",
    );
    process.exitCode = 1;
  } else {
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      console.log(`\nAdmin ${email} already exists — leaving it alone.`);
    } else {
      await db.user.create({
        data: {
          email,
          passwordHash: await hash(password, ARGON_OPTIONS),
          name: "Prevsol Administrator",
          company: "Prevsol Digital",
          clientRef: "PVS-00001",
          role: "ADMIN",
          emailVerified: new Date(),
        },
      });
      console.log(`\n  ✓ admin created: ${email}`);
    }
  }

  const counts = {
    products: await db.product.count(),
    users: await db.user.count(),
  };
  console.log(`\nDone. ${counts.products} products, ${counts.users} users.`);
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
