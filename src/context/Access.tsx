import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { STORAGE_KEYS, FLAGS, trackEvent } from "../config";

// ─── Types ──────────────────────────────────────────────────────

/** Map of language code → license key string. "all" grants every language. */
type LicenseMap = Record<string, string>;

interface AccessContextValue {
  /** Does the user have a valid license for `code`? */
  hasAccess: (code: string) => boolean;
  /** Store a license key for a language (or "all"). */
  activateKey: (code: string, key: string) => ActivationResult;
  /** Remove a license for a language. */
  removeKey: (code: string) => void;
  /** All stored license keys (for the settings/account UI). */
  licenses: LicenseMap;
  /** Whether remote validation is in progress. */
  validating: boolean;
}

export type ActivationResult =
  | { ok: true }
  | { ok: false; reason: "empty" | "invalid_format" | "already_active" };

// ─── Helpers ────────────────────────────────────────────────────

function readLicenses(): LicenseMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.licenses);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (typeof parsed === "object" && parsed !== null) return parsed as LicenseMap;
  } catch { /* corrupt — start fresh */ }
  return {};
}

function writeLicenses(map: LicenseMap): void {
  try {
    localStorage.setItem(STORAGE_KEYS.licenses, JSON.stringify(map));
  } catch { /* quota — degrade silently */ }
}

/**
 * Minimal format check. LemonSqueezy keys are typically UUID-shaped or
 * hex strings. We just ensure it's non-empty and alphanumeric-ish.
 * Real validation happens server-side (when enabled).
 */
function isPlausibleKey(key: string): boolean {
  return /^[A-Za-z0-9_-]{6,}$/.test(key.replace(/-/g, ""));
}

// ─── Context ────────────────────────────────────────────────────

const AccessContext = createContext<AccessContextValue | null>(null);

export function AccessProvider({ children }: { children: ReactNode }) {
  const [licenses, setLicenses] = useState<LicenseMap>(readLicenses);
  const [validating, setValidating] = useState(false);

  // Persist to localStorage whenever licenses change.
  useEffect(() => {
    writeLicenses(licenses);
  }, [licenses]);

  // Optional: validate stored keys against LemonSqueezy on mount.
  useEffect(() => {
    if (!FLAGS.remoteValidation) return;
    const keys = Object.entries(licenses);
    if (keys.length === 0) return;

    setValidating(true);

    // TODO: When LemonSqueezy is configured, POST each key to their
    // /v1/licenses/validate endpoint. Remove any that come back invalid.
    // For now this is a no-op placeholder.
    const timer = setTimeout(() => setValidating(false), 500);
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const hasAccess = useCallback(
    (code: string): boolean => {
      if (!FLAGS.paywallEnabled) return true;
      // "all" key grants every language.
      if (licenses["all"]) return true;
      return !!licenses[code];
    },
    [licenses],
  );

  const activateKey = useCallback(
    (code: string, key: string): ActivationResult => {
      const trimmed = key.trim();
      if (!trimmed) return { ok: false, reason: "empty" };
      if (!isPlausibleKey(trimmed)) return { ok: false, reason: "invalid_format" };

      // Already have the exact same key?
      if (licenses[code] === trimmed) return { ok: false, reason: "already_active" };

      setLicenses((prev) => ({ ...prev, [code]: trimmed }));
      trackEvent("license-activated", { language: code });
      return { ok: true };
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
