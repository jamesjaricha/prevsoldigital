/**
 * Seeds the DEMONSTRATION database.
 *
 * Creates a client and a staff account with a believable spread of services,
 * invoices, domains, tickets and enquiries, so the showcase has something to
 * show rather than a set of empty tables.
 *
 *   npm run db:seed:demo
 *
 * Refuses to run unless DEMO_MODE=true, so it can never be pointed at the
 * production database by accident.
 */

import "dotenv/config";
import { hash } from "@node-rs/argon2";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

if (process.env.DEMO_MODE !== "true" && process.env.NEXT_PUBLIC_DEMO_MODE !== "true") {
  console.error(
    "Refusing to run: this script only seeds demo databases.\n" +
      "Set DEMO_MODE=true if this really is the demo environment.",
  );
  process.exit(1);
}

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
const ARGON = { memoryCost: 19456, timeCost: 2, parallelism: 1 } as const;

const DEMO_CLIENT = {
  email: "demo@prevsoldigital.com",
  password: "DemoClient2026",
};
const DEMO_STAFF = {
  email: "staff@prevsoldigital.com",
  password: "DemoStaff2026",
};

/** Dates relative to now, so the demo never looks stale. */
const day = 86_400_000;
const now = Date.now();
const inDays = (n: number) => new Date(now + n * day);
const agoDays = (n: number) => new Date(now - n * day);

async function main() {
  console.log("Seeding demonstration data…\n");

  /** Takes the next reference from the sequence, so re-seeding never collides. */
  async function newClientRef() {
    const [{ nextval }] = await db.$queryRaw<{ nextval: bigint }[]>`
      SELECT nextval('client_ref_seq') AS nextval
    `;
    return `PVS-${Number(nextval)}`;
  }

  // --- accounts ----------------------------------------------------------
  const existingClient = await db.user.findUnique({
    where: { email: DEMO_CLIENT.email },
  });

  const client = await db.user.upsert({
    where: { email: DEMO_CLIENT.email },
    update: { passwordHash: await hash(DEMO_CLIENT.password, ARGON) },
    create: {
      email: DEMO_CLIENT.email,
      passwordHash: await hash(DEMO_CLIENT.password, ARGON),
      name: "Tendai Moyo",
      company: "Silver Lining Medical Center",
      phone: "+263 77 123 4567",
      address: "12 Josiah Tongogara Avenue",
      city: "Harare",
      clientRef: existingClient?.clientRef ?? (await newClientRef()),
      role: "CLIENT",
      emailVerified: agoDays(500),
      createdAt: agoDays(500),
    },
  });
  console.log(`  ✓ client  ${DEMO_CLIENT.email}`);

  const existingStaff = await db.user.findUnique({
    where: { email: DEMO_STAFF.email },
  });

  await db.user.upsert({
    where: { email: DEMO_STAFF.email },
    update: {
      passwordHash: await hash(DEMO_STAFF.password, ARGON),
      role: "ADMIN",
    },
    create: {
      email: DEMO_STAFF.email,
      passwordHash: await hash(DEMO_STAFF.password, ARGON),
      name: "Prevalence Nyadzayo",
      company: "Prevsol Digital",
      clientRef: existingStaff?.clientRef ?? (await newClientRef()),
      role: "ADMIN",
      emailVerified: agoDays(700),
      createdAt: agoDays(700),
    },
  });
  console.log(`  ✓ staff   ${DEMO_STAFF.email}`);

  // A couple of other clients, so the admin lists are not a single row.
  // Client references come from the sequence rather than being hardcoded, so
  // re-seeding a database that already has users cannot collide.
  const others = [
    { email: "joyful@example.co.zw", name: "Chipo Dube", company: "Joyful Heart Pharmacy" },
    { email: "ktrack@example.co.zw", name: "Farai Ncube", company: "K-Track" },
  ];
  for (const o of others) {
    const existing = await db.user.findUnique({ where: { email: o.email } });
    if (existing) continue;

    const [{ nextval }] = await db.$queryRaw<{ nextval: bigint }[]>`
      SELECT nextval('client_ref_seq') AS nextval
    `;
    await db.user.create({
      data: {
        email: o.email,
        passwordHash: await hash(`NotForSignIn-${o.email}`, ARGON),
        name: o.name,
        company: o.company,
        phone: "+263 71 234 5678",
        city: "Harare",
        clientRef: `PVS-${Number(nextval)}`,
        role: "CLIENT",
        createdAt: agoDays(200),
      },
    });
  }
  console.log(`  ✓ ${others.length} additional clients`);

  // Start from a clean slate so re-running is idempotent. Demo rows use fixed
  // reference numbers, so they are cleared by reference as well as by owner —
  // otherwise a re-run collides on the unique columns.
  await db.ticketMessage.deleteMany({
    where: { ticket: { reference: { in: ["#4801", "#4802"] } } },
  });
  await db.ticket.deleteMany({ where: { reference: { in: ["#4801", "#4802"] } } });
  // Payments reference invoices, so they must go first.
  await db.payment.deleteMany({
    where: {
      OR: [
        { gatewayRef: { startsWith: "DEMO-" } },
        { invoice: { number: { startsWith: "INV-2026-0" } } },
        { userId: client.id },
      ],
    },
  });
  await db.invoiceItem.deleteMany({
    where: { invoice: { number: { startsWith: "INV-2026-0" } } },
  });
  await db.invoice.deleteMany({
    where: {
      OR: [{ number: { startsWith: "INV-2026-0" } }, { userId: client.id }],
    },
  });

  await db.notification.deleteMany({ where: { userId: client.id } });
  await db.ticketMessage.deleteMany({
    where: { ticket: { userId: client.id } },
  });
  await db.ticket.deleteMany({ where: { userId: client.id } });
  await db.service.deleteMany({ where: { userId: client.id } });
  await db.domain.deleteMany({ where: { userId: client.id } });

  // --- services ----------------------------------------------------------
  const services = [
    { name: "Business Hosting", type: "HOSTING" as const, status: "ACTIVE" as const, priceCents: 1400, cycle: "MONTHLY" as const, detail: "50 GB SSD · Unmetered bandwidth · 25 mailboxes", nextDueAt: inDays(14) },
    { name: "Interactive Website", type: "WEBSITE" as const, status: "ACTIVE" as const, priceCents: 37000, cycle: "MONTHLY" as const, detail: "10 pages · SEO · 5 forms", nextDueAt: inDays(14) },
    { name: "DPO Consultancy — Premium", type: "COMPLIANCE" as const, status: "ACTIVE" as const, priceCents: 30000, cycle: "MONTHLY" as const, detail: "POTRAZ readiness · Staff training · Compliance audits", nextDueAt: inDays(14) },
    { name: "Email Hosting — .co.zw", type: "EMAIL" as const, status: "ACTIVE" as const, priceCents: 1500, cycle: "ANNUALLY" as const, detail: "20 mailboxes · 800 GB storage", nextDueAt: inDays(210) },
    { name: "Digital Marketing — Standard", type: "MARKETING" as const, status: "PENDING" as const, priceCents: 10000, cycle: "MONTHLY" as const, detail: "Awaiting social account access", nextDueAt: inDays(30) },
  ];

  for (const s of services) {
    await db.service.create({
      data: { ...s, userId: client.id, registeredAt: agoDays(400) },
    });
  }
  console.log(`  ✓ ${services.length} services`);

  // --- domains -----------------------------------------------------------
  await db.domain.create({
    data: {
      userId: client.id,
      fqdn: "silverliningmedical.co.zw",
      status: "EXPIRING_SOON",
      autoRenew: false,
      registeredAt: agoDays(360),
      expiresAt: inDays(11),
    },
  });
  await db.domain.create({
    data: {
      userId: client.id,
      fqdn: "silverlining.africa",
      status: "ACTIVE",
      registeredAt: agoDays(120),
      expiresAt: inDays(245),
    },
  });

  // One pending domain on another client, so the admin queue is not empty.
  const joyful = await db.user.findUnique({
    where: { email: "joyful@example.co.zw" },
  });
  if (joyful) {
    await db.domain.deleteMany({ where: { userId: joyful.id } });
    await db.domain.create({
      data: {
        userId: joyful.id,
        fqdn: "joyfulheartpharmacy.co.zw",
        status: "PENDING",
        registeredAt: agoDays(1),
        expiresAt: inDays(364),
      },
    });
  }
  console.log("  ✓ 3 domains (one pending, for the .co.zw queue)");

  // --- invoices ----------------------------------------------------------
  await db.invoice.deleteMany({ where: { userId: client.id } });

  const invoices = [
    { number: "INV-2026-0841", status: "OVERDUE" as const, issued: agoDays(22), due: agoDays(8), subtotal: 68400, items: [["Business Hosting — monthly", 1400], ["Interactive Website — monthly", 37000], ["DPO Consultancy Premium — monthly", 30000]] },
    { number: "INV-2026-0902", status: "UNPAID" as const, issued: agoDays(2), due: inDays(12), subtotal: 11500, items: [["Digital Marketing Standard — monthly", 10000], ["silverliningmedical.co.zw renewal", 1500]] },
    { number: "INV-2026-0763", status: "PAID" as const, issued: agoDays(52), due: agoDays(38), paid: agoDays(44), subtotal: 68400, items: [["Business Hosting — monthly", 1400], ["Interactive Website — monthly", 37000], ["DPO Consultancy Premium — monthly", 30000]] },
    { number: "INV-2026-0688", status: "PAID" as const, issued: agoDays(82), due: agoDays(68), paid: agoDays(79), subtotal: 68400, items: [["Business Hosting — monthly", 1400], ["Interactive Website — monthly", 37000], ["DPO Consultancy Premium — monthly", 30000]] },
  ];

  for (const inv of invoices) {
    const tax = Math.round(inv.subtotal * 0.15);
    const created = await db.invoice.create({
      data: {
        number: inv.number,
        userId: client.id,
        status: inv.status,
        issuedAt: inv.issued,
        dueAt: inv.due,
        paidAt: inv.paid ?? null,
        subtotalCents: inv.subtotal,
        taxCents: tax,
        totalCents: inv.subtotal + tax,
        items: {
          create: inv.items.map(([description, amount]) => ({
            description: String(description),
            amountCents: Number(amount),
          })),
        },
      },
    });

    if (inv.status === "PAID") {
      await db.payment.create({
        data: {
          invoiceId: created.id,
          userId: client.id,
          method: "PAYNOW_ECOCASH",
          status: "PAID",
          amountCents: inv.subtotal + tax,
          paidAt: inv.paid!,
          gatewayRef: `DEMO-${inv.number}`,
        },
      });
    }
  }
  console.log(`  ✓ ${invoices.length} invoices, 2 with payments`);

  // --- tickets -----------------------------------------------------------
  const ticket = await db.ticket.create({
    data: {
      reference: "#4801",
      userId: client.id,
      name: "Tendai Moyo",
      email: DEMO_CLIENT.email,
      department: "TECHNICAL",
      priority: "HIGH",
      status: "IN_PROGRESS",
      subject: "SSL certificate warning on staging subdomain",
      relatedService: "Business Hosting",
      createdAt: agoDays(3),
      updatedAt: agoDays(2),
      messages: {
        create: [
          { fromStaff: false, author: "Tendai Moyo", body: "Our staging subdomain is showing a certificate warning in Chrome. The main site is fine. Can you take a look?", createdAt: agoDays(3) },
          { fromStaff: true, author: "Prevsol Support", body: "Thanks Tendai. The wildcard certificate did not extend to the staging subdomain when it was created. We are reissuing it now and will confirm once propagation completes.", createdAt: agoDays(3) },
          { fromStaff: true, author: "Prevsol Support", body: "The certificate has been reissued and installed. Please clear your cache and confirm the warning has cleared on your side.", createdAt: agoDays(2) },
        ],
      },
    },
  });

  await db.ticket.create({
    data: {
      reference: "#4802",
      userId: client.id,
      name: "Tendai Moyo",
      email: DEMO_CLIENT.email,
      department: "BILLING",
      priority: "MEDIUM",
      status: "RESOLVED",
      subject: "Invoice INV-2026-0763 payment confirmation",
      createdAt: agoDays(44),
      updatedAt: agoDays(44),
      messages: {
        create: [
          { fromStaff: false, author: "Tendai Moyo", body: "I have paid INV-2026-0763 via EcoCash but the portal still shows it as unpaid.", createdAt: agoDays(44) },
          { fromStaff: true, author: "Prevsol Billing", body: "Payment received and applied — the invoice is now marked as paid. Mobile money confirmations can take up to an hour to reconcile. Apologies for the delay.", createdAt: agoDays(44) },
        ],
      },
    },
  });
  console.log("  ✓ 2 tickets");

  // --- notifications -----------------------------------------------------
  const notifications = [
    { type: "DUE" as const, title: "Invoice INV-2026-0841 is overdue", body: "$786.60 was due 8 days ago.", href: "/portal/invoices", readAt: null },
    { type: "DOMAIN" as const, title: "silverliningmedical.co.zw expires in 11 days", body: "Auto-renew is off. Renew to avoid losing the domain.", href: "/portal/domains", readAt: null },
    { type: "TICKET" as const, title: "Support replied to your SSL ticket", body: "The certificate has been reissued and installed.", href: `/portal/tickets/${ticket.id}`, readAt: null },
    { type: "INVOICE" as const, title: "New invoice INV-2026-0902", body: "$132.25 due in 12 days.", href: "/portal/invoices", readAt: agoDays(1) },
    { type: "PAYMENT" as const, title: "Payment received", body: "$786.60 for INV-2026-0763 via EcoCash.", href: "/portal/invoices", readAt: agoDays(40) },
  ];

  for (const n of notifications) {
    await db.notification.create({
      data: { ...n, userId: client.id, createdAt: agoDays(1) },
    });
  }
  console.log(`  ✓ ${notifications.length} notifications`);

  // --- enquiries, so the admin inbox has something in it -----------------
  await db.enquiry.deleteMany({ where: { email: { contains: "@example.co.zw" } } });
  await db.enquiry.createMany({
    data: [
      { kind: "CONTACT", name: "Rutendo Chikafu", email: "rutendo@example.co.zw", phone: "+263 71 234 5678", company: "Golden Knot Microinsurance", service: "Website Design & Development", subject: "New company website", message: "We need a new website with online payments and a client login area. Roughly ten pages. What would that cost and how long would it take?", createdAt: agoDays(1) },
      { kind: "QUOTE", name: "Blessing Sibanda", email: "blessing@example.co.zw", phone: "+263 77 987 6543", company: "Redeemed Group of Schools", service: "Data Protection Consultancy", budget: "$1,500 – $5,000", timeline: "Within a month", message: "We have around 400 staff and student records and no DPO. We want to be ready before the September inspections.", answers: { "Do you hold a Data Controller Licence?": "No", "Have you appointed a Data Protection Officer?": "No", "What do you need help with?": ["POTRAZ inspection readiness", "Data Controller licensing", "Outsourced DPO services", "Staff training"], "How many staff does your organisation have?": "201–500", "Do you process sensitive personal data?": "Yes — children's data" }, createdAt: agoDays(2) },
      { kind: "QUOTE", name: "Tapiwa Mutasa", email: "tapiwa@example.co.zw", phone: "+263 78 555 1212", company: "Feltach Contracting", service: "Software Development", budget: "$5,000 – $15,000", timeline: "Within three months", message: "We track jobs and materials on paper and spreadsheets. We want one system our site supervisors can use on a phone.", answers: { "What type of system?": "Business management system", "How many people will use it?": "11–50", "Systems it must integrate with": "Sage accounting" }, createdAt: agoDays(4) },
    ],
  });
  console.log("  ✓ 3 enquiries");

  console.log("\nDemonstration data ready.");
  console.log(`  Client: ${DEMO_CLIENT.email} / ${DEMO_CLIENT.password}`);
  console.log(`  Staff:  ${DEMO_STAFF.email} / ${DEMO_STAFF.password}`);
}

main()
  .catch((error) => {
    console.error("Demo seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
