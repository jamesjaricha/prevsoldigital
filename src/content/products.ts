/**
 * Shop catalogue — requirements doc §6.
 * Prices are drawn from the iTech Solutions Pricing Table PDF wherever the
 * PDF quotes a figure; the rest are consistent with those rates.
 */

export type ProductCategory =
  | "websites"
  | "hosting"
  | "marketing"
  | "media"
  | "compliance"
  | "software"
  | "branding";

export type Product = {
  slug: string;
  name: string;
  category: ProductCategory;
  price: number;
  /** Billing unit: "mo", "yr", "hr", or null for a one-off purchase. */
  per: string | null;
  /** Struck-through comparison price, when the item is discounted. */
  compareAt?: number;
  summary: string;
  description: string;
  includes: string[];
  /** Links back to the service page this product belongs to. */
  service?: string;
  badge?: "Popular" | "Best value" | "New";
  rating: number;
  reviews: number;
};

export const categories: { slug: ProductCategory; name: string; blurb: string }[] =
  [
    {
      slug: "websites",
      name: "Websites",
      blurb: "Design and development packages, from brochure sites to full stores.",
    },
    {
      slug: "hosting",
      name: "Hosting & Domains",
      blurb: "Hosting plans, domain registration, SSL and business email.",
    },
    {
      slug: "marketing",
      name: "Digital Marketing",
      blurb: "Managed social, SEO, advertising and campaign retainers.",
    },
    {
      slug: "media",
      name: "Photo & Video",
      blurb: "Reels, corporate shoots, event coverage and live streaming.",
    },
    {
      slug: "compliance",
      name: "Data Protection",
      blurb: "DPO retainers, readiness reviews and POTRAZ compliance.",
    },
    {
      slug: "software",
      name: "Software",
      blurb: "Custom systems, ERPs and business applications.",
    },
    {
      slug: "branding",
      name: "Branding",
      blurb: "Logos, company profiles and marketing collateral.",
    },
  ];

export const products: Product[] = [
  // ---------- Websites ----------
  {
    slug: "website-standard",
    name: "Standard Website",
    category: "websites",
    price: 250,
    per: "mo",
    summary: "Five-page business website with free domain and hosting for a year.",
    description:
      "A clean, responsive five-page website for businesses that need a professional presence online quickly. Includes SEO setup, a contact form and a WhatsApp button, with domain registration and hosting free for the first year.",
    includes: [
      "5 pages maximum",
      "Free domain and web hosting for a year",
      "SEO",
      "Contact form",
      "WhatsApp button",
    ],
    service: "website-design-development",
    rating: 4.8,
    reviews: 34,
  },
  {
    slug: "website-interactive",
    name: "Interactive Website",
    category: "websites",
    price: 370,
    per: "mo",
    badge: "Popular",
    summary: "Ten pages, interactive components and social media setup.",
    description:
      "For organisations that need more than a brochure. Up to ten pages with interactive elements, five forms, SEO and social media page creation, plus free annual domain and hosting.",
    includes: [
      "Maximum 10 pages",
      "Free annual domain and hosting",
      "SEO",
      "Interactive site",
      "Maximum 5 forms",
      "Social media pages creation",
    ],
    service: "website-design-development",
    rating: 4.9,
    reviews: 21,
  },
  {
    slug: "website-ecommerce",
    name: "E-Commerce Website",
    category: "websites",
    price: 590,
    per: "mo",
    badge: "Best value",
    summary: "Full online store with payment gateway and 20 pages.",
    description:
      "A complete e-commerce build with payment gateway configuration, online store, unlimited forms and social media page creation. Includes a full year of free digital marketing consultation alongside free domain and hosting.",
    includes: [
      "E-commerce site",
      "Payment gateway configuration",
      "Online store",
      "Up to 20 pages",
      "Interactive site",
      "Unlimited forms",
      "Social media pages creation",
      "Free digital marketing consultation for a year",
      "Free domain and web hosting for a year",
    ],
    service: "website-design-development",
    rating: 5,
    reviews: 12,
  },

  // ---------- Hosting ----------
  {
    slug: "hosting-starter",
    name: "Starter Hosting",
    category: "hosting",
    price: 6,
    per: "mo",
    summary: "10 GB SSD hosting with free SSL and daily backups.",
    description:
      "Entry-level hosting for brochure sites and portfolios, with free SSL, daily backups and five email accounts.",
    includes: [
      "10 GB SSD storage",
      "100 GB monthly bandwidth",
      "5 email accounts",
      "Free SSL certificate",
      "Daily backups",
    ],
    service: "web-hosting",
    rating: 4.6,
    reviews: 58,
  },
  {
    slug: "hosting-business",
    name: "Business Hosting",
    category: "hosting",
    price: 14,
    per: "mo",
    badge: "Popular",
    summary: "50 GB SSD, unmetered bandwidth and a free domain.",
    description:
      "Our most popular plan. Unmetered bandwidth, 25 mailboxes, staging environment, free migration and a free domain for the first year.",
    includes: [
      "50 GB SSD storage",
      "Unmetered bandwidth",
      "25 email accounts",
      "Free domain for the first year",
      "Free migration",
      "Staging environment",
    ],
    service: "web-hosting",
    rating: 4.9,
    reviews: 76,
  },
  {
    slug: "hosting-professional",
    name: "Professional Hosting",
    category: "hosting",
    price: 32,
    per: "mo",
    summary: "150 GB NVMe with dedicated resources and 24/7 escalation.",
    description:
      "Built for e-commerce and business-critical portals. Dedicated resources, wildcard SSL, 60-day backup retention and a named account manager.",
    includes: [
      "150 GB NVMe storage",
      "Unmetered bandwidth",
      "Unlimited email accounts",
      "Wildcard SSL certificate",
      "Dedicated resources",
      "24/7 escalation",
    ],
    service: "web-hosting",
    rating: 4.8,
    reviews: 29,
  },
  {
    slug: "email-hosting-cozw",
    name: "Email Hosting — .co.zw",
    category: "hosting",
    price: 15,
    per: "yr",
    badge: "Best value",
    summary: "20 mailboxes with 800 GB storage and free domain hosting.",
    description:
      "Business email on a .co.zw domain, including twenty accounts, generous storage and free domain hosting for the first year.",
    includes: [
      "20 email accounts",
      "800 GB storage",
      "Free domain hosting (first year)",
      "Webmail access",
      "Spam filtering",
    ],
    service: "web-hosting",
    rating: 4.7,
    reviews: 41,
  },
  {
    slug: "email-hosting-com",
    name: "Email Hosting — .com / .tech / .africa",
    category: "hosting",
    price: 25,
    per: "yr",
    summary: "Three mailboxes on an international domain.",
    description:
      "Business email on a .com, .tech or .africa domain with free domain hosting for the first year.",
    includes: [
      "3 email accounts",
      "500 MB storage",
      "Free domain hosting (first year)",
      "Webmail access",
      "Spam filtering",
    ],
    service: "web-hosting",
    rating: 4.5,
    reviews: 23,
  },

  // ---------- Marketing ----------
  {
    slug: "marketing-standard",
    name: "Digital Marketing — Standard",
    category: "marketing",
    price: 100,
    per: "mo",
    summary: "Weekly posting, monthly boosting and a marketing plan.",
    description:
      "Entry-level social management with one scheduled post a week, boosting across the whole month, page evaluation, flyer design and a curated digital marketing plan.",
    includes: [
      "Scheduled posts, 1 per week",
      "Boosting for the whole month",
      "Page evaluation",
      "Flyer designing",
      "Digital marketing plan curation",
      "Action plan",
    ],
    service: "digital-marketing",
    rating: 4.6,
    reviews: 47,
  },
  {
    slug: "marketing-premium",
    name: "Digital Marketing — Premium",
    category: "marketing",
    price: 200,
    per: "mo",
    badge: "Popular",
    summary: "Twice-weekly posting with reporting and a monthly reel.",
    description:
      "Sales-driven content creation, two posts a week, thirty days of management, follower engagement, monthly reporting and one reel.",
    includes: [
      "Content creation, sales driven",
      "Scheduled posts, 2 per week",
      "30 days of management",
      "Boosting for the whole month",
      "Engagement with followers",
      "Reporting",
      "One reel",
      "Digital marketing plan",
    ],
    service: "digital-marketing",
    rating: 4.8,
    reviews: 39,
  },
  {
    slug: "marketing-elite",
    name: "Digital Marketing — Elite",
    category: "marketing",
    price: 350,
    per: "mo",
    badge: "Best value",
    summary: "Three posts a week, two reels, SEO and 100+ new followers.",
    description:
      "Our full-service retainer: three posts a week, two 30-second reels, month-long ad management, SEO, WhatsApp channel management and a 100+ new follower target every month.",
    includes: [
      "Scheduled posts, 3 per week",
      "Two videos / reels, 30 sec",
      "Digital marketing plan",
      "Ads for the whole month",
      "Engagement with followers",
      "SEO",
      "Flyer designing",
      "Content creation",
      "WhatsApp channel management",
      "100+ new followers per month",
    ],
    service: "digital-marketing",
    rating: 4.9,
    reviews: 18,
  },

  // ---------- Media ----------
  {
    slug: "reel-30",
    name: "Corporate Reel — 30 seconds",
    category: "media",
    price: 120,
    per: null,
    summary: "A 30-second corporate reel, shot and edited.",
    description:
      "A single 30-second corporate reel produced for social distribution. Rates do not include transport.",
    includes: ["1 reel", "30 seconds", "Shooting and editing", "Social export formats"],
    service: "photography-videography",
    rating: 4.7,
    reviews: 26,
  },
  {
    slug: "reel-90",
    name: "Corporate Reel — 90 seconds",
    category: "media",
    price: 200,
    per: null,
    badge: "Popular",
    summary: "A 90-second corporate film for campaigns and launches.",
    description:
      "A 90-second corporate reel with enough room for a full narrative. Rates do not include transport.",
    includes: ["1 reel", "90 seconds", "Shooting and editing", "Social export formats"],
    service: "photography-videography",
    rating: 4.9,
    reviews: 14,
  },
  {
    slug: "corporate-photography",
    name: "Corporate Photography",
    category: "media",
    price: 150,
    per: "hr",
    summary: "Professional corporate photography, charged hourly.",
    description:
      "Corporate photography for teams, premises, products and events. Rates do not include transport, and retainer clients receive a discount.",
    includes: [
      "Professional photographer",
      "Edited high-resolution images",
      "Commercial usage rights",
    ],
    service: "photography-videography",
    rating: 4.8,
    reviews: 33,
  },
  {
    slug: "event-reel-bronze",
    name: "Event Coverage — Bronze",
    category: "media",
    price: 380,
    per: null,
    summary: "Three hours of coverage with a highlight reel and trailer.",
    description:
      "Three hours of event coverage returning one full highlight reel plus a 15–30 second trailer cut for social.",
    includes: [
      "3 hours of coverage",
      "1 full event highlight reel",
      "15–30 second trailer",
    ],
    service: "photography-videography",
    rating: 4.8,
    reviews: 19,
  },
  {
    slug: "live-stream-3hr",
    name: "Event Live Streaming — 3 hours",
    category: "media",
    price: 450,
    per: null,
    summary: "Three hours of professional live streaming.",
    description:
      "Full live streaming production for conferences, launches and ceremonies, streamed to the platform of your choice.",
    includes: [
      "3 hours of streaming",
      "Professional crew and equipment",
      "Streamed to your chosen platform",
    ],
    service: "photography-videography",
    rating: 4.7,
    reviews: 11,
  },

  // ---------- Compliance ----------
  {
    slug: "dpo-standard",
    name: "DPO Consultancy — Standard",
    category: "compliance",
    price: 220,
    per: "mo",
    summary: "Compliance monitoring, staff awareness and data request support.",
    description:
      "Entry-level outsourced Data Protection Officer support covering ongoing compliance monitoring, staff awareness and data subject request handling.",
    includes: ["Compliance monitoring", "Staff awareness", "Data request support"],
    service: "data-protection",
    rating: 4.8,
    reviews: 16,
  },
  {
    slug: "dpo-premium",
    name: "DPO Consultancy — Premium",
    category: "compliance",
    price: 300,
    per: "mo",
    badge: "Popular",
    summary: "Adds staff training, compliance audits and regulatory handling.",
    description:
      "Everything in Standard plus staff training, compliance audits, employee compliance advice and regulatory request handling.",
    includes: [
      "Everything in Standard",
      "Staff training",
      "Compliance audits",
      "Employee compliance advice",
      "Regulatory request handling",
    ],
    service: "data-protection",
    rating: 4.9,
    reviews: 22,
  },
  {
    slug: "dpo-elite",
    name: "DPO Consultancy — Elite",
    category: "compliance",
    price: 450,
    per: "mo",
    badge: "Best value",
    summary: "Full DPO service with DPIA support and POTRAZ liaison.",
    description:
      "Our complete outsourced DPO service, including DPIA support, direct authority liaison and acting as the data subject contact point for your organisation.",
    includes: [
      "Everything in Premium",
      "DPIA support",
      "Authority liaison",
      "Data subject contact services",
    ],
    service: "data-protection",
    rating: 5,
    reviews: 9,
  },
  {
    slug: "potraz-readiness-review",
    name: "POTRAZ Readiness Review",
    category: "compliance",
    price: 850,
    per: null,
    badge: "New",
    summary: "One-off executive review ahead of the 1 September 2026 inspections.",
    description:
      "A full executive data protection readiness review using the Prevsol Digital Data Protection Governance Review Toolkit. Assesses governance, compliance and operational readiness before POTRAZ inspections commence.",
    includes: [
      "Governance maturity assessment",
      "Data protection compliance assessment",
      "Documentation and records review",
      "Data protection gap analysis",
      "Executive risk assessment",
      "Prioritised remediation roadmap",
      "Board and executive briefing",
    ],
    service: "data-protection",
    rating: 5,
    reviews: 7,
  },

  // ---------- Software ----------
  {
    slug: "web-app-standard",
    name: "Web Application — Standard",
    category: "software",
    price: 1500,
    per: null,
    summary: "Custom web application built to your process.",
    description:
      "A custom web application scoped to your requirements, with process mapping, user training and documentation. Final pricing depends on system specifications.",
    includes: [
      "Custom web application",
      "Requirements and process mapping",
      "User training and documentation",
      "Post-launch support window",
    ],
    service: "custom-software",
    rating: 4.8,
    reviews: 8,
  },
  {
    slug: "mini-erp",
    name: "Mini ERP",
    category: "software",
    price: 1500,
    per: null,
    summary: "Core ERP modules for smaller operations.",
    description:
      "A compact ERP covering the core modules a growing business needs, without the cost and complexity of a full enterprise deployment.",
    includes: [
      "Core ERP modules",
      "Requirements and process mapping",
      "User training and documentation",
      "Post-launch support window",
    ],
    service: "custom-software",
    rating: 4.7,
    reviews: 6,
  },
  {
    slug: "erp-with-ai",
    name: "ERP with AI",
    category: "software",
    price: 2500,
    per: null,
    badge: "Best value",
    summary: "Full ERP with AI-assisted reporting and forecasting.",
    description:
      "A complete ERP build with multi-module integration and AI-assisted reporting and forecasting applied to the decisions that actually matter to your operation.",
    includes: [
      "Full ERP build",
      "AI-assisted reporting and forecasting",
      "Multi-module integration",
      "Requirements and process mapping",
      "User training and documentation",
    ],
    service: "custom-software",
    rating: 4.9,
    reviews: 5,
  },

  // ---------- Branding ----------
  {
    slug: "logo-design",
    name: "Logo Design",
    category: "branding",
    price: 50,
    per: null,
    summary: "Original logo design with full source and export files.",
    description:
      "Logo design developed through concept directions and revision rounds, delivered with editable source files and every export format you need.",
    includes: ["Logo design", "Source files", "Full export format set"],
    service: "branding",
    rating: 4.8,
    reviews: 52,
  },
  {
    slug: "company-profile",
    name: "Company Profile Design",
    category: "branding",
    price: 50,
    per: null,
    badge: "Popular",
    summary: "Designed, typeset company profile ready for print and digital.",
    description:
      "A full company profile designed and typeset to your brand, delivered print-ready and as a digital export.",
    includes: [
      "Full company profile design",
      "Layout and typesetting",
      "Print-ready and digital exports",
    ],
    service: "branding",
    rating: 4.9,
    reviews: 28,
  },
  {
    slug: "flyer-design",
    name: "Flyer Design",
    category: "branding",
    price: 10,
    per: null,
    summary: "Single flyer designed for print and social.",
    description:
      "A single flyer designed to your brand and exported for both print and social distribution.",
    includes: ["Single flyer design", "Print and social export formats"],
    service: "branding",
    rating: 4.6,
    reviews: 64,
  },
];

export const productsBySlug = new Map(products.map((p) => [p.slug, p]));

export function getProduct(slug: string) {
  return productsBySlug.get(slug);
}

export function productsInCategory(category: ProductCategory) {
  return products.filter((p) => p.category === category);
}

/** Products shown in the homepage "Featured products and services" band, §4. */
export const featuredProducts = products.filter((p) => p.badge);

export function relatedProducts(product: Product, limit = 4) {
  const sameCategory = products.filter(
    (p) => p.category === product.category && p.slug !== product.slug,
  );
  const sameService = products.filter(
    (p) =>
      p.service === product.service &&
      p.slug !== product.slug &&
      p.category !== product.category,
  );
  return [...sameCategory, ...sameService].slice(0, limit);
}

export function formatPrice(price: number, per: string | null) {
  const amount = `$${price.toLocaleString("en-US")}`;
  return per ? `${amount}/${per}` : amount;
}
