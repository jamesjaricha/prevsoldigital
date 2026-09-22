import { chromium } from "playwright";
const BASE="http://localhost:3210";
const results=[];
const check=(n,p,d="")=>{results.push({n,p,d});console.log(`${p?"PASS":"FAIL"}  ${n}${d?"  — "+d:""}`);};
const b=await chromium.launch();

// Client demo login
const c1=await b.newContext();const p1=await c1.newPage();
await p1.goto(`${BASE}/login`,{waitUntil:"networkidle"});
await p1.fill("#login-email","demo@prevsoldigital.com");
await p1.fill("#login-password","DemoClient2026");
await Promise.all([p1.waitForURL("**/portal**",{timeout:20000}).catch(()=>{}),p1.getByRole("button",{name:/^Sign In$/}).click()]);
await p1.waitForTimeout(1500);
check("Client demo login works", p1.url().includes("/portal"), p1.url().replace(BASE,""));

const dash=await p1.locator("body").innerText();
check("Portal shows seeded services", /Business Hosting|Interactive Website/.test(dash));
check("Portal shows an overdue invoice", /overdue/i.test(dash));
check("Portal shows the expiring domain", /silverliningmedical/.test(dash));

// Client must NOT reach admin
await p1.goto(`${BASE}/admin`,{waitUntil:"networkidle"});
await p1.waitForTimeout(1200);
check("Demo client cannot reach admin", !p1.url().includes("/admin"), p1.url().replace(BASE,""));
await c1.close();

// Staff demo login
const c2=await b.newContext();const p2=await c2.newPage();
await p2.goto(`${BASE}/login`,{waitUntil:"networkidle"});
await p2.fill("#login-email","staff@prevsoldigital.com");
await p2.fill("#login-password","DemoStaff2026");
await Promise.all([p2.waitForURL("**/portal**",{timeout:20000}).catch(()=>{}),p2.getByRole("button",{name:/^Sign In$/}).click()]);
await p2.waitForTimeout(1200);
const r=await p2.goto(`${BASE}/admin`,{waitUntil:"networkidle"});
check("Staff demo login reaches admin", r?.status()===200 && p2.url().includes("/admin"));
const adm=await p2.locator("body").innerText();
check("Admin shows seeded enquiries", /Rutendo|Blessing|Tapiwa/.test(adm));
await p2.goto(`${BASE}/admin/domains`,{waitUntil:"networkidle"});
check("Admin shows the pending .co.zw queue", /joyfulheartpharmacy/.test(await p2.locator("body").innerText()));
await c2.close();

// Demo mode must not attempt a payment
const c3=await b.newContext();const p3=await c3.newPage();
await p3.goto(`${BASE}/shop`,{waitUntil:"networkidle"});
await p3.getByRole("button",{name:/Add .* to cart/i}).first().click();
await p3.waitForTimeout(500);
await p3.goto(`${BASE}/checkout`,{waitUntil:"networkidle"});
await p3.getByRole("button",{name:/Continue to Customer Details/i}).click();
await p3.waitForTimeout(300);
await p3.fill("#co-name","Demo Visitor");
await p3.fill("#co-email",`visitor${Date.now()}@example.co.zw`);
await p3.fill("#co-phone","+263771234567");
await p3.getByRole("button",{name:/Continue to Payment/i}).click();
await p3.waitForTimeout(300);
// Choose EcoCash — in demo mode it must NOT contact Paynow.
await p3.getByText("EcoCash",{exact:true}).click();
await p3.waitForTimeout(200);
await p3.fill("#co-payphone","0771234567");
await p3.getByRole("button",{name:/Place Order/i}).click();
await p3.waitForTimeout(3500);
const co=await p3.locator("main").innerText();
// The real assertions: the order completed, the page says no payment was
// taken, and the browser was never redirected to the gateway.
check("Demo checkout completes", /Order Received/i.test(co));
check("Demo checkout states no payment was taken", /no payment was taken/i.test(co));
check("Demo checkout never reaches Paynow", !p3.url().includes("paynow.co.zw"), p3.url().replace(BASE,""));
await c3.close();

await b.close();
const f=results.filter(r=>!r.p);
console.log(`\n${results.length-f.length}/${results.length} checks passed`);
if(f.length) process.exit(1);
