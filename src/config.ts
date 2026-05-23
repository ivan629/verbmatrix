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
  tagline: "Learn Romanian with the verb matrix.",
  /** Longer pitch for the landing page hero. */
  pitch:
      "Three tenses. Three forms. Nine sentence types. Master the matrix and speak Romanian with confidence.",
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
  /** Customer email captured at activation (when redirect URL carries
   *  the [email] LS variable). Display-only — used in the account UI
   *  and prefilled in support-mail-to links. Not used for auth. */
  customerEmail: `${PREFIX}:customer-email`,
  /** Per-lesson completion. Suffixed with `<lang>:<lessonId>` at runtime:
   *  e.g. `vm:completed:ro:L3 = "1"`. Absence means not completed. */
  completedPrefix: `${PREFIX}:completed:`,
  /** Last-viewed lesson id, per language: `vm:last-pos:ro = "L7"`. Used to
   *  restore the user's reading position when they return. */
  lastPositionPrefix: `${PREFIX}:last-pos:`,
  /** Focus mode preference (global, not per-language): "1" or absent. */
  focusMode: `${PREFIX}:focus-mode`,
} as const;

// ─── LemonSqueezy ───────────────────────────────────────────────
//
// You configure these AFTER signing up at https://lemonsqueezy.com,
// creating your store, and adding the product:
//
//   "Romanian Course" — one-time, $14.99, with license keys enabled
//
// The product gives you:
//   - A "Buy Link" (the checkout URL — looks like
//     https://YOURSTORE.lemonsqueezy.com/buy/UUID)
//   - A Product ID (number, visible in the dashboard URL: /products/12345)
//
// Drop both into VITE_LEMONSQUEEZY_* env vars on Vercel (or .env.local for
// dev). Once these are set AND VITE_REMOTE_VALIDATION=true, license keys
// will be validated against LemonSqueezy's API on entry.
//
// API ref: https://docs.lemonsqueezy.com/api/license-keys

export const LEMONSQUEEZY = {
  /** Base URL for LemonSqueezy's REST API. */
  apiBase: "https://api.lemonsqueezy.com",

  /** Your store's LS subdomain — e.g. "verbmatrix" if your store is at
   *  https://verbmatrix.lemonsqueezy.com. Used to build the customer
   *  portal URL so customers can recover lost license keys via LS's
   *  built-in email magic-link flow. Set via VITE_LS_STORE env var.
   *
   *  When set, "Lost your access?" links in the UI point to:
   *    https://<store>.lemonsqueezy.com/billing
   *  LS handles the magic-link sign-in and shows the customer all their
   *  license keys — no backend required on our side. */
  storeSubdomain: import.meta.env.VITE_LS_STORE ?? "",

  /** Map of language code → LemonSqueezy product_id (as string).
   *  When a customer enters a license key, we POST it to the validate
   *  endpoint and LS returns the product_id it belongs to. We match that
   *  back to a language using this map so the right course unlocks.
   *
   *  Values come from Vite env so a re-deploy can update them without
   *  a code change. Default to empty strings — falsy product IDs are
   *  treated as "no key for this product is valid yet". */
  productMap: {
    ro:  import.meta.env.VITE_LS_PRODUCT_RO  ?? "",
  } as Record<string, string>,
} as const;

/** Customer portal URL for license-key recovery, or null if not configured.
 *  LS hosts an email magic-link sign-in at this URL where customers can see
 *  all their license keys. Use it as the "Lost your access?" target. */
export function getCustomerPortalUrl(): string | null {
  const sub = LEMONSQUEEZY.storeSubdomain;
  if (!sub) return null;
  return `https://${sub}.lemonsqueezy.com/billing`;
}

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
    checkoutUrl: import.meta.env.VITE_LS_CHECKOUT_RO ?? "",
    productId:   import.meta.env.VITE_LS_PRODUCT_RO  ?? "",
  },
};

/** Return pricing for a language code, falling back to Romanian if unknown. */
export function getPricing(code: string): LanguagePricing {
  return PRICING[code] ?? PRICING.ro;
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
   *  on every page load and on entry. When false, only the local key
   *  presence is checked (useful for offline / development).
   *
   *  Production: set VITE_REMOTE_VALIDATION=true in Vercel env vars.
   *  Dev: leave unset to skip API calls when working offline. */
  remoteValidation: import.meta.env.VITE_REMOTE_VALIDATION === "true",
} as const;

// ─── Analytics ──────────────────────────────────────────────────

/**
 * Thin wrapper around Umami Cloud's custom event API.
 * No-ops gracefully when Umami isn't loaded (dev, ad-blockers, etc).
 *
 * Umami's tracker exposes `window.umami.track(name, properties)`.
 * Properties is a flat object.
 *
 * Setup: <script defer src="https://cloud.umami.is/script.js"
 *          data-website-id="8f88f6b9-ab5d-4392-9d4f-8316bce875c0"></script>
 * Dashboard: https://eu.umami.is/
 *
 * Production-only filter:
 *   The Umami script in index.html is also configured to only fire on
 *   verbmatrix.com itself (data-domains attribute), but we add a
 *   client-side guard here for defense in depth — so even if someone
 *   forgets the script attribute, dev and preview hostnames never pollute
 *   the live dashboard. Set VITE_ANALYTICS_OVERRIDE=true in a local .env
 *   to opt in temporarily while debugging.
 */
function isProductionEnvironment(): boolean {
  if (typeof window === "undefined") return false;
  if (import.meta.env.VITE_ANALYTICS_OVERRIDE === "true") return true;
  const host = window.location.hostname;
  return host === "verbmatrix.com" || host === "www.verbmatrix.com";
}

export function trackEvent(
    name: string,
    props?: Record<string, string | number | boolean>,
): void {
  if (!isProductionEnvironment()) return;
  try {
    type TrackProps = Record<string, string | number | boolean>;
    const w = window as unknown as {
      umami?: { track: (name: string, props?: TrackProps) => void };
    };
    w.umami?.track(name, props);
  } catch {
    /* swallow — analytics should never break the app */
  }
}