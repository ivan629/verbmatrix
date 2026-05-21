import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useTargetLanguage } from "../context/TargetLanguage";
import { getPricing, trackEvent } from "../config";
import { LicenseKeyModal } from "./LicenseKeyModal";

/**
 * Inline paywall card rendered in place of gated lessons.
 *
 * Design: a single prominent card that feels like a natural pause in the
 * reading flow rather than an aggressive block. Uses the gold accent to
 * signal value, not alarm.
 */
export function PaywallCard() {
  const { t } = useTranslation();
  const { module } = useTargetLanguage();
  const pricing = getPricing(module.code);
  const [showKeyModal, setShowKeyModal] = useState(false);

  return (
    <>
      <section className="my-16 scroll-mt-20 paywall-enter" id="paywall">
        <div className="bg-[var(--gold-soft)] border border-[var(--gold-border)] rounded-[var(--radius-xl)] p-8 md:p-12 max-w-[680px]">
          {/* Decorative mark */}
          <div className="font-mono text-[var(--gold)] text-[0.7rem] uppercase tracking-[0.18em] font-semibold mb-5">
            ✦ {t("paywall_kicker")}
          </div>

          <h2 className="font-display text-[clamp(1.5rem,3vw,2rem)] font-light text-[var(--ink)] tracking-tight leading-[1.15] mb-4">
            {t("paywall_title")}
          </h2>

          <p className="text-[0.95rem] text-[var(--ink-2)] leading-[1.65] mb-8 max-w-[540px]">
            {t("paywall_body")}
          </p>

          {/* What's included */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 mb-8">
            {[
              "paywall_inc_lessons",
              "paywall_inc_verbs",
              "paywall_inc_vocab",
              "paywall_inc_dialogues",
              "paywall_inc_plan",
              "paywall_inc_updates",
            ].map((key) => (
              <div key={key} className="flex items-center gap-2.5 text-[0.88rem] text-[var(--ink-2)]">
                <span className="text-[var(--gold)] text-[0.7rem]">✓</span>
                {t(key)}
              </div>
            ))}
          </div>

          {/* CTA row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button
              type="button"
              onClick={() => {
                trackEvent("purchase-click", { language: module.code, price: pricing.price, source: "paywall" });
                if (pricing.checkoutUrl) {
                  window.open(pricing.checkoutUrl, "_blank");
                } else {
                  // Fallback: open key modal if no checkout URL configured yet
                  setShowKeyModal(true);
                }
              }}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-[var(--radius)] bg-[var(--ink)] text-[var(--bg)] font-mono text-[12px] uppercase tracking-[0.1em] font-semibold hover:opacity-90 transition-opacity shadow-[var(--shadow-1)]"
            >
              {t("paywall_cta", { price: pricing.priceFormatted })}
              <span aria-hidden="true">→</span>
            </button>

            <button
              type="button"
              onClick={() => setShowKeyModal(true)}
              className="font-mono text-[11px] uppercase tracking-[0.1em] text-[var(--ink-3)] hover:text-[var(--ink)] transition-colors"
            >
              {t("paywall_have_key")}
            </button>
          </div>

          {/* Guarantee */}
          <p className="mt-6 text-[0.78rem] text-[var(--ink-3)] leading-[1.55]">
            {t("paywall_guarantee")}
          </p>
        </div>
      </section>

      {showKeyModal && (
        <LicenseKeyModal
          languageCode={module.code}
          onClose={() => setShowKeyModal(false)}
        />
      )}
    </>
  );
}
