/**
 * Service catalogue — Company Profile.pdf pp.3-10.
 *
 * One entry per service. Each drives BOTH the compact card in the homepage
 * services section AND its own dedicated page at /services/[slug], per the
 * requirements doc §5: "Each service should have its own dedicated page."
 */

export type Package = {
  name: string;
  price: number;
  /** e.g. "mo", "yr", "hr", or null for one-off */
  per: string | null;
  featured?: boolean;
  includes: string[];
  excludes?: string[];
};

export type Faq = { q: string; a: string };

export type Service = {
  slug: string;
  /** Short label for nav and compact cards. */
  name: string;
  /** Full title for the service page hero. */
  title: string;
  /** One line, used on the homepage card. */
  summary: string;
  /** Two or three sentences, used on the service page hero. */
  overview: string;
  icon: IconName;
  /** Bulleted capability list from the company profile. */
  capabilities: string[];
  /** Benefit statements, written for the service page. */
  benefits: { title: string; body: string }[];
  packages?: Package[];
  /** Note rendered under the pricing table. */
  pricingNote?: string;
  faqs: Faq[];
  /** Slugs of related services. */
  related: string[];
  /** Featured on the homepage grid. */
  featured?: boolean;
};

export type IconName =
  | "globe"
  | "server"
  | "code"
  | "megaphone"
  | "camera"
  | "shield"
  | "compass"
  | "cloud"
  | "cart"
  | "sparkles";

export const services: Service[] = [
  {
    slug: "website-design-development",
    name: "Website Design & Development",
    title: "Website Design & Development",
    summary:
      "Corporate, business, e-commerce and institutional websites built to convert and built to last.",
    overview:
      "We design and build websites that work as commercial assets rather than digital brochures. Every site is responsive, SEO-ready and performance-optimised from the first line of code, with a content management system your team can actually run without calling a developer.",
    icon: "globe",
    featured: true,
    capabilities: [
      "Corporate websites",
      "Business websites",
      "E-commerce platforms",
      "School websites",
      "Healthcare websites",
      "NGO websites",
      "Government portals",
      "Portfolio websites",
      "Landing pages",
      "Website redesigns",
      "Website maintenance",
      "CMS development",
      "SEO-friendly development",
      "Performance optimization",
    ],
    benefits: [
      {
        title: "Built to be found",
        body: "Technical SEO, clean semantic markup and fast Core Web Vitals are part of the build, not an upsell added afterwards.",
      },
      {
        title: "Yours to manage",
        body: "Every site ships with a content management system and a handover session, so your team can publish updates without a retainer.",
      },
      {
        title: "Responsive by default",
        body: "Designed mobile-first and tested across desktop, laptop, tablet and phone before it goes anywhere near production.",
      },
      {
        title: "Hosting included",
        body: "Standard and Interactive packages include free domain registration and web hosting for the first year on our own infrastructure.",
      },
    ],
    packages: [
      {
        name: "Standard",
        price: 250,
        per: "mo",
        includes: [
          "5 pages maximum",
          "Free domain and web hosting for a year",
          "SEO",
          "Contact form",
          "WhatsApp button",
        ],
        excludes: ["Interactive site", "Online store"],
      },
      {
        name: "E-Commerce",
        price: 590,
        per: "mo",
        featured: true,
        includes: [
          "Full e-commerce site",
          "Payment gateway configuration",
          "Online store",
          "Up to 20 pages",
          "Interactive site",
          "Unlimited forms",
          "Social media pages creation",
          "Free digital marketing consultation for a year",
          "Free domain and web hosting for a year",
        ],
      },
      {
        name: "Interactive",
        price: 370,
        per: "mo",
        includes: [
          "Maximum 10 pages",
          "Free annual domain and hosting",
          "SEO",
          "Interactive site",
          "Maximum 5 forms",
          "Social media pages creation",
        ],
        excludes: ["Payment gateway configuration"],
      },
    ],
    faqs: [
      {
        q: "How long does a website take to build?",
        a: "A Standard five-page site typically takes two to three weeks from content handover. Interactive sites run three to four weeks, and e-commerce builds four to six weeks depending on catalogue size and payment gateway approval times.",
      },
      {
        q: "Do I own the website?",
        a: "Yes. On final payment you own the design, the content and the codebase, and the domain is registered in your organisation's name.",
      },
      {
        q: "What happens after the free hosting year ends?",
        a: "You move onto one of our standard hosting packages at the published rate, or you can take a full export and host it elsewhere. There is no lock-in.",
      },
      {
        q: "Can you redesign an existing site without losing our search rankings?",
        a: "Yes. We map every existing URL to its replacement, keep redirects in place and preserve metadata, so rankings carry across the migration.",
      },
    ],
    related: ["web-hosting", "ecommerce-consultancy", "digital-marketing"],
  },
  {
    slug: "web-hosting",
    name: "Web Hosting & Domains",
    title: "Web Hosting & Domain Services",
    summary:
      "Fast, monitored, daily-backed-up hosting with domain registration, SSL and business email.",
    overview:
      "Shared, business, VPS and cloud hosting on infrastructure we monitor ourselves. Every plan includes SSL, daily backups and email hosting, and every domain is registered in your own name so you are never locked to a provider.",
    icon: "server",
    featured: true,
    capabilities: [
      "Web hosting & domain services",
      "Shared hosting",
      "Business hosting",
      "VPS hosting",
      "Cloud hosting",
      "Domain registration",
      "SSL certificates",
      "Email hosting",
      "Daily backups",
      "Monitoring",
    ],
    benefits: [
      {
        title: "Daily backups, always",
        body: "Every account is backed up daily and retained, on every plan including the entry tier. Restores are free.",
      },
      {
        title: "Free SSL on every plan",
        body: "HTTPS is configured and auto-renewed for you. No plan on this page ships without it.",
      },
      {
        title: "Local support",
        body: "Support from a team in the same time zone, reachable by ticket, phone and WhatsApp during business hours.",
      },
      {
        title: "Domains in your name",
        body: "We register .co.zw, .com, .tech and .africa domains under your organisation as the legal registrant.",
      },
    ],
    pricingNote:
      "Email hosting is priced separately — see the Email Hosting packages on the hosting page.",
    faqs: [
      {
        q: "Can you migrate my existing website and email?",
        a: "Yes, migration is free on annual plans. We copy files, databases and mailboxes, test on a staging URL, then switch DNS at a time you choose to avoid downtime.",
      },
      {
        q: "What is your uptime commitment?",
        a: "We target 99.9% monthly uptime across all hosting plans, with monitoring that alerts our team before most clients notice an issue.",
      },
      {
        q: "Do you register .co.zw domains?",
        a: "Yes. We handle .co.zw registration and renewal, along with .com, .tech and .africa extensions.",
      },
      {
        q: "Can I upgrade my plan later?",
        a: "Yes, at any time. Upgrades are prorated against your existing billing period and applied the same day.",
      },
    ],
    related: [
      "website-design-development",
      "cloud-solutions",
      "it-consultancy",
    ],
  },
  {
    slug: "data-protection",
    name: "Data Protection & Cybersecurity",
    title: "Data Protection & Cybersecurity Consultancy",
    summary:
      "POTRAZ compliance, DPO services, DPIAs and audits under the Cyber and Data Protection Act.",
    overview:
      "POTRAZ begins mandatory risk-based inspections on 1 September 2026, and the Data Controller Licence deadline has already passed. We take organisations from wherever they are today to demonstrable compliance with the Cyber and Data Protection Act [Chapter 12:07] — governance, documentation, training and regulator liaison included.",
    icon: "shield",
    featured: true,
    capabilities: [
      "Regulatory compliance with Zimbabwe's Cyber & Data Protection Act (Chapter 12:07)",
      "Data protection policies and procedures",
      "Data Protection Impact Assessments (DPIAs)",
      "Risk assessments and compliance audits",
      "Data breach response planning and incident management",
      "Employee privacy awareness and training",
      "Records of Processing Activities (ROPA)",
      "Ongoing compliance monitoring and advisory support",
      "Preparation for POTRAZ inspections and regulatory audits",
      "Data Protection Officer (DPO) services",
      "Data Controller licensing assistance",
      "Privacy audits and data mapping",
      "Privacy-by-design advisory",
    ],
    benefits: [
      {
        title: "Inspection-ready documentation",
        body: "ROPA, policies, privacy notices and DPIA records assembled into the evidence pack an inspector will actually ask to see.",
      },
      {
        title: "A named officer",
        body: "Outsourced DPO services give you a qualified, named Data Protection Officer without carrying a full-time role on your payroll.",
      },
      {
        title: "Board-level reporting",
        body: "Governance maturity assessments and executive risk reporting written for directors, not just for the IT department.",
      },
      {
        title: "Regulator liaison",
        body: "On Elite, we act as the contact point for POTRAZ correspondence and for data subject requests reaching your organisation.",
      },
    ],
    packages: [
      {
        name: "Standard",
        price: 220,
        per: "mo",
        includes: [
          "Compliance monitoring",
          "Staff awareness",
          "Data request support",
        ],
        excludes: ["Staff training"],
      },
      {
        name: "Elite",
        price: 450,
        per: "mo",
        featured: true,
        includes: [
          "Everything in Premium",
          "DPIA support",
          "Authority liaison",
          "Data subject contact services",
        ],
      },
      {
        name: "Premium",
        price: 300,
        per: "mo",
        includes: [
          "Everything in Standard",
          "Staff training",
          "Compliance audits",
          "Employee compliance advice",
          "Regulatory request handling",
        ],
      },
    ],
    faqs: [
      {
        q: "When do POTRAZ inspections actually start?",
        a: "POTRAZ commences mandatory risk-based inspections of organisations processing personal information on 1 September 2026. The separate Data Controller Licence deadline passed on 12 March 2025, so organisations that have not licensed are already overdue.",
      },
      {
        q: "Does my organisation need a Data Protection Officer?",
        a: "Under the Cyber and Data Protection Act, organisations processing personal information are expected to appoint a Data Protection Officer. Our outsourced DPO service satisfies this with a qualified named officer at a fraction of an internal hire.",
      },
      {
        q: "What happens if we are not ready for an inspection?",
        a: "Organisations that are not adequately prepared may face regulatory enforcement, financial penalties, reputational damage and operational disruption. A readiness review well ahead of the date is materially cheaper than remediation under enforcement.",
      },
      {
        q: "How long does it take to get compliant?",
        a: "A readiness review takes two to three weeks. Remediation depends on your starting point — most SMEs reach an inspection-ready position within three months on a Premium or Elite retainer.",
      },
      {
        q: "What is included in the readiness review?",
        a: "Governance maturity assessment, data protection compliance assessment, documentation and records review, gap analysis, executive risk assessment, a prioritised remediation roadmap, and a board and executive briefing. Capacity building is optional.",
      },
    ],
    related: ["it-consultancy", "cloud-solutions", "web-hosting"],
  },
  {
    slug: "custom-software",
    name: "Custom Software & Apps",
    title: "Custom Software & Application Development",
    summary:
      "Management systems, ERPs, portals, mobile apps and API integrations built to your process.",
    overview:
      "When off-the-shelf software forces your business to work backwards, we build the system that fits the process you actually run. Business management systems, school administration, HR, inventory, CRM, booking platforms, customer portals and mobile applications, delivered with the integrations to make them talk to what you already own.",
    icon: "code",
    featured: true,
    capabilities: [
      "Business management systems",
      "School management systems",
      "HR systems",
      "Inventory systems",
      "CRM systems",
      "ERP integrations",
      "Customer portals",
      "Booking systems",
      "Web applications",
      "API integrations",
      "Portals",
      "Mobile apps",
      "Front & backend development",
      "Access control systems",
    ],
    benefits: [
      {
        title: "Built around your process",
        body: "We map how your organisation actually works before writing code, rather than bending your operation to fit a product.",
      },
      {
        title: "Integrates with what you own",
        body: "API integrations connect new systems to your existing accounting, payroll, payment and ERP tooling.",
      },
      {
        title: "AI where it earns its place",
        body: "Our ERP tier includes AI-assisted reporting and forecasting — applied to specific decisions, not bolted on as a feature list.",
      },
      {
        title: "Supported after launch",
        body: "Every system ships with documentation, user training and a support window, with optional ongoing maintenance.",
      },
    ],
    packages: [
      {
        name: "Standard",
        price: 1500,
        per: null,
        includes: [
          "Custom web application",
          "Requirements and process mapping",
          "User training and documentation",
          "Post-launch support window",
        ],
      },
      {
        name: "ERPs with AI",
        price: 2500,
        per: null,
        featured: true,
        includes: [
          "Full ERP build",
          "AI-assisted reporting and forecasting",
          "Multi-module integration",
          "Requirements and process mapping",
          "User training and documentation",
          "Post-launch support window",
        ],
      },
      {
        name: "Mini ERP",
        price: 1500,
        per: null,
        includes: [
          "Core ERP modules",
          "Requirements and process mapping",
          "User training and documentation",
          "Post-launch support window",
        ],
      },
    ],
    pricingNote:
      "System development pricing depends on system specifications and requirements. Request a quote for a scoped estimate.",
    faqs: [
      {
        q: "How is a custom system priced?",
        a: "Pricing depends on system specifications and requirements. The figures above are starting points — we scope your requirements first and quote against a defined feature set so there are no moving numbers mid-project.",
      },
      {
        q: "Do you build mobile apps as well as web systems?",
        a: "Yes. We build web applications, mobile apps, and systems that share one backend across both.",
      },
      {
        q: "Can you integrate with our existing accounting or payroll software?",
        a: "Yes, wherever the vendor exposes an API or a supported export format. API integrations are a standard part of our delivery.",
      },
      {
        q: "Who owns the source code?",
        a: "You do, on final payment. We hand over the repository, the deployment configuration and the documentation.",
      },
    ],
    related: ["it-consultancy", "cloud-solutions", "website-design-development"],
  },
  {
    slug: "digital-marketing",
    name: "Digital Marketing",
    title: "Digital Marketing Solutions",
    summary:
      "SEO, paid social, content and campaign management measured against leads, not impressions.",
    overview:
      "Managed digital marketing built around a plan rather than a posting schedule. Content creation, scheduled posting, paid boosting, follower engagement, SEO and monthly reporting — with add-ons for photography, video and influencer collaboration when a campaign needs them.",
    icon: "megaphone",
    featured: true,
    capabilities: [
      "SEO",
      "SEM",
      "Social media marketing",
      "Content marketing",
      "Email marketing",
      "Online advertising",
      "Analytics",
      "Conversion optimization",
    ],
    benefits: [
      {
        title: "A plan before a post",
        body: "Every package starts with a digital marketing plan and an action plan, so campaigns run toward a defined objective.",
      },
      {
        title: "Reported monthly",
        body: "Premium and Elite include monthly reporting on reach, engagement, follower growth and conversion.",
      },
      {
        title: "Content produced for you",
        body: "Flyer design, content creation and reels are produced in-house — you are not asked to supply the assets.",
      },
      {
        title: "Growth commitments",
        body: "Elite targets 100+ new followers per month alongside three posts per week and full-month ad management.",
      },
    ],
    packages: [
      {
        name: "Standard",
        price: 100,
        per: "mo",
        includes: [
          "Scheduled posts, 1 per week",
          "Boosting for the whole month",
          "Page evaluation",
          "Flyer designing",
          "Digital marketing plan curation",
          "Action plan",
        ],
        excludes: ["Reel", "Reporting"],
      },
      {
        name: "Elite",
        price: 350,
        per: "mo",
        featured: true,
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
      },
      {
        name: "Premium",
        price: 200,
        per: "mo",
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
      },
    ],
    pricingNote:
      "Add-ons: extra post $12 · corporate photoshoot $50 · video shoot $60 · drone shoot $100 · influencer collaboration $200 · competitor analysis $30.",
    faqs: [
      {
        q: "Is ad spend included in the monthly price?",
        a: "Boosting and campaign management are included as a service. Platform ad spend is billed separately at cost, and we agree the monthly budget with you upfront.",
      },
      {
        q: "Which platforms do you manage?",
        a: "Facebook, Instagram, LinkedIn and WhatsApp channels are standard. Elite includes dedicated WhatsApp channel management.",
      },
      {
        q: "Do you write the content?",
        a: "Yes. Content creation, flyer design and reels are produced by our team under the agreed marketing plan.",
      },
      {
        q: "Can I add a photoshoot to a monthly package?",
        a: "Yes. Corporate photoshoots, video shoots, drone footage, influencer collaboration and competitor analysis are all available as add-ons at the rates listed above.",
      },
    ],
    related: ["photography-videography", "ecommerce-consultancy", "branding"],
  },
  {
    slug: "photography-videography",
    name: "Photography & Videography",
    title: "Photography & Videography",
    summary:
      "Corporate shoots, promotional reels, event coverage, live streaming and motion graphics.",
    overview:
      "Corporate photography and video production for organisations that need assets good enough to lead a campaign. Short-form reels, promotional films with concept and script writing, full event coverage with highlight reels, live streaming and motion graphics.",
    icon: "camera",
    capabilities: [
      "Corporate photography",
      "Corporate videography",
      "Events photoshoot",
      "Live streaming",
      "Video production",
      "Wedding shoots",
      "Graduation ceremony shoots",
    ],
    benefits: [
      {
        title: "Concept and script included",
        body: "Promotional reel packages include concept development and script writing, not just a camera on the day.",
      },
      {
        title: "Event coverage that delivers",
        body: "Event packages return a full highlight reel plus a 15–30 second trailer cut for social distribution.",
      },
      {
        title: "Live streaming",
        body: "One, two and three hour streaming packages for conferences, launches and ceremonies.",
      },
      {
        title: "Retainer discounts",
        body: "Clients on a retainer basis receive discounted rates across all photography and video services.",
      },
    ],
    packages: [
      {
        name: "Short Form — Bronze",
        price: 160,
        per: null,
        includes: ["1 reel", "30 seconds max", "1 hour max on set"],
      },
      {
        name: "Promotional — Silver",
        price: 270,
        per: null,
        featured: true,
        includes: [
          "1 reel",
          "45–60 seconds max",
          "Concept & script writing",
          "2 hrs 30 mins max on set",
        ],
      },
      {
        name: "Event — Bronze",
        price: 380,
        per: null,
        includes: [
          "3 hours of coverage",
          "1 full event highlight reel",
          "15–30 seconds trailer",
        ],
      },
    ],
    pricingNote:
      "Also available — short form Silver $200 · promotional Bronze $200 · event Silver $640 (5–6 hrs) · corporate reels 30/60/90 sec at $120/$170/$200 · motion graphics from $110 · corporate photography $150/hr · live streaming $200 (1 hr), $320 (2 hrs), $450 (3 hrs). Rates do not include transport. Discounts apply for clients on a retainer basis.",
    faqs: [
      {
        q: "Is transport included in the quoted rates?",
        a: "No. Rates do not include transport, which is quoted separately based on location.",
      },
      {
        q: "Do you offer discounts for ongoing work?",
        a: "Yes. Discounts can be implemented for clients on a retainer basis across photography, videography and motion graphics.",
      },
      {
        q: "How long until we receive the final files?",
        a: "Short-form reels are typically delivered within three working days. Event highlight reels take five to seven working days depending on coverage length.",
      },
      {
        q: "Can you live stream our event?",
        a: "Yes, in one, two or three hour packages, streamed to the platform of your choice.",
      },
    ],
    related: ["digital-marketing", "branding"],
  },
  {
    slug: "it-consultancy",
    name: "IT Consultancy",
    title: "IT Consultancy",
    summary:
      "Digital transformation, ICT strategy, infrastructure planning, governance and CCTV.",
    overview:
      "Advisory for organisations deciding what to build, what to buy and what to retire. ICT strategy, infrastructure planning, process automation, IT governance and project management, through to physical infrastructure including CCTV installation and access control.",
    icon: "compass",
    capabilities: [
      "Digital transformation",
      "ICT strategy",
      "Infrastructure planning",
      "Project management",
      "Process automation",
      "IT governance",
      "IT infrastructure",
      "CCTV installation",
    ],
    benefits: [
      {
        title: "Vendor-neutral advice",
        body: "We advise on what your organisation needs. Where we can deliver it we will say so, and where you are better served elsewhere we will say that too.",
      },
      {
        title: "Strategy that ships",
        body: "Every engagement ends in a prioritised, costed roadmap with owners and dates, not a slide deck.",
      },
      {
        title: "Automation of real work",
        body: "We target the manual processes consuming the most staff hours, and measure the time recovered.",
      },
      {
        title: "Physical and digital",
        body: "Infrastructure planning extends to CCTV and access control, so premises and systems are covered under one plan.",
      },
    ],
    faqs: [
      {
        q: "How does a consultancy engagement start?",
        a: "With a discovery session covering your current infrastructure, systems, team capability and business objectives. We then return a written assessment and a prioritised roadmap.",
      },
      {
        q: "Do you manage implementation as well as advise?",
        a: "Yes. We offer project management through delivery, whether we are building the solution or coordinating third-party vendors.",
      },
      {
        q: "Can you help us plan an IT budget?",
        a: "Yes. Infrastructure planning includes capital and operating cost projections so budget submissions are defensible.",
      },
    ],
    related: ["data-protection", "cloud-solutions", "custom-software"],
  },
  {
    slug: "cloud-solutions",
    name: "Cloud Solutions",
    title: "Cloud Solutions",
    summary:
      "Cloud migration, Microsoft 365, Google Workspace, backups and collaboration tooling.",
    overview:
      "Move to the cloud without losing a mailbox or a file. We plan and execute migrations to Microsoft 365 and Google Workspace, configure cloud backups, and set up the collaboration tooling your team will actually adopt.",
    icon: "cloud",
    capabilities: [
      "Cloud migration",
      "Microsoft 365",
      "Google Workspace",
      "Cloud backups",
      "Collaboration solutions",
    ],
    benefits: [
      {
        title: "Migrations without downtime",
        body: "Mail, files and calendars are staged and verified before cutover, scheduled outside your business hours.",
      },
      {
        title: "Licensing that fits",
        body: "We right-size Microsoft 365 and Google Workspace licences to your actual usage instead of defaulting to the top tier.",
      },
      {
        title: "Backups you have tested",
        body: "Cloud backup configuration includes a documented restore test, so you know recovery works before you need it.",
      },
      {
        title: "Adoption support",
        body: "Staff training on the new tooling is part of the migration, because a platform nobody uses is not a migration.",
      },
    ],
    faqs: [
      {
        q: "Will we lose email during a migration?",
        a: "No. Mailboxes are synchronised in advance and cutover happens outside business hours, so mail continues to flow throughout.",
      },
      {
        q: "Microsoft 365 or Google Workspace — which should we choose?",
        a: "It depends on your existing document estate, your team's habits and your compliance requirements. We assess and recommend rather than defaulting to one vendor.",
      },
      {
        q: "Can you migrate from an on-premise server?",
        a: "Yes, including legacy Exchange and file server environments.",
      },
    ],
    related: ["it-consultancy", "web-hosting", "data-protection"],
  },
  {
    slug: "ecommerce-consultancy",
    name: "E-Commerce Consultancy",
    title: "E-Commerce Consultancy",
    summary:
      "Store setup, platform selection, payment gateways, UX optimisation and growth strategy.",
    overview:
      "Advisory and delivery for organisations selling online. Strategy and business planning, platform selection and migration, payment gateway integration, catalogue and inventory management, fulfilment process design, and the analytics to tell you what is actually converting.",
    icon: "cart",
    capabilities: [
      "E-commerce strategy & business planning",
      "Online store setup & development",
      "Platform selection & migration",
      "Payment gateway integration",
      "Product catalog & inventory management",
      "Order & fulfillment process optimization",
      "Customer experience (UX) optimization",
      "Digital marketing for e-commerce",
      "Sales performance analytics & reporting",
      "E-commerce growth & scaling strategies",
    ],
    benefits: [
      {
        title: "Payments that clear locally",
        body: "We integrate the gateways your customers actually use, and handle the merchant approval process with you.",
      },
      {
        title: "Fewer steps to checkout",
        body: "Checkout flows are designed to the shortest viable path, because every additional step measurably costs you orders.",
      },
      {
        title: "Inventory under control",
        body: "Catalogue and stock management configured so the store and your back office agree on what you have.",
      },
      {
        title: "Measured, then improved",
        body: "Sales performance analytics identify where the funnel leaks, and we prioritise fixes against revenue impact.",
      },
    ],
    faqs: [
      {
        q: "Which payment gateways can you integrate?",
        a: "We work with local and international gateways including mobile money, card processing and bank transfer options, selected against where your customers are.",
      },
      {
        q: "Can you migrate an existing store to a new platform?",
        a: "Yes. Platform selection and migration is a core part of the service, including product data, customers, orders and URL structure.",
      },
      {
        q: "Do you build the store as well as advise on it?",
        a: "Yes — our Website Development E-Commerce package covers the build, and this service covers strategy, optimisation and scaling.",
      },
    ],
    related: [
      "website-design-development",
      "digital-marketing",
      "custom-software",
    ],
  },
  {
    slug: "branding",
    name: "Branding",
    title: "Branding & Corporate Identity",
    summary:
      "Brand identity, logo design, positioning, guidelines and marketing collateral.",
    overview:
      "Brand identity work for organisations that need to look like the company they have become. Logo design, corporate identity, brand strategy and positioning, brand guidelines, marketing collateral, packaging, vehicle and event branding.",
    icon: "sparkles",
    capabilities: [
      "Brand identity development",
      "Logo design",
      "Brand strategy & positioning",
      "Corporate identity design",
      "Brand guidelines development",
      "Marketing collateral design",
      "Packaging design",
      "Social media branding",
      "Rebranding & brand refresh",
      "Brand consultation & management",
    ],
    benefits: [
      {
        title: "Applied, not just designed",
        body: "Identity work is delivered applied to real collateral — roll-up banners, vehicle livery, gazebos, stationery and social templates.",
      },
      {
        title: "Guidelines your team can follow",
        body: "Brand guidelines document colour, type, spacing and logo usage so the brand survives contact with everyone who uses it.",
      },
      {
        title: "Positioning first",
        body: "Brand strategy and positioning precede visual design, so the identity is arguing for something specific.",
      },
      {
        title: "Full file handover",
        body: "You receive source files and every export format you need for print, web and signage.",
      },
    ],
    packages: [
      {
        name: "Flyers",
        price: 10,
        per: null,
        includes: ["Single flyer design", "Print and social export formats"],
      },
      {
        name: "Company Profiles",
        price: 50,
        per: null,
        featured: true,
        includes: [
          "Full company profile design",
          "Layout and typesetting",
          "Print-ready and digital exports",
        ],
      },
      {
        name: "Logos",
        price: 50,
        per: null,
        includes: [
          "Logo design",
          "Source files",
          "Full export format set",
        ],
      },
    ],
    faqs: [
      {
        q: "How many logo concepts do we see?",
        a: "We present an initial set of directions, then refine the chosen route through revision rounds until it is signed off.",
      },
      {
        q: "Do we get the source files?",
        a: "Yes. You receive editable source files along with print, web and signage export formats.",
      },
      {
        q: "Can you apply our brand to vehicles and event materials?",
        a: "Yes — vehicle livery, gazebos, table cloths, roll-up banners and event collateral are all part of our applied identity work.",
      },
    ],
    related: ["digital-marketing", "photography-videography"],
  },
];

export const servicesBySlug = new Map(services.map((s) => [s.slug, s]));

export function getService(slug: string): Service | undefined {
  return servicesBySlug.get(slug);
}

export function getRelated(service: Service): Service[] {
  return service.related
    .map((slug) => servicesBySlug.get(slug))
    .filter((s): s is Service => Boolean(s));
}

export const featuredServices = services.filter((s) => s.featured);
