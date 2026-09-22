# Prevsol Digital — Website & Client Billing Platform

A complete, operational web platform: marketing site, e-commerce shop, domain
search, hosting catalogue, support centre, knowledge base, a client billing
portal and a staff admin area.

Built to the specification in `Itech_Solutions_Website_Design_Requirements.docx`
(§1–§22), using the brand, services and pricing from the company profile, DPO
flyer and pricing table PDFs in the parent directory.

**This is not a demo.** It has a real database, real password authentication,
real invoicing and a real payment gateway. See
[`docs/OPERATIONS.md`](docs/OPERATIONS.md) for the deployment runbook.

---

## Deployments

| Environment | Purpose | Guide |
|-------------|---------|-------|
| **Demo** (Vercel) | Public showcase. Payments disabled, sample data. | [docs/DEMO-DEPLOY.md](docs/DEMO-DEPLOY.md) |
| **Production** (VPS) | The live business. Real payments. | [docs/DEPLOY-QUICKSTART.md](docs/DEPLOY-QUICKSTART.md) |

Production cannot run on Vercel: **Paynow IP-whitelists merchant servers**, and
serverless platforms have no static IP. Vercel's free tier also prohibits
commercial use. That is why the two environments differ.

---

## Quick start

```bash
npm install
cp .env.example .env      # fill in DATABASE_URL and AUTH_SECRET at minimum
npm run db:migrate        # create the tables
npm run db:seed           # load the catalogue and your admin login
npm run dev               # http://localhost:3000
```

Requires **Node 20.9+** and a **PostgreSQL** database.

| Command | What it does |
|---------|--------------|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build and serve |
| `npm run typecheck` | TypeScript, no emit |
| `npm run lint` | ESLint |
| `npm run db:migrate` | Apply migrations (production) |
| `npm run db:migrate:dev` | Create and apply a migration (development) |
| `npm run db:seed` | Seed products and the admin user |
| `npm run db:studio` | Browse the database in a GUI |

---

## What runs the business

| Concern | Implementation |
|---------|----------------|
| Database | PostgreSQL via Prisma 7 (`prisma/schema.prisma`) |
| Authentication | Session cookies, Argon2id hashing (`src/lib/auth.ts`) |
| Payments | Paynow — EcoCash, OneMoney, cards (`src/lib/paynow.ts`) |
| Email | SMTP, provider-agnostic (`src/lib/email.ts`) |
| Billing logic | Integer cents throughout (`src/lib/billing.ts`) |
| Scheduled jobs | `/api/cron/billing`, run nightly from cron |
| Admin | `/admin`, guarded by role |

### Security decisions worth knowing

- **Session tokens are stored only as SHA-256 hashes.** A database leak does
  not hand an attacker working sessions.
- **Checkout re-prices every line server-side** from the product catalogue.
  The cart is client-side and carries no pricing authority, so a tampered
  cart cannot change what is charged.
- **Paynow callbacks are verified twice** — the hash is checked against our
  integration key, *and* we independently poll Paynow before marking anything
  paid. A forged callback cannot settle an invoice.
- **Every portal query is scoped to the signed-in user's id.** Requesting
  another client's invoice returns 404, not their data.
- **Sign-in and password reset never reveal whether an account exists**, and
  sign-in verifies a dummy hash on unknown emails so response timing does not
  leak it either.
- **Changing a password invalidates every other session.**

---

## Project layout

```
prisma/
  schema.prisma       Database schema — the source of truth for data
  seed.ts             Loads the catalogue and creates the admin user
src/
  content/            Copy, pricing and service data — edit these, not components
    brand.ts            Company details, vision, mission, values, clients
    services.ts         The 10 service lines, packages, FAQs
    products.ts         Shop catalogue (also seeds the Product table)
    hosting.ts          Hosting plans, email plans, domain TLD pricing
    knowledge-base.ts   20 help articles across 10 categories
    legal.ts            Privacy, cookies, terms, refunds, data protection
  lib/                auth, db, billing, email, paynow, domains
  app/
    actions/          Server actions — every mutation lives here
    api/              Paynow callback, cron endpoints
    portal/           Client billing portal
    admin/            Staff area
    …                 Marketing pages
```

**To change pricing or copy, edit `src/content/`** and re-run `npm run db:seed`
to push catalogue changes into the database.

---

## Requirements coverage

| § | Requirement | Where |
|---|---|---|
| 3 | Navigation, search, cart, login, Get a Quote | `components/site-header.tsx` |
| 4 | Homepage, hero, CTAs, service cards | `app/page.tsx` |
| 5 | Services — **each has its own page** | `app/services/[slug]/` |
| 6 | Shop, filters, sorting, cart | `app/shop/`, `app/cart/` |
| 7 | Domain search with availability | `app/domains/`, `lib/domains.ts` |
| 8 | Hosting packages and comparison | `app/hosting/` |
| 9 | Data Protection page | `app/data-protection/` |
| 10 | Login, register, forgot/reset password | `app/login/`, `app/register/` |
| 11 | Client portal | `app/portal/` |
| 12 | Support Centre | `app/support/` |
| 13 | Knowledge Base with search | `app/knowledge-base/` |
| 14 | About Us | `app/about/` |
| 15 | Contact with map and WhatsApp | `app/contact/` |
| 16 | Quote with service-dependent questions | `components/quote-form.tsx` |
| 17 | Notification centre | `app/portal/notifications/` |
| 18 | Checkout: Summary → Details → Payment → Confirmation | `app/checkout/` |
| 19 | Footer | `components/site-footer.tsx` |
| 20 | Mobile design, hamburger, WhatsApp button | throughout |

---

## Known limitations

Honest list, in the order worth addressing:

1. **`.co.zw` domains cannot be automated.** ZISPA runs the registry by email
   with no API. The site treats these as a manual queue with a 1–3 working day
   SLA, and `/admin/domains` is where staff work it. This is a registry
   constraint, not a gap in the code.
2. **Hosting provisioning is manual.** Paid orders create service records, but
   nothing creates a cPanel account automatically.
3. **Two-factor authentication is not built.** The schema has `totpSecret`
   ready for it.
4. **Invoice PDFs** are browser-printed rather than generated server-side.
5. **Client document uploads** are not implemented; that page is static.
6. **Hosting usage figures are illustrative** until cPanel reporting is wired
   in.

---

## Before going live

The full checklist is in [`docs/OPERATIONS.md`](docs/OPERATIONS.md). The items
that genuinely block launch:

- [ ] Have a legal practitioner review `src/content/legal.ts`.
- [ ] Confirm you may publish the eight client names used as social proof.
- [ ] Verify every price against your current rate card.
- [ ] Set `AUTH_SECRET` and `CRON_SECRET` to real random values.
- [ ] Configure SMTP and publish SPF, DKIM and DMARC records.
- [ ] Give Paynow your server's static IP for whitelisting — **payments will
      not work without this**, and it is why the app runs on a VPS rather than
      a serverless host.
- [ ] Test a real payment end to end, then refund it.
- [ ] Confirm backups run *and* that a restore works.
- [ ] Register as a Data Controller with POTRAZ. You sell this service; you
      must model it.

---


## Verification

| Check | Result |
|-------|--------|
| `npm run typecheck` | no errors |
| `npm run lint` | no errors or warnings |
| `npm run build` | 117 routes build cleanly |
| `npm run test:e2e` | 19/19 against a real PostgreSQL instance |
| `npm run test:security` | 4/4 regression checks |

The end-to-end suite covers registration, sign-in, sign-out, wrong-password
rejection, ordering, invoicing, contact/quote/ticket submission, the dynamic
quote questions, **cross-account data isolation**, cron authorisation and
**forged-webhook rejection**.

Both suites need the app running and write real rows, so point them at a
scratch database, not production. Update the `BASE` URL at the top of each
file if you serve on a different port.

### Security review

An independent review of the authentication, payment and data-access code
found two critical issues. Both are fixed and both now have regression tests:

1. **Invoice line items were multiplied by quantity twice**, so a quantity of
   three displayed nine times the unit price. Stored totals were always
   correct; only the rendered lines were wrong.
2. **Order references were derived from a row count**, which races. Two
   simultaneous checkouts could mint the same reference — and because a Paynow
   callback matches a payment by its reference, one payment could have settled
   a different order's invoice. References now come from Postgres sequences,
   and the gateway reference column is unique, so this is impossible at the
   database level rather than merely unlikely.

Also fixed from the same review:

- Renewal invoices now use the same pricing function as checkout. They
  previously skipped the volume discount, so a renewal could cost more than
  buying the identical item that day.
- Changing a password now signs out every other device.
- Guest checkout can no longer attach an order to an address that already has
  an account; it asks the person to sign in instead.
- The payment webhook refuses to settle anything it cannot independently
  confirm with Paynow, and rejects a confirmed amount lower than the invoice.

The review also confirmed what was already correct: authorization scoping on
every portal query, server-side re-pricing, integer-cent arithmetic, the
Paynow hash implementation, timing-equalised sign-in, and a clean
server/client boundary with no secrets reaching the browser.

Known and accepted, worth addressing as the client base grows: there is no
rate limiting on sign-in or password reset yet, and email addresses are not
verified at registration.
