import { useCallback, useEffect, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { BRAND, trackEvent } from "../config";

/**
 * Contact link — opens the user's email client via `mailto:`. If the user has
 * no email client configured (very common for web-only Gmail users), falls
 * back to copying the email address to clipboard and showing a brief toast.
 *
 * The detection trick: when `mailto:` opens an actual app, the browser tab
 * loses focus (the OS switches to Mail.app / Outlook). When it does nothing,
 * the tab stays focused. We watch for ~700ms after the click; if focus
 * never leaves, we treat the mailto as failed and copy instead.
 *
 * Track events:
 *   contact-click           — user clicked the link
 *   contact-mailto-opened   — email client opened successfully
 *   contact-copy-fallback   — fallback fired (no mail client)
 */

interface ContactLinkProps {
  className?: string;
  /** Override the link label. Defaults to t("footer_legal_contact"). */
  children?: ReactNode;
  /** Where on the page this is rendered, for analytics. */
  source?: "footer-textbook" | "footer-landing" | "legal-page" | "other";
}

export function ContactLink({
  className = "",
  children,
  source = "other",
}: ContactLinkProps) {
  const { t } = useTranslation();
  const [toast, setToast] = useState<"copied" | "failed" | null>(null);

  // Auto-dismiss toast after 2.5s.
  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2500);
    return () => window.clearTimeout(id);
  }, [toast]);

  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
      // Legacy fallback for very old browsers.
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      const ok = document.execCommand("copy");
      document.body.removeChild(ta);
      return ok;
    } catch {
      return false;
    }
  }, []);

  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>) => {
      trackEvent("contact-click", { source });

      // Let the browser try the mailto first. We don't preventDefault —
      // if the user has a mail client, it should open as normal.
      //
      // Detection: when a mail client opens, the browser tab loses focus.
      // We listen for a blur event within 700ms. If we get one, mailto
      // worked → do nothing. If not, fallback to copy.
      let opened = false;
      const onBlur = () => {
        opened = true;
        trackEvent("contact-mailto-opened", { source });
      };
      window.addEventListener("blur", onBlur, { once: true });

      window.setTimeout(async () => {
        window.removeEventListener("blur", onBlur);
        if (opened) return;
        // No blur happened — mailto didn't open anything. Fall back to copy.
        const ok = await copyToClipboard(BRAND.contactEmail);
        setToast(ok ? "copied" : "failed");
        trackEvent("contact-copy-fallback", { source, success: ok });
      }, 700);

      // Don't preventDefault — mailto still fires for users who have it.
      void e;
    },
    [copyToClipboard, source],
  );

  return (
    <span className="contact-link-wrap">
      <a
        href={`mailto:${BRAND.contactEmail}`}
        onClick={handleClick}
        className={className}
      >
        {children ?? t("footer_legal_contact")}
      </a>
      {toast === "copied" && (
        <span className="contact-toast" role="status" aria-live="polite">
          {t("contact_copied", { defaultValue: `Copied ${BRAND.contactEmail}` })}
        </span>
      )}
      {toast === "failed" && (
        <span className="contact-toast contact-toast-failed" role="status" aria-live="polite">
          {BRAND.contactEmail}
        </span>
      )}
    </span>
  );
}
