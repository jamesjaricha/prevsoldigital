/**
 * Knowledge base — requirements doc §13.
 * Ten categories, each with searchable articles.
 */

export type Article = {
  slug: string;
  title: string;
  category: KbCategorySlug;
  excerpt: string;
  /** Simple paragraph/heading/list blocks, rendered by the article page. */
  body: Block[];
  updated: string;
  minutes: number;
};

export type Block =
  | { kind: "p"; text: string }
  | { kind: "h"; text: string }
  | { kind: "ul"; items: string[] }
  | { kind: "ol"; items: string[] }
  | { kind: "note"; text: string };

export type KbCategorySlug =
  | "domains"
  | "hosting"
  | "email-setup"
  | "website-management"
  | "billing"
  | "payments"
  | "account-management"
  | "cybersecurity"
  | "data-protection"
  | "troubleshooting";

export const kbCategories: {
  slug: KbCategorySlug;
  name: string;
  blurb: string;
  icon: string;
}[] = [
  {
    slug: "domains",
    name: "Domains",
    blurb: "Registration, transfers, DNS and renewals.",
    icon: "globe",
  },
  {
    slug: "hosting",
    name: "Hosting",
    blurb: "Plans, cPanel, migrations and resource limits.",
    icon: "server",
  },
  {
    slug: "email-setup",
    name: "Email Setup",
    blurb: "Mailbox creation, clients, mobile and spam.",
    icon: "mail",
  },
  {
    slug: "website-management",
    name: "Website Management",
    blurb: "Content updates, backups, SSL and staging.",
    icon: "layout",
  },
  {
    slug: "billing",
    name: "Billing",
    blurb: "Invoices, billing cycles, upgrades and credits.",
    icon: "receipt",
  },
  {
    slug: "payments",
    name: "Payments",
    blurb: "Payment methods, confirmations and receipts.",
    icon: "card",
  },
  {
    slug: "account-management",
    name: "Account Management",
    blurb: "Profile, contacts, access and closing accounts.",
    icon: "user",
  },
  {
    slug: "cybersecurity",
    name: "Cybersecurity",
    blurb: "Passwords, 2FA, malware and incident response.",
    icon: "shield",
  },
  {
    slug: "data-protection",
    name: "Data Protection",
    blurb: "POTRAZ, DPIAs, ROPA and compliance obligations.",
    icon: "lock",
  },
  {
    slug: "troubleshooting",
    name: "Troubleshooting",
    blurb: "Site down, slow loading, errors and DNS issues.",
    icon: "wrench",
  },
];

export const articles: Article[] = [
  {
    slug: "how-to-register-a-domain",
    title: "How to register a domain name",
    category: "domains",
    excerpt:
      "Search for an available name, choose an extension and complete registration through the client portal.",
    updated: "4 August 2026",
    minutes: 3,
    body: [
      {
        kind: "p",
        text: "Registering a domain through Prevsol Digital takes a few minutes. The domain is registered in your organisation's name, so you remain the legal registrant.",
      },
      { kind: "h", text: "Steps" },
      {
        kind: "ol",
        items: [
          "Go to the Domains page and enter the name you want in the search box.",
          "Review the results. Available names show a green Available badge with registration and renewal pricing.",
          "Click Add to Cart on the extension you want, or Buy Now to go straight to checkout.",
          "Complete checkout. Registration is usually live within fifteen minutes for most extensions.",
        ],
      },
      {
        kind: "note",
        text: "Renewal pricing can differ from first-year registration pricing. Both figures are shown in the search results before you buy.",
      },
    ],
  },
  {
    slug: "transfer-a-domain-to-prevsol",
    title: "Transferring a domain to Prevsol Digital",
    category: "domains",
    excerpt:
      "Unlock the domain at your current registrar, obtain the auth code and start the transfer from your portal.",
    updated: "28 July 2026",
    minutes: 4,
    body: [
      {
        kind: "p",
        text: "Transfers keep your existing registration period and add a year in most cases. Your website and email keep working throughout if DNS is left unchanged.",
      },
      { kind: "h", text: "Before you start" },
      {
        kind: "ul",
        items: [
          "The domain must be at least 60 days old.",
          "It must not have been transferred in the last 60 days.",
          "Domain lock must be disabled at your current registrar.",
          "You need the authorisation (EPP) code from your current registrar.",
        ],
      },
      { kind: "h", text: "Starting the transfer" },
      {
        kind: "ol",
        items: [
          "Open a ticket with the domain name and your auth code, or use the transfer option at checkout.",
          "Approve the confirmation email sent to the registrant address on the domain.",
          "Transfers typically complete within five to seven days.",
        ],
      },
    ],
  },
  {
    slug: "point-your-domain-to-our-hosting",
    title: "Pointing your domain at our hosting",
    category: "domains",
    excerpt: "Update your nameservers or A record to bring an external domain onto our servers.",
    updated: "12 July 2026",
    minutes: 3,
    body: [
      {
        kind: "p",
        text: "If your domain is registered elsewhere but hosted with us, you need to point it at our servers. There are two ways to do this.",
      },
      { kind: "h", text: "Option 1 — Nameservers (recommended)" },
      {
        kind: "p",
        text: "Set your domain's nameservers to the pair shown in your hosting welcome email. This hands full DNS management to us, which makes future changes simpler.",
      },
      { kind: "h", text: "Option 2 — A record" },
      {
        kind: "p",
        text: "Keep DNS where it is and point the A record for @ and www at the server IP in your welcome email. Use this when other services depend on your existing DNS.",
      },
      {
        kind: "note",
        text: "DNS changes can take up to 24 hours to propagate globally, though most complete within an hour.",
      },
    ],
  },
  {
    slug: "choosing-a-hosting-plan",
    title: "Choosing the right hosting plan",
    category: "hosting",
    excerpt:
      "How Starter, Business and Professional differ, and which one fits your traffic and storage needs.",
    updated: "1 August 2026",
    minutes: 4,
    body: [
      {
        kind: "p",
        text: "Most clients start on Starter or Business and upgrade as traffic grows. Upgrades are prorated and applied the same day, so starting smaller costs you nothing.",
      },
      { kind: "h", text: "Starter" },
      {
        kind: "p",
        text: "Best for brochure sites, portfolios and first business websites. 10 GB SSD, 100 GB monthly bandwidth and five mailboxes.",
      },
      { kind: "h", text: "Business" },
      {
        kind: "p",
        text: "Our most popular plan, and the right default for a live company website. 50 GB SSD, unmetered bandwidth, 25 mailboxes, staging environment and a free domain for the first year.",
      },
      { kind: "h", text: "Professional" },
      {
        kind: "p",
        text: "For e-commerce, portals and business-critical applications. 150 GB NVMe, dedicated resources, wildcard SSL and 24/7 escalation with a named account manager.",
      },
    ],
  },
  {
    slug: "migrating-your-website-to-us",
    title: "Migrating an existing website to Prevsol",
    category: "hosting",
    excerpt: "We handle files, databases and mailboxes, test on staging, then switch DNS when you choose.",
    updated: "22 July 2026",
    minutes: 4,
    body: [
      {
        kind: "p",
        text: "Migration is free on annual plans. We do the work; you choose the cutover window.",
      },
      { kind: "h", text: "What we need from you" },
      {
        kind: "ul",
        items: [
          "cPanel or FTP access to your current host, or a full backup archive.",
          "Database credentials, if they are not included in the backup.",
          "A list of mailboxes to move, with their passwords or permission to reset them.",
          "Access to your DNS, or the ability to change nameservers.",
        ],
      },
      { kind: "h", text: "How it runs" },
      {
        kind: "ol",
        items: [
          "We copy files, databases and mailboxes to our servers.",
          "We test the site on a staging URL and send it to you to confirm.",
          "Once you approve, we schedule the DNS switch outside your business hours.",
          "We monitor for 48 hours afterwards and keep the old copy for 30 days.",
        ],
      },
    ],
  },
  {
    slug: "setting-up-email-on-your-phone",
    title: "Setting up your email on a phone or desktop client",
    category: "email-setup",
    excerpt: "IMAP and SMTP settings for Outlook, Apple Mail, Gmail and mobile devices.",
    updated: "9 August 2026",
    minutes: 3,
    body: [
      {
        kind: "p",
        text: "Use IMAP so your mail stays synchronised across every device. POP3 downloads and removes mail from the server and is rarely the right choice.",
      },
      { kind: "h", text: "Incoming mail (IMAP)" },
      {
        kind: "ul",
        items: [
          "Server: mail.yourdomain.com",
          "Port: 993",
          "Encryption: SSL/TLS",
          "Username: your full email address",
        ],
      },
      { kind: "h", text: "Outgoing mail (SMTP)" },
      {
        kind: "ul",
        items: [
          "Server: mail.yourdomain.com",
          "Port: 465",
          "Encryption: SSL/TLS",
          "Authentication: required, same username and password",
        ],
      },
      {
        kind: "note",
        text: "If your device rejects the certificate, confirm you are using mail.yourdomain.com rather than the bare domain.",
      },
    ],
  },
  {
    slug: "reduce-spam-in-your-inbox",
    title: "Reducing spam reaching your inbox",
    category: "email-setup",
    excerpt: "Filtering, SPF and DKIM records, and what to do when legitimate mail is being blocked.",
    updated: "18 July 2026",
    minutes: 4,
    body: [
      {
        kind: "p",
        text: "Every mailbox on our servers is filtered by default. Tuning SPF, DKIM and DMARC records improves both what reaches you and whether your own mail gets delivered.",
      },
      { kind: "h", text: "Authentication records" },
      {
        kind: "ul",
        items: [
          "SPF declares which servers may send mail for your domain.",
          "DKIM cryptographically signs your outgoing mail.",
          "DMARC tells receiving servers what to do when SPF or DKIM fails.",
        ],
      },
      {
        kind: "p",
        text: "We configure all three when we set up your hosting. If you send mail through a third-party platform such as a newsletter tool, open a ticket so we can add it to your SPF record.",
      },
    ],
  },
  {
    slug: "requesting-website-content-updates",
    title: "Requesting website content updates",
    category: "website-management",
    excerpt: "How to submit changes, what turnaround to expect and what is covered by maintenance.",
    updated: "5 August 2026",
    minutes: 2,
    body: [
      {
        kind: "p",
        text: "Clients on a website maintenance plan can submit content changes through the support centre. Most text and image updates are completed within one working day.",
      },
      {
        kind: "ul",
        items: [
          "Submit changes as a ticket under Technical Support.",
          "Include the page URL and the exact copy or image you want used.",
          "Structural or design changes are quoted separately.",
        ],
      },
    ],
  },
  {
    slug: "restoring-a-backup",
    title: "Restoring your website from a backup",
    category: "website-management",
    excerpt: "Every account is backed up daily. Restores are free and usually complete within an hour.",
    updated: "30 July 2026",
    minutes: 3,
    body: [
      {
        kind: "p",
        text: "We back up every hosting account daily and retain them according to your plan — 7 days on Starter, 30 on Business and 60 on Professional.",
      },
      { kind: "h", text: "Requesting a restore" },
      {
        kind: "ol",
        items: [
          "Open a ticket under Technical Support marked High priority.",
          "Tell us the date you want restored, and whether you need files, the database, or both.",
          "Confirm whether we should overwrite the live site or restore to a staging copy for review.",
        ],
      },
      {
        kind: "note",
        text: "Restoring over a live site is irreversible. If you are unsure, ask us to restore to staging first.",
      },
    ],
  },
  {
    slug: "understanding-your-invoice",
    title: "Understanding your invoice",
    category: "billing",
    excerpt: "How billing cycles, prorating and due dates work on your account.",
    updated: "2 August 2026",
    minutes: 3,
    body: [
      {
        kind: "p",
        text: "Invoices are generated 14 days before the due date and are visible in the portal under Invoices as soon as they are issued.",
      },
      { kind: "h", text: "Invoice statuses" },
      {
        kind: "ul",
        items: [
          "Unpaid — issued and awaiting payment before the due date.",
          "Overdue — the due date has passed. Services are suspended 7 days after this point.",
          "Paid — payment received and applied.",
          "Cancelled — the invoice was voided and nothing is owed.",
        ],
      },
    ],
  },
  {
    slug: "upgrading-or-downgrading-a-service",
    title: "Upgrading or downgrading a service",
    category: "billing",
    excerpt: "Upgrades apply immediately and are prorated. Downgrades take effect at the next renewal.",
    updated: "26 July 2026",
    minutes: 2,
    body: [
      {
        kind: "p",
        text: "Upgrades are applied the same day and prorated against your current billing period, so you only pay the difference for the remaining days.",
      },
      {
        kind: "p",
        text: "Downgrades take effect at your next renewal date rather than immediately, since the resources are already provisioned for the current period.",
      },
    ],
  },
  {
    slug: "payment-methods-we-accept",
    title: "Payment methods we accept",
    category: "payments",
    excerpt: "EcoCash, bank transfer, card and cash payments, with confirmation times for each.",
    updated: "11 August 2026",
    minutes: 2,
    body: [
      { kind: "h", text: "Accepted methods" },
      {
        kind: "ul",
        items: [
          "EcoCash — confirmation usually within an hour.",
          "Bank transfer — one to two business days to reflect.",
          "Card payment — immediate confirmation.",
          "Cash at our Eastlea offices during business hours.",
        ],
      },
      {
        kind: "note",
        text: "If a payment has not reflected within the window above, open a Billing Support ticket with your reference number and we will reconcile it manually.",
      },
    ],
  },
  {
    slug: "why-hasnt-my-payment-reflected",
    title: "Why hasn't my payment reflected?",
    category: "payments",
    excerpt: "Common reasons for a delayed confirmation and how to get it resolved quickly.",
    updated: "1 July 2026",
    minutes: 2,
    body: [
      {
        kind: "p",
        text: "Mobile money and bank payments are reconciled automatically, but a mismatch in the reference number can leave a payment unallocated.",
      },
      {
        kind: "ul",
        items: [
          "Check you used the invoice number as the payment reference.",
          "Confirm the amount matches the invoice total exactly.",
          "Allow the confirmation window for your payment method to pass.",
        ],
      },
      {
        kind: "p",
        text: "If it still has not reflected, open a Billing Support ticket with the transaction reference and a screenshot of the confirmation, and we will apply it manually.",
      },
    ],
  },
  {
    slug: "updating-your-account-details",
    title: "Updating your account and contact details",
    category: "account-management",
    excerpt: "Change your profile, billing contact and notification preferences in the portal.",
    updated: "20 July 2026",
    minutes: 2,
    body: [
      {
        kind: "p",
        text: "Your profile is editable from Portal → Profile. Billing contacts receive invoices and payment reminders, and can differ from the main account holder.",
      },
      {
        kind: "note",
        text: "Changing the registrant details on a domain is a separate process governed by registry rules. Open a ticket and we will guide you through it.",
      },
    ],
  },
  {
    slug: "enabling-two-factor-authentication",
    title: "Enabling two-factor authentication",
    category: "cybersecurity",
    excerpt: "Add an authenticator app to your account so a stolen password isn't enough to sign in.",
    updated: "14 August 2026",
    minutes: 3,
    body: [
      {
        kind: "p",
        text: "Two-factor authentication is the single most effective control you can enable on your account. We strongly recommend it for every user with billing or hosting access.",
      },
      {
        kind: "ol",
        items: [
          "Go to Portal → Security.",
          "Choose Enable two-factor authentication.",
          "Scan the QR code with an authenticator app such as Google Authenticator or Authy.",
          "Enter the six-digit code to confirm, then store your recovery codes somewhere safe.",
        ],
      },
      {
        kind: "note",
        text: "Recovery codes are shown once. If you lose both your device and your codes, restoring access requires identity verification and can take several days.",
      },
    ],
  },
  {
    slug: "what-to-do-if-your-site-is-hacked",
    title: "What to do if your website is compromised",
    category: "cybersecurity",
    excerpt: "Immediate containment steps, how we clean an infected site, and preventing recurrence.",
    updated: "7 August 2026",
    minutes: 5,
    body: [
      {
        kind: "p",
        text: "Act quickly but do not delete anything before we have looked at it — the logs and the modified files are what tell us how the attacker got in.",
      },
      { kind: "h", text: "Immediately" },
      {
        kind: "ol",
        items: [
          "Open a High priority Technical Support ticket so we can take the site offline behind a maintenance page.",
          "Change your portal, cPanel, CMS and database passwords.",
          "Do not restore an old backup yet — it may contain the same vulnerability.",
        ],
      },
      { kind: "h", text: "What we do" },
      {
        kind: "ul",
        items: [
          "Scan and identify the malicious files and the entry point.",
          "Clean the infection and patch the vulnerability.",
          "Review logs to determine what, if anything, was accessed.",
          "Advise you on whether the incident is notifiable under the Cyber and Data Protection Act.",
        ],
      },
      {
        kind: "note",
        text: "If personal information may have been accessed, there are breach notification obligations under the Act. Our data protection team will advise on the timeline and reporting requirements.",
      },
    ],
  },
  {
    slug: "potraz-inspection-readiness",
    title: "Preparing for a POTRAZ inspection",
    category: "data-protection",
    excerpt:
      "Inspections begin 1 September 2026. Here is what an inspector expects to see and how to prepare.",
    updated: "16 August 2026",
    minutes: 6,
    body: [
      {
        kind: "p",
        text: "From 1 September 2026, POTRAZ commences mandatory risk-based inspections of organisations processing personal information. Organisations that are not adequately prepared may face regulatory enforcement, financial penalties, reputational damage and operational disruption.",
      },
      {
        kind: "note",
        text: "The separate Data Controller Licence deadline passed on 12 March 2025. If your organisation has not licensed, that is the first thing to address.",
      },
      { kind: "h", text: "What inspectors look for" },
      {
        kind: "ul",
        items: [
          "A valid Data Controller Licence.",
          "An appointed Data Protection Officer with defined responsibilities.",
          "Records of Processing Activities (ROPA) that are current and complete.",
          "Data protection policies, procedures and published privacy notices.",
          "Evidence of Data Protection Impact Assessments for high-risk processing.",
          "A documented data breach response plan, and records of any incidents.",
          "Evidence of staff privacy awareness training.",
          "Contracts with processors containing the required data protection clauses.",
        ],
      },
      { kind: "h", text: "How to prepare" },
      {
        kind: "ol",
        items: [
          "Commission a readiness review to establish where you actually stand.",
          "Close the licensing gap if you are not yet licensed.",
          "Appoint a DPO, internally or through an outsourced service.",
          "Build or refresh your ROPA and supporting documentation.",
          "Run training so staff can answer questions about their own obligations.",
          "Rehearse your breach response so the plan is more than a document.",
        ],
      },
    ],
  },
  {
    slug: "what-is-a-dpia",
    title: "What is a Data Protection Impact Assessment?",
    category: "data-protection",
    excerpt: "When a DPIA is required, what it contains, and who signs it off.",
    updated: "3 August 2026",
    minutes: 4,
    body: [
      {
        kind: "p",
        text: "A Data Protection Impact Assessment is a structured review of a processing activity that is likely to result in high risk to the people whose data is involved. It is carried out before the processing begins.",
      },
      { kind: "h", text: "When you need one" },
      {
        kind: "ul",
        items: [
          "Large-scale processing of sensitive data such as health records.",
          "Systematic monitoring of a publicly accessible area, including CCTV.",
          "Automated decision-making with a significant effect on individuals.",
          "Combining datasets from separate sources in a way people would not expect.",
        ],
      },
      { kind: "h", text: "What it contains" },
      {
        kind: "ol",
        items: [
          "A description of the processing and its purpose.",
          "An assessment of necessity and proportionality.",
          "An assessment of the risks to individuals.",
          "The measures you will take to reduce those risks.",
        ],
      },
    ],
  },
  {
    slug: "my-website-is-down",
    title: "My website is down — what should I check?",
    category: "troubleshooting",
    excerpt: "Quick checks to identify whether the problem is DNS, the server, SSL or your own connection.",
    updated: "13 August 2026",
    minutes: 4,
    body: [
      { kind: "h", text: "Check these first" },
      {
        kind: "ol",
        items: [
          "Try the site on mobile data rather than your office connection, to rule out a local network or DNS cache issue.",
          "Check whether your domain has expired — an expired domain takes the site offline immediately.",
          "Check whether an invoice is overdue, since services are suspended 7 days past the due date.",
          "Look at the error itself: a certificate warning is an SSL issue, a 500 error is application-side, and a timeout usually points at the server.",
        ],
      },
      {
        kind: "p",
        text: "If none of these explain it, open a High priority Technical Support ticket with the exact error message and a screenshot, and we will investigate immediately.",
      },
    ],
  },
  {
    slug: "website-loading-slowly",
    title: "Why is my website loading slowly?",
    category: "troubleshooting",
    excerpt: "The usual causes — oversized images, too many plugins, and outgrowing your plan.",
    updated: "24 July 2026",
    minutes: 4,
    body: [
      { kind: "h", text: "Most common causes" },
      {
        kind: "ul",
        items: [
          "Uncompressed images uploaded straight from a camera or phone.",
          "Too many plugins, or one badly written plugin blocking page render.",
          "No caching layer configured.",
          "Genuine traffic growth beyond what your current plan provides.",
        ],
      },
      {
        kind: "p",
        text: "Open a ticket and we will run a performance audit on your site. If the fix is a plan upgrade we will tell you, and if it is not, we will tell you that too.",
      },
    ],
  },
];

export const articlesBySlug = new Map(articles.map((a) => [a.slug, a]));

export function getArticle(slug: string) {
  return articlesBySlug.get(slug);
}

export function articlesIn(category: KbCategorySlug) {
  return articles.filter((a) => a.category === category);
}

export function categoryBySlug(slug: KbCategorySlug) {
  return kbCategories.find((c) => c.slug === slug);
}

/** Naive scoring search across titles, excerpts and body text. */
export function searchArticles(query: string): Article[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const terms = q.split(/\s+/).filter(Boolean);

  return articles
    .map((article) => {
      const haystack = [
        article.title,
        article.excerpt,
        ...article.body.flatMap((b) =>
          b.kind === "ul" || b.kind === "ol" ? b.items : [b.text],
        ),
      ]
        .join(" ")
        .toLowerCase();

      let score = 0;
      for (const term of terms) {
        if (article.title.toLowerCase().includes(term)) score += 10;
        if (article.excerpt.toLowerCase().includes(term)) score += 4;
        if (haystack.includes(term)) score += 1;
      }
      return { article, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((r) => r.article);
}
