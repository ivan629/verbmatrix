import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { STORAGE_KEYS, FLAGS, trackEvent, LEMONSQUEEZY } from "../config";

// ─── Types ──────────────────────────────────────────────────────

/** Map of language code → license key string. The reserved code "all"
 *  is supported for a future bundle SKU; the current launch sells only
 *  the Romanian course. */
type LicenseMap = Record<string, string>;

interface AccessContextValue {
  /** Does the user have a valid license for `code`? */
  hasAccess: (code: string) => boolean;
  /** Store a license key for a language. Validates against LemonSqueezy
   *  when `FLAGS.remoteValidation` is on. */
  activateKey: (code: string, key: string) => Promise<ActivationResult>;
  /** Remove a license for a language. */
  removeKey: (code: string) => void;
  /** All stored license keys (for the settings/account UI). */
  licenses: LicenseMap;
  /** Whether remote validation is in progress. */
  validating: boolean;
}

export type ActivationResult =
  | { ok: true; languageUnlocked: string }
  | {
      ok: false;
      reason:
        | "empty"
        | "invalid_format"
        | "already_active"
        | "remote_invalid"
        | "wrong_product"
        | "network_error";
    };

// ─── LemonSqueezy validation ────────────────────────────────────
//
// POST https://api.lemonsqueezy.com/v1/licenses/validate
// Body: license_key=<key>
// On success the response contains meta.product_id which we map back to
// a language code via LEMONSQUEEZY.productMap. The endpoint accepts the
// license key itself as auth — no API key needed in the browser.

interface LSValidateResponse {
  valid: boolean;
  error?: string;
  license_key?: {
    status?: string;
    key?: string;
    activation_limit?: number;
    activation_usage?: number;
  };
  meta?: {
    store_id?: number;
    order_id?: number;
    product_id?: number;
    variant_id?: number;
  };
}

async function validateWithLemonSqueezy(key: string): Promise<LSValidateResponse> {
  const form = new URLSearchParams();
  form.set("license_key", key);
  const res = await fetch(`${LEMONSQUEEZY.apiBase}/v1/licenses/validate`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: form.toString(),
  });
  // 400 still returns a JSON body with valid:false — only treat true network
  // failures as exceptions.
  if (!res.ok && res.status !== 400) {
    throw new Error(`LemonSqueezy validate: HTTP ${res.status}`);
  }
  return (await res.json()) as LSValidateResponse;
}

/** Map a LemonSqueezy product_id (number) to a language code (or "all").
 *  Returns null if the product isn't in our config. */
function productIdToLanguage(productId: number | undefined): string | null {
  if (productId === undefined) return null;
  const target = String(productId);
  const map = LEMONSQUEEZY.productMap;
  for (const code of Object.keys(map)) {
    if (map[code] && map[code] === target) return code;
  }
  return null;
}

// ─── Storage helpers ────────────────────────────────────────────

function readLicenses(): LicenseMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.licenses);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null) return parsed as LicenseMap;
  } catch {
    /* corrupt — start fresh */
  }
  return {};
}

function writeLicenses(map: LicenseMap): void {
  try {
    localStorage.setItem(STORAGE_KEYS.licenses, JSON.stringify(map));
  } catch {
    /* quota — degrade silently */
  }
}

/** Cheap front-line filter so we don't waste an API call on obvious typos. */
function isPlausibleKey(key: string): boolean {
  return /^[A-Za-z0-9_-]{6,}$/.test(key.replace(/-/g, ""));
}

// ─── Context ────────────────────────────────────────────────────

const AccessContext = createContext<AccessContextValue | null>(null);

export function AccessProvider({ children }: { children: ReactNode }) {
  const [licenses, setLicenses] = useState<LicenseMap>(readLicenses);
  const [validating, setValidating] = useState(false);

  useEffect(() => {
    writeLicenses(licenses);
  }, [licenses]);

  // On mount: re-validate every stored key against LemonSqueezy. If a key
  // comes back invalid (refunded, revoked) we silently drop it from storage.
  // Network errors leave keys alone — we'd rather over-grant access on a
  // transient outage than lock out a paying customer.
  useEffect(() => {
    if (!FLAGS.remoteValidation) return;
    const entries = Object.entries(licenses);
    if (entries.length === 0) return;

    let cancelled = false;
    setValidating(true);

    (async () => {
      const toRemove: string[] = [];
      for (const [code, key] of entries) {
        try {
          const result = await validateWithLemonSqueezy(key);
          if (!result.valid) {
            toRemove.push(code);
            trackEvent("license-revoked", { language: code });
          }
        } catch {
          /* network — leave key in place, try again next session */
        }
      }
      if (cancelled) return;
      if (toRemove.length > 0) {
        setLicenses((prev) => {
          const next = { ...prev };
          for (const code of toRemove) delete next[code];
          return next;
        });
      }
      setValidating(false);
    })();

    return () => {
      cancelled = true;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const hasAccess = useCallback(
    (code: string): boolean => {
      if (!FLAGS.paywallEnabled) return true;
      if (licenses.all) return true;
      return !!licenses[code];
    },
    [licenses],
  );

  const activateKey = useCallback(
    async (code: string, key: string): Promise<ActivationResult> => {
      const trimmed = key.trim();
      if (!trimmed) return { ok: false, reason: "empty" };
      if (!isPlausibleKey(trimmed)) return { ok: false, reason: "invalid_format" };

      // Already stored under this language?
      if (licenses[code] === trimmed) return { ok: false, reason: "already_active" };

      // Remote validation (production). Confirm key is real AND that it
      // belongs to a product matching the language the user is unlocking.
      if (FLAGS.remoteValidation) {
        setValidating(true);
        try {
          const result = await validateWithLemonSqueezy(trimmed);
          setValidating(false);
          if (!result.valid) {
            trackEvent("license-activation-failed", { language: code, reason: "remote_invalid" });
            return { ok: false, reason: "remote_invalid" };
          }
          const keyLanguage = productIdToLanguage(result.meta?.product_id);
          if (keyLanguage === null) {
            trackEvent("license-activation-failed", { language: code, reason: "wrong_product" });
            return { ok: false, reason: "wrong_product" };
          }
          // "all" key unlocks everything — store under "all" regardless of
          // where the user clicked. Single-language keys must match exactly.
          if (keyLanguage !== "all" && keyLanguage !== code) {
            trackEvent("license-activation-failed", { language: code, reason: "wrong_product" });
            return { ok: false, reason: "wrong_product" };
          }
          setLicenses((prev) => ({ ...prev, [keyLanguage]: trimmed }));
          trackEvent("license-activated", { language: keyLanguage });
          return { ok: true, languageUnlocked: keyLanguage };
        } catch {
          setValidating(false);
          return { ok: false, reason: "network_error" };
        }
      }

      // Offline / dev mode — store the key with no remote check.
      setLicenses((prev) => ({ ...prev, [code]: trimmed }));
      trackEvent("license-activated", { language: code, mode: "offline" });
      return { ok: true, languageUnlocked: code };
    },
    [licenses],
  );

  const removeKey = useCallback((code: string) => {
    setLicenses((prev) => {
      const next = { ...prev };
      delete next[code];
      return next;
    });
  }, []);

  const value = useMemo<AccessContextValue>(
    () => ({ hasAccess, activateKey, removeKey, licenses, validating }),
    [hasAccess, activateKey, removeKey, licenses, validating],
  );

  return (
    <AccessContext.Provider value={value}>
      {children}
    </AccessContext.Provider>
  );
}

export function useAccess() {
  const ctx = useContext(AccessContext);
  if (!ctx) throw new Error("useAccess must be used inside <AccessProvider>");
  return ctx;
}
