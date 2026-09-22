/**
 * Legal page content — requirements doc §19 footer links.
 *
 * These are plain-language starting drafts written to be genuinely useful,
 * not lorem ipsum. They are NOT legal advice and should be reviewed by a
 * qualified practitioner before the site goes live.
 */

import { brand } from "./brand";

export type LegalSection = { heading: string; paragraphs: string[] };

export type LegalPage = {
  slug: string;
  title: string;
  summary: string;
  updated: string;
  sections: LegalSection[];
};

export const legalPages: LegalPage[] = [
  {
    slug: "privacy",
    title: "Privacy Policy",
    summary:
      "How Prevsol Digital collects, uses, stores and protects personal information, and the rights you have over your own data.",
    updated: "1 August 2026",
    sections: [
      {
        heading: "Who we are",
        paragraphs: [
          `${brand.name} is a technology and digital transformation company registered in ${brand.country}, with offices at ${brand.address}, ${brand.city}. For the purposes of the Cyber and Data Protection Act [Chapter 12:07], we act as a data controller in respect of the personal information described in this policy.`,
          `You can reach our Data Protection Officer at ${brand.email} or on ${brand.phone}.`,
        ],
      },
      {
        heading: "What we collect",
        paragraphs: [
          "When you contact us, request a quote, place an order or open a support ticket, we collect the details you provide — typically your name, company, email address, telephone number and the content of your enquiry.",
          "When you hold services with us we also process billing information, service configuration details and support correspondence.",
          "Our website collects limited technical information such as pages visited and approximate location, used to keep the site secure and understand which content is useful.",
        ],
      },
      {
        heading: "Why we process it",
        paragraphs: [
          "To provide the services you have asked for, including provisioning, support and billing.",
          "To respond to enquiries and quote requests.",
          "To meet our own legal and regulatory obligations, including tax and records retention requirements.",
          "To send service notifications such as invoices, renewal reminders and security alerts. These are necessary to the service and are not marketing.",
          "Where we send marketing communications, we do so on the basis of your consent, and every message includes an unsubscribe link.",
        ],
      },
      {
        heading: "Who we share it with",
        paragraphs: [
          "We do not sell personal information. We share it only with processors who help us deliver our services — for example payment providers, domain registries and infrastructure providers — and only to the extent needed.",
          "Every processor we use is bound by a written agreement requiring them to protect the information and act only on our instructions.",
          "We may disclose information where we are legally required to do so, including to POTRAZ or to law enforcement acting under lawful authority.",
        ],
      },
      {
        heading: "How long we keep it",
        paragraphs: [
          "Enquiry and quote records are kept for two years from last contact.",
          "Client account, contract and billing records are kept for the life of the account plus seven years, in line with statutory records retention requirements.",
          "Support tickets are kept for three years. Backups are retained according to your hosting plan and are overwritten on a rolling basis.",
        ],
      },
      {
        heading: "How we protect it",
        paragraphs: [
          "We apply technical and organisational measures appropriate to the risk, including encryption in transit, access controls on a need-to-know basis, monitoring, and daily backups.",
          "Staff with access to personal information receive privacy awareness training and are bound by confidentiality obligations.",
        ],
      },
      {
        heading: "Your rights",
        paragraphs: [
          "You have the right to ask what personal information we hold about you, to have inaccurate information corrected, to ask for deletion where we have no continuing lawful basis to retain it, to object to processing in certain circumstances, and to withdraw consent where consent is the basis we rely on.",
          `To exercise any of these rights, contact ${brand.email}. We will respond within the statutory timeframe. If you are not satisfied with our response, you may complain to POTRAZ as the supervisory authority.`,
        ],
      },
      {
        heading: "Changes to this policy",
        paragraphs: [
          "We review this policy at least annually and whenever our processing changes materially. The date at the top of this page shows when it was last updated.",
        ],
      },
    ],
  },
  {
    slug: "cookies",
    title: "Cookie Policy",
    summary:
      "What cookies and similar technologies this website uses, and how to control them.",
    updated: "1 August 2026",
    sections: [
      {
        heading: "What cookies are",
        paragraphs: [
          "Cookies are small text files placed on your device when you visit a website. They let the site remember your actions and preferences between pages and visits.",
        ],
      },
      {
        heading: "Cookies we use",
        paragraphs: [
          "Strictly necessary — these keep you signed in to the client portal, remember the contents of your shopping cart, and protect against cross-site request forgery. The site cannot function without them.",
          "Preference — these remember choices such as your display preferences, so you do not have to set them on every visit.",
          "Analytics — these help us understand which pages are useful and where visitors get stuck. They are only set with your consent, and the data is aggregated.",
        ],
      },
      {
        heading: "Controlling cookies",
        paragraphs: [
          "You can delete or block cookies through your browser settings. Every major browser lets you do this, usually under Privacy or Security settings.",
          "Blocking strictly necessary cookies will prevent parts of the site from working — in particular the cart and the client portal.",
        ],
      },
    ],
  },
  {
    slug: "terms",
    title: "Terms of Service",
    summary:
      "The terms on which Prevsol Digital provides services, and what each party is responsible for.",
    updated: "1 August 2026",
    sections: [
      {
        heading: "Agreement",
        paragraphs: [
          `These terms apply to all services provided by ${brand.name}. By placing an order or using our services you accept them. Where a signed service agreement exists, that agreement takes precedence to the extent of any conflict.`,
        ],
      },
      {
        heading: "Services and scope",
        paragraphs: [
          "We provide the services set out in your order or proposal. Anything not expressly included is out of scope and quoted separately.",
          "For project work, we will agree a written scope before starting. Changes to that scope may affect cost and timeline, and we will tell you before proceeding.",
        ],
      },
      {
        heading: "Fees and payment",
        paragraphs: [
          "Recurring services are billed in advance on the cycle stated in your order. Invoices are issued 14 days before the due date.",
          "Services may be suspended 7 days after an invoice becomes overdue, and terminated 30 days after that. Reactivation may attract a fee.",
          "Prices are quoted in USD and are exclusive of VAT where applicable.",
        ],
      },
      {
        heading: "Your responsibilities",
        paragraphs: [
          "You are responsible for the accuracy of information you provide, for keeping your account credentials secure, and for the lawfulness of content you publish or data you process using our services.",
          "You must not use our services to send unsolicited bulk email, host unlawful material, or attempt to compromise the security of our infrastructure or that of others.",
        ],
      },
      {
        heading: "Availability",
        paragraphs: [
          "We target 99.9% monthly uptime on hosting services. This excludes scheduled maintenance, which we announce in advance wherever practicable, and circumstances beyond our reasonable control.",
        ],
      },
      {
        heading: "Intellectual property",
        paragraphs: [
          "On full payment, you own the deliverables we create specifically for you, including designs, content and source code, and we assign those rights to you.",
          "We retain ownership of our own pre-existing tools, frameworks and know-how, and grant you a licence to use them as embedded in your deliverables.",
        ],
      },
      {
        heading: "Liability",
        paragraphs: [
          "Nothing in these terms excludes liability that cannot lawfully be excluded.",
          "Subject to that, our total liability arising from the services is limited to the fees paid by you in the twelve months preceding the claim. We are not liable for indirect or consequential loss, including loss of profit or loss of data where you have not maintained your own backups.",
        ],
      },
      {
        heading: "Termination",
        paragraphs: [
          "Either party may terminate a recurring service with 30 days' written notice, effective at the end of the current billing period.",
          "On termination we will provide a full export of your data on request, and will retain it for 30 days before secure deletion.",
        ],
      },
      {
        heading: "Governing law",
        paragraphs: [
          `These terms are governed by the laws of ${brand.country}, and the courts of ${brand.country} have exclusive jurisdiction.`,
        ],
      },
    ],
  },
  {
    slug: "refunds",
    title: "Refund Policy",
    summary:
      "When refunds are available, how to request one, and which services are non-refundable.",
    updated: "1 August 2026",
    sections: [
      {
        heading: "Hosting services",
        paragraphs: [
          "New hosting accounts carry a 14-day money-back guarantee. If you are not satisfied within the first 14 days, tell us and we will refund the hosting fee in full.",
          "After 14 days, hosting fees are non-refundable, but you may cancel at any time to prevent further billing. Annual plans cancelled mid-term are not refunded pro rata.",
        ],
      },
      {
        heading: "Domain registrations",
        paragraphs: [
          "Domain registrations and renewals are non-refundable. Once submitted to the registry, the registration cannot be reversed and the fee cannot be recovered.",
          "If a registration fails for a technical reason on our side, we refund it in full.",
        ],
      },
      {
        heading: "Project work",
        paragraphs: [
          "Deposits on project work are non-refundable once we have begun, as they cover scoping and scheduling.",
          "If you cancel mid-project, you are liable for work completed to that point, and we will hand over everything produced.",
        ],
      },
      {
        heading: "Retainers and consultancy",
        paragraphs: [
          "Monthly retainers can be cancelled with 30 days' notice. The current month is not refunded, since the work is scheduled and resourced in advance.",
        ],
      },
      {
        heading: "How to request a refund",
        paragraphs: [
          `Open a Billing Support ticket or email ${brand.email} with your invoice number and the reason for the request. We respond within two business days, and approved refunds are processed within seven business days by the original payment method.`,
        ],
      },
    ],
  },
  {
    slug: "data-protection-notice",
    title: "Data Protection Notice",
    summary:
      "Our commitments under the Cyber and Data Protection Act [Chapter 12:07] and how we handle personal information on behalf of clients.",
    updated: "1 August 2026",
    sections: [
      {
        heading: "Our regulatory position",
        paragraphs: [
          `${brand.name} processes personal information both as a data controller, in respect of our own clients and enquiries, and as a data processor, where we host or manage systems on behalf of client organisations.`,
          "We have appointed a Data Protection Officer, maintain Records of Processing Activities, and operate a documented breach response procedure.",
        ],
      },
      {
        heading: "When we act as your processor",
        paragraphs: [
          "Where we host your website, manage your systems or provide DPO services, you remain the data controller for the personal information involved, and we act on your documented instructions.",
          "Our standard Data Processing Agreement sets out the subject matter, duration, nature and purpose of processing, the categories of data and data subjects, and the security measures we apply. It is available on request and forms part of your service agreement.",
        ],
      },
      {
        heading: "Security measures",
        paragraphs: [
          "Encryption in transit for all services, and at rest where the service supports it.",
          "Role-based access control, with access granted on a need-to-know basis and reviewed periodically.",
          "Daily backups with tested restore procedures.",
          "Monitoring and logging, with alerting on anomalous activity.",
          "Privacy awareness training for all staff with access to personal information.",
        ],
      },
      {
        heading: "Breach notification",
        paragraphs: [
          "If we become aware of a personal data breach affecting information we process on your behalf, we will notify you without undue delay, with the information you need to meet your own notification obligations.",
          "Where we are the controller, we will notify the supervisory authority and affected individuals as required by the Act.",
        ],
      },
      {
        heading: "Sub-processors",
        paragraphs: [
          "We use a limited number of sub-processors for infrastructure, payment processing and domain registration. A current list is available on request, and we will give you notice of any intended change so you can object.",
        ],
      },
      {
        heading: "Contact",
        paragraphs: [
          `Data protection queries should be directed to our Data Protection Officer at ${brand.email} or ${brand.phone}. You also have the right to complain to POTRAZ as the supervisory authority.`,
        ],
      },
    ],
  },
];

export const legalBySlug = new Map(legalPages.map((p) => [p.slug, p]));
