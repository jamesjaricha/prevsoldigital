/**
 * Domain availability engine — requirements doc §7.
 *
 * There is no registry connection here. Availability is derived
 * deterministically from the name itself, so the same query always returns the
 * same answer and the demo behaves consistently. A real implementation would
 * replace `checkAvailability` with an EPP or registrar API call and leave the
 * rest of this module untouched.
 */

import { tlds, type Tld } from "@/content/hosting";

export type DomainResult = {
  name: string;
  ext: string;
  fqdn: string;
  available: boolean;
  register: number;
  renew: number;
  popular: boolean;
  /** Set when the domain is taken and we know roughly why. */
  reason?: string;
};

/** Names that are always taken, so the "unavailable" state is easy to demo. */
const RESERVED = new Set([
  "google",
  "facebook",
  "amazon",
  "microsoft",
  "apple",
  "prevsol",
  "prevsoldigital",
  "econet",
  "zimbabwe",
  "netone",
  "telecel",
  "potraz",
  "shop",
  "mail",
  "test",
  "admin",
  "web",
  "app",
]);

/** Stable string hash, so availability never flickers between renders. */
function hash(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function normaliseQuery(raw: string): { name: string; ext?: string } {
  const cleaned = raw
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/.*$/, "");

  // Match a known multi-part or single-part extension at the end.
  const known = tlds
    .map((t) => t.ext)
    .sort((a, b) => b.length - a.length)
    .find((ext) => cleaned.endsWith(ext));

  if (known) {
    return { name: cleaned.slice(0, -known.length), ext: known };
  }
  return { name: cleaned.replace(/[^a-z0-9-]/g, "") };
}

function checkAvailability(name: string, ext: string): boolean {
  if (!name) return false;
  if (RESERVED.has(name)) return false;
  // Very short names are essentially all registered.
  if (name.length <= 3) return false;
  // Deterministic pseudo-random: ~62% of plausible names come back available.
  return hash(`${name}${ext}`) % 100 >= 38;
}

function toResult(name: string, tld: Tld): DomainResult {
  const available = checkAvailability(name, tld.ext);
  return {
    name,
    ext: tld.ext,
    fqdn: `${name}${tld.ext}`,
    available,
    register: tld.register,
    renew: tld.renew,
    popular: Boolean(tld.popular),
    reason: available
      ? undefined
      : RESERVED.has(name)
        ? "This name is reserved or already registered."
        : name.length <= 3
          ? "Short names are rarely available."
          : "Already registered.",
  };
}

export type DomainSearch = {
  query: string;
  name: string;
  /** The exact match the user asked for, when they typed an extension. */
  exact?: DomainResult;
  /** Everything else we can offer on the same name. */
  alternatives: DomainResult[];
  /** Suggested variations, shown when the exact match is taken. */
  suggestions: DomainResult[];
};

const SUGGESTION_PREFIXES = ["get", "my", "the"];
const SUGGESTION_SUFFIXES = ["hq", "online", "group", "zw"];

export function searchDomains(raw: string): DomainSearch | null {
  const { name, ext } = normaliseQuery(raw);
  if (!name) return null;

  const requestedTld = ext ? tlds.find((t) => t.ext === ext) : undefined;
  const exact = requestedTld ? toResult(name, requestedTld) : undefined;

  const alternatives = tlds
    .filter((t) => t.ext !== requestedTld?.ext)
    .map((t) => toResult(name, t))
    // Available ones first, then popular extensions, then cheapest.
    .sort((a, b) => {
      if (a.available !== b.available) return a.available ? -1 : 1;
      if (a.popular !== b.popular) return a.popular ? -1 : 1;
      return a.register - b.register;
    });

  // Only bother suggesting variations when the exact match is gone.
  const suggestions: DomainResult[] =
    exact && !exact.available
      ? [
          ...SUGGESTION_PREFIXES.map((p) => `${p}${name}`),
          ...SUGGESTION_SUFFIXES.map((s) => `${name}${s}`),
        ]
          .map((variant) => toResult(variant, requestedTld!))
          .filter((r) => r.available)
          .slice(0, 4)
      : [];

  return { query: raw.trim(), name, exact, alternatives, suggestions };
}
