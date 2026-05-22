import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAccess, type ActivationResult } from "../context/Access";
import { BRAND } from "../config";

interface LicenseKeyModalProps {
  /** The language code this key is for (or "all" for bundle). */
  languageCode: string;
  onClose: () => void;
}

export function LicenseKeyModal({ languageCode, onClose }: LicenseKeyModalProps) {
  const { t } = useTranslation();
  const { activateKey, validating } = useAccess();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState("");
  const [result, setResult] = useState<ActivationResult | null>(null);
  const [shake, setShake] = useState(false);

  // Focus the input on mount.
  useEffect(() => {
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  // Close on Escape.
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock body scroll.
  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = orig; };
  }, []);

  const handleSubmit = useCallback(async () => {
    const res = await activateKey(languageCode, value);
    setResult(res);
    if (res.ok) {
      // Brief success state, then close.
      setTimeout(onClose, 1200);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 400);
    }
  }, [activateKey, languageCode, value, onClose]);

  const errorMessage = result && !result.ok
    ? result.reason === "empty"
      ? t("key_error_empty")
      : result.reason === "invalid_format"
        ? t("key_error_format")
        : result.reason === "already_active"
          ? t("key_error_already")
          : result.reason === "remote_invalid"
            ? t("key_error_remote_invalid")
            : result.reason === "wrong_product"
              ? t("key_error_wrong_product")
              : t("key_error_network")
    : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
      style={{ background: "var(--backdrop)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`
          bg-[var(--surface)] border border-[var(--border)]
          rounded-[var(--radius-xl)] shadow-[var(--shadow-3)]
          w-full max-w-[440px] p-8
          fade-in
          ${shake ? "animate-shake" : ""}
        `}
        role="dialog"
        aria-modal="true"
        aria-label={t("key_modal_title")}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="font-display text-[1.3rem] text-[var(--ink)] tracking-tight">
              {t("key_modal_title")}
            </h2>
            <p className="text-[0.85rem] text-[var(--ink-3)] mt-1">
              {languageCode === "all"
                ? t("key_modal_subtitle_all")
                : t("key_modal_subtitle", { lang: languageCode.toUpperCase() })}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--ink-4)] hover:text-[var(--ink)] transition-colors text-[18px] leading-none -mt-1"
            aria-label={t("key_modal_close")}
          >
            ✕
          </button>
        </div>

        {/* Success state */}
        {result?.ok ? (
          <div className="text-center py-8 fade-in">
            <div className="text-[2rem] mb-3">✓</div>
            <div className="font-display text-[1.1rem] text-[var(--affirm)]">
              {t("key_success")}
            </div>
          </div>
        ) : (
          <>
            {/* Input */}
            <div className="mb-4">
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  setResult(null);
                }}
                onKeyDown={(e) => { if (e.key === "Enter") handleSubmit(); }}
                placeholder="XXXX-XXXX-XXXX-XXXX"
                className={`
                  w-full px-4 py-3 rounded-[var(--radius)]
                  bg-[var(--surface-2)] border
                  font-mono text-[0.95rem] tracking-wider text-center
                  text-[var(--ink)] placeholder:text-[var(--ink-5)]
                  focus:outline-none focus:border-[var(--gold)]
                  transition-colors
                  ${errorMessage ? "border-[var(--neg)]" : "border-[var(--border)]"}
                `}
                autoComplete="off"
                spellCheck={false}
              />
              {errorMessage && (
                <p className="text-[var(--neg)] text-[0.8rem] mt-2 text-center font-mono">
                  {errorMessage}
                </p>
              )}
            </div>

            {/* Actions */}
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!value.trim() || validating}
              className="w-full py-3 rounded-[var(--radius)] bg-[var(--ink)] text-[var(--bg)] font-mono text-[12px] uppercase tracking-[0.1em] font-semibold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {validating ? t("key_modal_validating") : t("key_modal_activate")}
            </button>

            <p className="text-[0.78rem] text-[var(--ink-4)] text-center mt-4 leading-[1.55]">
              {t("key_modal_help", { email: BRAND.contactEmail })}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
