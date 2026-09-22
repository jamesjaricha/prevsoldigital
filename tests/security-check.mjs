/**
 * Targeted regression tests for the two critical findings from the security
 * review. Both concern money, so both are worth proving rather than assuming.
 */

import { chromium } from "playwright";

const BASE = "http://localhost:3160";
const results = [];
const check = (n, p, d = "") => {
  results.push({ n, p, d });
  console.log(`${p ? "PASS" : "FAIL"}  ${n}${d ? "  — " + d : ""}`);
};

const browser = await chromium.launch();
const stamp = Date.now();

// --- 1. Invoice line totals must equal the invoice total -------------------
// Previously the line item stored price×quantity and the page multiplied by
// quantity again, so a quantity of 3 displayed 9× the unit price.
const ctx = await browser.newContext();
const page = await ctx.newPage();

await page.goto(`${BASE}/register`, { waitUntil: "networkidle" });
await page.fill("#reg-name", "Quantity Test");
await page.fill("#reg-email", `qty${stamp}@example.co.zw`);
await page.fill("#reg-phone", "+263771234567");
await page.fill("#reg-password", "StrongPass123!");
await page.fill("#reg-confirm", "StrongPass123!");
await page.check('input[type="checkbox"]');
await Promise.all([
  page.waitForURL("**/portal**", { timeout: 20000 }).catch(() => {}),
  page.getByRole("button", { name: /Create Account/i }).click(),
]);

// Buy the same item three times, so a double-multiply would be obvious.
await page.goto(`${BASE}/shop`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: /Add .* to cart/i }).first().click();
await page.waitForTimeout(400);
await page.goto(`${BASE}/cart`, { waitUntil: "networkidle" });
const qty = page.locator('input[type="number"]').first();
await qty.fill("3");
await qty.blur();
await page.waitForTimeout(600);

await page.goto(`${BASE}/checkout`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: /Continue to Customer Details/i }).click();
await page.waitForTimeout(300);
await page.fill("#co-phone", "+263771234567");
await page.getByRole("button", { name: /Continue to Payment/i }).click();
await page.waitForTimeout(300);
await page.getByText("Bank transfer", { exact: true }).click();
await page.getByRole("button", { name: /Place Order/i }).click();
await page.waitForTimeout(3000);

await page.goto(`${BASE}/portal/invoices`, { waitUntil: "networkidle" });
const invoiceHref = await page
  .locator("a[href^='/portal/invoices/']")
  .first()
  .getAttribute("href");

if (invoiceHref) {
  await page.goto(`${BASE}${invoiceHref}`, { waitUntil: "networkidle" });
  const text = await page.locator("table").first().innerText();
  const amounts = [...text.matchAll(/\$([\d,]+(?:\.\d{2})?)/g)].map((m) =>
    Number(m[1].replace(/,/g, "")),
  );
  // Layout: line item(s), then subtotal, VAT, total.
  const total = amounts.at(-1);
  const vat = amounts.at(-2);
  const subtotal = amounts.at(-3);
  const lineSum = amounts.slice(0, -3).reduce((a, b) => a + b, 0);

  check(
    "Invoice line totals sum to the subtotal",
    Math.abs(lineSum - subtotal) < 0.02,
    `lines=${lineSum} subtotal=${subtotal}`,
  );
  check(
    "Invoice total equals subtotal plus VAT",
    Math.abs(subtotal + vat - total) < 0.02,
    `${subtotal} + ${vat} = ${total}`,
  );
} else {
  check("Invoice line totals sum to the subtotal", false, "no invoice created");
}

// --- 2. Concurrent checkouts must not share an order reference -------------
// Previously references came from COUNT(*), so simultaneous orders collided
// and one payment could settle another order's invoice.
const refs = await Promise.all(
  Array.from({ length: 4 }, async (_, i) => {
    const c = await browser.newContext();
    const p = await c.newPage();
    await p.goto(`${BASE}/register`, { waitUntil: "networkidle" });
    await p.fill("#reg-name", `Race ${i}`);
    await p.fill("#reg-email", `race${stamp}x${i}@example.co.zw`);
    await p.fill("#reg-phone", "+263771234567");
    await p.fill("#reg-password", "StrongPass123!");
    await p.fill("#reg-confirm", "StrongPass123!");
    await p.check('input[type="checkbox"]');
    await Promise.all([
      p.waitForURL("**/portal**", { timeout: 20000 }).catch(() => {}),
      p.getByRole("button", { name: /Create Account/i }).click(),
    ]);

    await p.goto(`${BASE}/shop`, { waitUntil: "networkidle" });
    await p.getByRole("button", { name: /Add .* to cart/i }).first().click();
    await p.waitForTimeout(300);
    await p.goto(`${BASE}/checkout`, { waitUntil: "networkidle" });
    await p.getByRole("button", { name: /Continue to Customer Details/i }).click();
    await p.waitForTimeout(200);
    await p.fill("#co-phone", "+263771234567");
    await p.getByRole("button", { name: /Continue to Payment/i }).click();
    await p.waitForTimeout(200);
    await p.getByText("Bank transfer", { exact: true }).click();
    await p.getByRole("button", { name: /Place Order/i }).click();
    await p.waitForTimeout(3500);

    const body = await p.locator("body").innerText();
    const match = body.match(/PVS-\d+/);
    await c.close();
    return match ? match[0] : null;
  }),
);

const gotRefs = refs.filter(Boolean);
const unique = new Set(gotRefs);
check(
  "Concurrent orders get unique references",
  gotRefs.length > 1 && unique.size === gotRefs.length,
  `${gotRefs.length} orders, ${unique.size} unique: ${[...unique].join(", ")}`,
);

// --- 3. Guest checkout must not hijack a registered address ---------------
const ctxGuest = await browser.newContext();
const guest = await ctxGuest.newPage();
await guest.goto(`${BASE}/shop`, { waitUntil: "networkidle" });
await guest.getByRole("button", { name: /Add .* to cart/i }).first().click();
await guest.waitForTimeout(400);
await guest.goto(`${BASE}/checkout`, { waitUntil: "networkidle" });
await guest.getByRole("button", { name: /Continue to Customer Details/i }).click();
await guest.waitForTimeout(300);
await guest.fill("#co-name", "Impersonator");
await guest.fill("#co-email", `qty${stamp}@example.co.zw`); // the account from test 1
await guest.fill("#co-phone", "+263779999999");
await guest.getByRole("button", { name: /Continue to Payment/i }).click();
await guest.waitForTimeout(300);
await guest.getByText("Bank transfer", { exact: true }).click();
await guest.getByRole("button", { name: /Place Order/i }).click();
await guest.waitForTimeout(3000);

const guestBody = await guest.locator("body").innerText();
check(
  "Guest checkout cannot attach an order to a registered account",
  /already exists/i.test(guestBody) && !/Order Received/i.test(guestBody),
  guestBody.match(/already exists[^.]*\./i)?.[0] ?? "no guard message",
);
await ctxGuest.close();

await browser.close();

const failed = results.filter((r) => !r.p);
console.log(`\n${results.length - failed.length}/${results.length} checks passed`);
if (failed.length) process.exit(1);
