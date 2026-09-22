/**
 * Brand constants — sourced from Prevsol Digital Company Profile.pdf
 * and the iTech Solutions Pricing Table.pdf footers.
 */

export const brand = {
  name: "Prevsol Digital",
  tagline: "Technology. Innovation. Digitalization.",
  domain: "prevsoldigital.com",
  url: "https://prevsoldigital.com",
  email: "sales@prevsoldigital.com",
  phone: "+263 78 640 6989",
  phoneHref: "tel:+263786406989",
  whatsapp: "263786406989",
  address: "11 Armagh Avenue, Eastlea",
  city: "Harare",
  country: "Zimbabwe",
  hours: "Monday – Friday, 08:00 – 17:00 CAT",
} as const;

/** Hero headline from the requirements doc §4. */
export const heroCopy = {
  headline: "Powering Businesses Through Technology, Security & Compliance.",
  supporting:
    "Prevsol Digital delivers ICT solutions, digital transformation and data protection consultancy that help organisations across Africa operate securely, efficiently and in full regulatory compliance.",
} as const;

/** Company Profile.pdf p.2 */
export const vision =
  "To become Africa's leading technology solutions provider, empowering businesses through innovative digital solutions that drive growth, efficiency, and competitive advantage.";

export const mission =
  "To deliver innovative, secure, and cost-effective technology solutions that enable organizations to embrace digital transformation, improve operational performance, protect valuable information, and create exceptional customer experiences.";

export const values = [
  {
    name: "Innovation",
    body: "We embrace emerging technologies and continuously seek smarter ways to solve business challenges.",
  },
  {
    name: "Integrity",
    body: "We conduct business with honesty, professionalism, transparency, and accountability.",
  },
  {
    name: "Excellence",
    body: "We are committed to delivering solutions that exceed client expectations in quality, performance, and reliability.",
  },
  {
    name: "Customer Success",
    body: "Our clients' success is our success.",
  },
  {
    name: "Security",
    body: "We prioritize the confidentiality, integrity, and availability of clients' information.",
  },
  {
    name: "Continuous Improvement",
    body: "We invest in continuous learning and improvement.",
  },
] as const;

/** Company Profile.pdf p.11 */
export const whyChooseUs = [
  "Experienced professionals",
  "Client-centered approach",
  "Innovative solutions",
  "Affordable and scalable services",
  "End-to-end project delivery",
  "Strong cybersecurity focus",
  "Reliable support",
  "Quality assurance",
  "Modern technologies",
  "Long-term partnerships",
] as const;

/** Company Profile.pdf p.12 */
export const industries = [
  "Education",
  "Healthcare",
  "Financial Services",
  "Retail & E-commerce",
  "Manufacturing",
  "Agriculture",
  "Tourism & Hospitality",
  "Real Estate",
  "Government",
  "NGOs",
  "Professional Services",
  "Startups and SMEs",
] as const;

/** DPO.pdf p.2 — real client logos referenced as social proof. */
export const clients = [
  "Redeemed Group of Schools",
  "Silver Lining Medical Center",
  "Joyful Heart Pharmacy",
  "Golden Knot Microinsurance",
  "Institute of Technical Training",
  "Feltach Contracting",
  "K-Track",
  "Unitrack24",
] as const;

/** DPO.pdf p.1 — the POTRAZ compliance campaign. */
export const potraz = {
  inspectionsBegin: "1 September 2026",
  licenceDeadlinePassed: "12 March 2025",
  act: "Cyber and Data Protection Act [Chapter 12:07]",
  regulator: "POTRAZ",
  officer: "Prevalence Nyadzayo",
  officerTitle: "Data Protection Officer",
} as const;
