/**
 * Hosting, domain and email packages — requirements doc §7 and §8.
 * Email hosting prices are taken verbatim from the pricing table PDF.
 */

export type HostingPlan = {
  slug: string;
  name: string;
  tagline: string;
  monthly: number;
  annual: number;
  featured?: boolean;
  storage: string;
  bandwidth: string;
  emailAccounts: string;
  databases: string;
  ssl: string;
  backups: string;
  support: string;
  extras: string[];
};

export const hostingPlans: HostingPlan[] = [
  {
    slug: "starter",
    name: "Starter",
    tagline: "For brochure sites, portfolios and first business websites.",
    monthly: 6,
    annual: 60,
    storage: "10 GB SSD",
    bandwidth: "100 GB / month",
    emailAccounts: "5 accounts",
    databases: "2 databases",
    ssl: "Free SSL certificate",
    backups: "Daily backups, 7-day retention",
    support: "Email and ticket support",
    extras: ["1 website", "cPanel access", "99.9% uptime target"],
  },
  {
    slug: "business",
    name: "Business",
    tagline: "For growing companies running a live, trafficked website.",
    monthly: 14,
    annual: 140,
    featured: true,
    storage: "50 GB SSD",
    bandwidth: "Unmetered",
    emailAccounts: "25 accounts",
    databases: "10 databases",
    ssl: "Free SSL certificate",
    backups: "Daily backups, 30-day retention",
    support: "Priority ticket, phone and WhatsApp support",
    extras: [
      "5 websites",
      "Free domain for the first year",
      "Free migration",
      "Staging environment",
      "99.9% uptime target",
    ],
  },
  {
    slug: "professional",
    name: "Professional",
    tagline: "For e-commerce, portals and business-critical applications.",
    monthly: 32,
    annual: 320,
    storage: "150 GB NVMe",
    bandwidth: "Unmetered",
    emailAccounts: "Unlimited accounts",
    databases: "Unlimited databases",
    ssl: "Free wildcard SSL certificate",
    backups: "Daily backups, 60-day retention",
    support: "Dedicated account manager, 24/7 escalation",
    extras: [
      "Unlimited websites",
      "Free domain for the first year",
      "Free migration",
      "Staging environment",
      "Dedicated resources",
      "Advanced monitoring",
    ],
  },
];

export type EmailPlan = {
  slug: string;
  name: string;
  price: number;
  per: "yr";
  accounts: string;
  storage: string;
  includes: string[];
  featured?: boolean;
};

/** Pricing table PDF, "Email Hosting" page — reproduced exactly. */
export const emailPlans: EmailPlan[] = [
  {
    slug: "email-international",
    name: ".com / .tech / .africa",
    price: 25,
    per: "yr",
    accounts: "3 email accounts",
    storage: "500 MB storage",
    includes: ["Free domain hosting (first year)", "Webmail access", "Spam filtering"],
  },
  {
    slug: "email-cozw",
    name: ".co.zw",
    price: 15,
    per: "yr",
    featured: true,
    accounts: "20 email accounts",
    storage: "800 GB storage",
    includes: ["Free domain hosting (first year)", "Webmail access", "Spam filtering"],
  },
];

export type Tld = {
  ext: string;
  register: number;
  renew: number;
  popular?: boolean;
  note?: string;
};

/** Domain extensions we quote on, with registration and renewal pricing. */
export const tlds: Tld[] = [
  { ext: ".co.zw", register: 15, renew: 15, popular: true, note: "Zimbabwe" },
  { ext: ".com", register: 18, renew: 20, popular: true },
  { ext: ".africa", register: 25, renew: 28, popular: true },
  { ext: ".tech", register: 32, renew: 45 },
  { ext: ".org", register: 20, renew: 22 },
  { ext: ".net", register: 21, renew: 23 },
  { ext: ".io", register: 48, renew: 52 },
  { ext: ".biz", register: 19, renew: 21 },
  { ext: ".shop", register: 26, renew: 34 },
  { ext: ".online", register: 24, renew: 38 },
];

/** Comparison rows for the "Compare Hosting Plans" table, §8. */
export const hostingComparisonRows: {
  label: string;
  key: keyof HostingPlan;
}[] = [
  { label: "Storage", key: "storage" },
  { label: "Bandwidth", key: "bandwidth" },
  { label: "Email accounts", key: "emailAccounts" },
  { label: "Databases", key: "databases" },
  { label: "SSL", key: "ssl" },
  { label: "Backups", key: "backups" },
  { label: "Support", key: "support" },
];
