import { chromium } from "playwright";

const BASE = "http://localhost:3160";
const results = [];
const errors = [];
const check = (n, p, d = "") => {
  results.push({ n, p, d });
  console.log(`${p ? "PASS" : "FAIL"}  ${n}${d ? "  — " + d : ""}`);
};

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();
page.on("pageerror", (e) => errors.push("PAGEERROR: " + e.message));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});

const stamp = process.env.STAMP || "1";
const email = `tendai${stamp}@example.co.zw`;

// 1. Register a real account
await page.goto(`${BASE}/register`, { waitUntil: "networkidle" });
await page.fill("#reg-name", "Tendai Moyo");
await page.fill("#reg-email", email);
await page.fill("#reg-phone", "+263771234567");
await page.fill("#reg-company", "Silver Lining Medical");
await page.fill("#reg-password", "StrongPass123!");
await page.fill("#reg-confirm", "StrongPass123!");
await page.check('input[type="checkbox"]');
await Promise.all([
  page.waitForURL("**/portal**", { timeout: 20000 }).catch(() => {}),
  page.getByRole("button", { name: /Create Account/i }).click(),
]);
await page.waitForTimeout(1500);
check(
  "Registration creates an account and signs in",
  page.url().includes("/portal"),
  page.url().replace(BASE, ""),
);

// 2. Portal loads real (empty) state
const emptyState = await page
  .getByText(/No services yet|Active Services/i)
  .count();
check("Portal dashboard renders for a new account", emptyState > 0);

// 3. Sign out, sign back in
await page.goto(`${BASE}/portal/services`, { waitUntil: "networkidle" });
await Promise.all([
  page.waitForURL((url) => !url.pathname.startsWith("/portal"), {
    timeout: 20000,
  }),
  page.getByRole("button", { name: /Logout/i }).first().click(),
]);
check(
  "Sign out returns to the public site",
  !page.url().includes("/portal"),
  page.url().replace(BASE, ""),
);

const cookiesAfterSignOut = await page.context().cookies();
check(
  "Sign out clears the session cookie",
  !cookiesAfterSignOut.some((c) => c.name === "prevsol_session"),
);

await page.goto(`${BASE}/portal`, { waitUntil: "networkidle" });
await page.waitForURL("**/login**", { timeout: 20000 }).catch(() => {});
check("Portal blocks signed-out access", page.url().includes("/login"));

await page.fill("#login-email", email);
await page.fill("#login-password", "StrongPass123!");
await Promise.all([
  page.waitForURL("**/portal**", { timeout: 20000 }).catch(() => {}),
  page.getByRole("button", { name: /^Sign In$/ }).click(),
]);
await page.waitForTimeout(1200);
check("Sign in with the new account works", page.url().includes("/portal"));

// 4. Wrong password is rejected
const ctx2 = await browser.newContext();
const p2 = await ctx2.newPage();
await p2.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await p2.fill("#login-email", email);
await p2.fill("#login-password", "WrongPassword999");
await p2.getByRole("button", { name: /^Sign In$/ }).click();
await p2.waitForTimeout(1500);
check(
  "Wrong password is rejected",
  !p2.url().includes("/portal"),
  p2.url().replace(BASE, ""),
);
await ctx2.close();

// 5. Place a real order
await page.goto(`${BASE}/shop`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: /Add .* to cart/i }).first().click();
await page.waitForTimeout(600);
await page.goto(`${BASE}/checkout`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: /Continue to Customer Details/i }).click();
await page.waitForTimeout(300);
await page.fill("#co-phone", "+263771234567");
await page.getByRole("button", { name: /Continue to Payment/i }).click();
await page.waitForTimeout(300);
// Offline method: no Paynow credentials in this environment.
await page.getByText("Bank transfer", { exact: true }).click();
await page.waitForTimeout(200);
await page.getByRole("button", { name: /Place Order/i }).click();
await page.waitForTimeout(3000);
check(
  "Checkout creates a real order",
  (await page.getByText("Order Received").count()) > 0,
);

// 6. Invoice exists in the portal
await page.goto(`${BASE}/portal/invoices`, { waitUntil: "networkidle" });
const invRows = await page.locator("a[href^='/portal/invoices/']").count();
check("Order generated an invoice in the portal", invRows > 0, `${invRows} links`);

// 7. Contact form persists
await page.goto(`${BASE}/contact`, { waitUntil: "networkidle" });
await page.fill("#c-name", "Rutendo Chikafu");
await page.fill("#c-email", "rutendo@example.co.zw");
await page.fill("#c-phone", "+263712345678");
await page.fill("#c-subject", "Website enquiry");
await page.fill("#c-message", "We need a new company website with online payments.");
await page.getByRole("button", { name: /Send Message/i }).click();
await page.waitForTimeout(2500);
check("Contact form submits", (await page.getByText("Message sent").count()) > 0);

// 8. Support ticket persists
await page.goto(`${BASE}/support/new`, { waitUntil: "networkidle" });
await page.fill("#t-name", "Tendai Moyo");
await page.fill("#t-email", email);
await page.fill("#t-subject", "SSL certificate warning");
await page.fill("#t-message", "Our staging subdomain shows a certificate warning.");
await page.getByRole("button", { name: /Submit Ticket/i }).click();
await page.waitForTimeout(2500);
check(
  "Ticket submits and gets a reference",
  (await page.getByText("Ticket Submitted").count()) > 0,
);

await page.goto(`${BASE}/portal/tickets`, { waitUntil: "networkidle" });
const tRows = await page.locator("a[href^='/portal/tickets/']").count();
check("Ticket appears in the portal", tRows > 0, `${tRows} links`);

// 9. Quote form with dynamic questions
await page.goto(`${BASE}/quote`, { waitUntil: "networkidle" });
await page.getByText("Data Protection Consultancy", { exact: true }).click();
await page.waitForTimeout(400);
check(
  "Quote shows service-specific questions",
  (await page.getByText("Do you hold a Data Controller Licence?").count()) > 0,
);
await page.fill("#q-name", "Farai Ncube");
await page.fill("#q-email", "farai@example.co.zw");
await page.fill("#q-phone", "+263773334444");
await page.getByRole("button", { name: /Request Quote/i }).click();
await page.waitForTimeout(2500);
check(
  "Quote submits",
  (await page.getByText("Quote Request Received").count()) > 0,
);

// 10. Cross-account isolation — the critical security check
const ctx3 = await browser.newContext();
const p3 = await ctx3.newPage();
await p3.goto(`${BASE}/register`, { waitUntil: "networkidle" });
await p3.fill("#reg-name", "Other Person");
await p3.fill("#reg-email", `other${stamp}@example.co.zw`);
await p3.fill("#reg-phone", "+263779998888");
await p3.fill("#reg-password", "OtherPass123!");
await p3.fill("#reg-confirm", "OtherPass123!");
await p3.check('input[type="checkbox"]');
await Promise.all([
  p3.waitForURL("**/portal**", { timeout: 20000 }).catch(() => {}),
  p3.getByRole("button", { name: /Create Account/i }).click(),
]);
await p3.waitForTimeout(1200);

// Grab the first account's invoice URL, then try to open it as the second.
await page.goto(`${BASE}/portal/invoices`, { waitUntil: "networkidle" });
const victimHref = await page
  .locator("a[href^='/portal/invoices/']")
  .first()
  .getAttribute("href");

if (victimHref) {
  const res = await p3.goto(`${BASE}${victimHref}`, { waitUntil: "networkidle" });
  const status = res?.status();
  const leaked = await p3.getByText(/INV-/).count();
  check(
    "One account cannot open another account invoice",
    status === 404 || leaked === 0,
    `status=${status} leaked=${leaked}`,
  );
} else {
  check("One account cannot open another account invoice", false, "no invoice to test");
}
await ctx3.close();

// 11. Cron endpoint authorisation
const unauth = await page.request.get(`${BASE}/api/cron/billing`);
check(
  "Cron endpoint rejects unauthorised calls",
  unauth.status() === 401,
  `status=${unauth.status()}`,
);

const authed = await page.request.get(`${BASE}/api/cron/billing`, {
  headers: {
    Authorization: "Bearer dev-only-cron-9a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d",
  },
});
check(
  "Cron endpoint runs with the correct secret",
  authed.status() === 200,
  `status=${authed.status()}`,
);

// 12. A forged Paynow callback must not settle an invoice.
//     The endpoint always answers 200 (Paynow retries anything else), so the
//     real assertion is that the invoice is still unpaid afterwards.
const beforeForge = await page.request.get(`${BASE}/portal/invoices`);
await page.request.post(`${BASE}/api/paynow/callback`, {
  form: { reference: "PVS-41001", status: "Paid", hash: "DEADBEEF" },
});
await page.goto(`${BASE}/portal/invoices`, { waitUntil: "networkidle" });
const paidAfterForge = await page.getByText("Paid", { exact: true }).count();
check(
  "Forged Paynow callback does not mark an invoice paid",
  beforeForge.ok() && paidAfterForge === 0,
  `invoices showing Paid: ${paidAfterForge}`,
);

check(
  "No page errors during the run",
  errors.length === 0,
  errors.slice(0, 2).join(" | "),
);

await browser.close();
const failed = results.filter((r) => !r.p);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) {
  console.log("\nFAILURES:");
  for (const f of failed) console.log(`  - ${f.n}: ${f.d}`);
  process.exit(1);
}
