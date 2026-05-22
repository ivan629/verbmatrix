/**
 * Centralised brand + product configuration.
 *
 * Every user-visible string, localStorage key, price, and feature flag
 * lives here so a rebrand or pricing change is a one-file edit.
 *
 * The product name is intentionally a placeholder ("VerbMatrix") until
 * a final name is chosen and a domain is secured. Swap it here and the
 * entire app updates — landing page, sidebar, meta tags, OG image alt
 * text, legal footer, everything.
 */

// ─── Brand ──────────────────────────────────────────────────────

export const BRAND = {
  /** Primary product name. */
  name: "VerbMatrix",
  /** Tagline shown in the sidebar next to the name. */
  suffix: "study",
  /** One-liner for meta / OG. */
  tagline: "Learn any language with one system.",
  /** Longer pitch for the landing page hero. */
  pitch:
    "Three tenses. Three forms. Nine sentence types. Master the verb matrix and speak any language with confidence.",
  /** Contact email shown in legal pages. */
  contactEmail: "hello@verbmatrix.com",
  /** Full domain (no protocol). */
  domain: "verbmatrix.com",
  /** Year the product launched — used in the copyright line. */
  launchYear: 2025,
} as const;

// ─── Storage Keys ───────────────────────────────────────────────
// Prefixed with the brand so they don't collide with anything else
// in the user's localStorage.

const PREFIX = "vm";

export const STORAGE_KEYS = {
  /** Which learning language is active (e.g. "ro"). */
  activeLang: `${PREFIX}:lang`,
  /** Light / dark / system preference. */
  theme: `${PREFIX}:theme`,
  /** Per-language onboarding seen flag. Value: "1". Key is suffixed with
   *  the language code at runtime: `vm:onboarded:ro`. */
  onboardedPrefix: `${PREFIX}:onboarded:`,
  /** Translation cache (MyMemory). */
  translationCache: `${PREFIX}:tx:v1`,
  /** License keys — JSON object mapping language code → key string.
   *  e.g. `{ "ro": "XXXX-XXXX-XXXX", "all": "YYYY-YYYY-YYYY" }` */
  licenses: `${PREFIX}:licenses`,
  /** Per-lesson completion. Suffixed with `<lang>:<lessonId>` at runtime:
   *  e.g. `vm:completed:ro:L3 = "1"`. Absence means not completed. */
  completedPrefix: `${PREFIX}:completed:`,
  /** Last-viewed lesson id, per language: `vm:last-pos:ro = "L7"`. Used to
   *  restore the user's reading position when they return. */
  lastPositionPrefix: `${PREFIX}:last-pos:`,
  /** Focus mode preference (global, not per-language): "1" or absent. */
  focusMode: `${PREFIX}:focus-mode`,
} as const;

// ─── Pricing ────────────────────────────────────────────────────

export interface LanguagePricing {
  /** ISO language code matching the LanguageModule code. */
  code: string;
  /** Display price in USD. */
  price: number;
  /** Price formatted for display. */
  priceFormatted: string;
  /** LemonSqueezy checkout URL (or product URL). Set to "" until configured. */
  checkoutUrl: string;
  /** LemonSqueezy product/variant ID for license validation. */
  productId: string;
}

export const PRICING: Record<string, LanguagePricing> = {
  ro: {
    code: "ro",
    price: 14.99,
    priceFormatted: "$14.99",
    checkoutUrl: "",
    productId: "",
  },
  // es and ja will be added here when those modules are built.
  all: {
    code: "all",
    price: 99.99,
    priceFormatted: "$99.99",
    checkoutUrl: "",
    productId: "",
  },
};

/** Return pricing for a language code, falling back to the "all" bundle. */
export function getPricing(code: string): LanguagePricing {
  return PRICING[code] ?? PRICING.all;
}

// ─── Free Content Boundary ──────────────────────────────────────
// Lesson IDs that are visible without a license. Everything else is gated.

export const FREE_LESSON_IDS: ReadonlySet<string> = new Set([
  "matrix",   // Practice Matrix — the core demo
  "rules",    // Seven core principles
  "L0",       // Mindset
  "L1",       // Pronunciation (shown in full for now — it's a good hook)
]);

/** Check whether a lesson id is free (no license needed). */
export function isFreeLessonId(id: string): boolean {
  return FREE_LESSON_IDS.has(id);
}

// ─── Feature Flags ──────────────────────────────────────────────

export const FLAGS = {
  /**
   * When true, the paywall is enforced.
   *
   * Set VITE_DISABLE_PAYWALL=true in your .env.local to bypass it locally
   * without touching this file — useful for reviewing all lessons during dev.
   *
   * Never set this in production .env — Vite bakes env vars at build time,
   * so a production build with VITE_DISABLE_PAYWALL=true would ship with
   * the paywall disabled for every visitor.
   *
   * Usage:
   *   # .env.local  (git-ignored)
   *   VITE_DISABLE_PAYWALL=true
   */
  paywallEnabled: import.meta.env.VITE_DISABLE_PAYWALL !== "true",
  /** When true, license keys are validated against the LemonSqueezy API
   *  on every page load. When false, only the local key presence is checked
   *  (useful for offline / development). */
  remoteValidation: false,
  /** Show "Coming soon" badge on languages that aren't ready yet. */
  showComingSoon: true,
} as const;

// ─── Analytics ──────────────────────────────────────────────────

/**
 * Thin wrapper around Plausible's custom event API.
 * No-ops gracefully when Plausible isn't loaded (dev, ad-blockers).
 */
export function trackEvent(
  name: string,
  props?: Record<string, string | number | boolean>,
): void {
  try {
    const w = window as unknown as {
      plausible?: (name: string, opts?: { props: typeof props }) => void;
    };
    w.plausible?.(name, props ? { props } : undefined);
  } catch {
    /* swallow — analytics should never break the app */
  }
}
