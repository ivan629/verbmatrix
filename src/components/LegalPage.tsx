import { useTranslation } from "react-i18next";
import { BRAND } from "../config";

/**
 * Three legal pages — Terms of Service, Privacy Policy, Refund Policy.
 *
 * Mounted at /terms, /privacy, /refund in App.tsx routing. Written in plain
 * prose, not legalese. Adequate for an indie digital-product launch — if
 * the business scales to a real company, replace with lawyer-reviewed text.
 *
 * The wrapper component picks the right page by path. Each individual page
 * is just a content function that returns JSX — easy to edit, easy to read.
 */

type LegalPageKey = "terms" | "privacy" | "refund";

export function LegalPage({ which }: { which: LegalPageKey }) {
  const { t } = useTranslation();

  const pages: Record<LegalPageKey, { title: string; lastUpdated: string; body: React.ReactNode }> = {
    terms: {
      title: "Terms of Service",
      lastUpdated: "2026-05-22",
      body: <TermsBody />,
    },
    privacy: {
      title: "Privacy Policy",
      lastUpdated: "2026-05-22",
      body: <PrivacyBody />,
    },
    refund: {
      title: "Refund Policy",
      lastUpdated: "2026-05-22",
      body: <RefundBody />,
    },
  };

  const page = pages[which];

  return (
    <div className="min-h-screen bg-[var(--bg)] py-10 px-6 md:px-12">
      <div className="max-w-[720px] mx-auto">
        <a
          href="/"
          className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--ink-3)] hover:text-[var(--gold)] transition-colors inline-block mb-10"
        >
          {t("legal_back_to_app")}
        </a>

        <article className="legal-prose">
          <h1>{page.title}</h1>
          <p className="legal-meta">
            {t("legal_last_updated")}: {page.lastUpdated}
          </p>
          {page.body}
        </article>
      </div>
    </div>
  );
}

// ─── Page bodies ────────────────────────────────────────────────
// Plain English. Adapt as your business changes. The voice should match
// the rest of the product — clear, honest, indie.

function TermsBody() {
  return (
    <>
      <p>
        These are the terms of using <strong>{BRAND.name}</strong> ({BRAND.domain}). By
        using the site you agree to them. If you don't agree, please don't use the site.
        Last updated above.
      </p>

      <h2>What we provide</h2>
      <p>
        {BRAND.name} sells access to interactive language-learning textbooks. Free content
        (landing page, onboarding, Practice Matrix, free lessons) is available to anyone.
        Paid content requires a one-time purchase per language or a bundle that grants
        access to every current and future language.
      </p>

      <h2>Your purchase</h2>
      <p>
        Payments are processed by Lemon Squeezy, who is the Merchant of Record. They
        collect payment, handle VAT/GST, and email you a license key after purchase.
        You activate that key on this site to unlock the course you bought.
      </p>
      <p>
        License keys are not bound to a specific device. You can use the same key on
        multiple browsers or devices. Please don't share the key with others — that's
        not enforced technically but it's how this independent project stays viable.
      </p>

      <h2>Your account</h2>
      <p>
        We don't require an account. Your progress and your license key are stored in
        your browser. Clear your browser data and you'll lose progress (but not access —
        you can re-enter your license key from the original purchase email).
      </p>

      <h2>What you can't do</h2>
      <p>
        You can't redistribute, resell, or republish the course material. You can use
        it freely for your own learning, share screenshots, recommend it to friends,
        and quote short passages with attribution. You can't republish the lessons in
        full elsewhere or sell them.
      </p>

      <h2>If something goes wrong</h2>
      <p>
        We do our best to keep the site running but don't guarantee uninterrupted
        access. If something breaks for more than a few days and you can't access
        content you paid for, email us and we'll either fix it or refund you.
      </p>
      <p>
        We're not liable for indirect damages — if you fail a Romanian conversation
        because we had downtime that morning, that's on the conversation. The maximum
        we owe you in any dispute is what you paid us.
      </p>

      <h2>Refunds</h2>
      <p>
        See the separate <a href="/refund">Refund Policy</a>. 30-day money-back,
        no questions asked.
      </p>

      <h2>Changes to these terms</h2>
      <p>
        We may update these terms when the product changes meaningfully. The "Last
        updated" date at the top tells you when. Continued use after a change means
        you accept the new terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions: <a href={`mailto:${BRAND.contactEmail}`}>{BRAND.contactEmail}</a>
      </p>
    </>
  );
}

function PrivacyBody() {
  return (
    <>
      <p>
        We collect the minimum information needed to run the product. No tracking
        cookies. No advertising. No selling your data to anyone, ever.
      </p>

      <h2>What we store on your device</h2>
      <p>
        Your browser's <code>localStorage</code> holds your language preferences,
        onboarding progress, lesson completion checkmarks, last-read position, and
        license keys. None of this leaves your browser unless you explicitly send it
        (e.g. you email us a license key for support).
      </p>

      <h2>What our servers see</h2>
      <p>
        We use Umami Cloud (EU region) to count page views and a few custom events
        (onboarding started, paywall seen, license activated). Umami doesn't use
        cookies, doesn't collect personal information, and aggregates everything at
        the IP-anonymised level. Data is stored within the European Union.
        <a href="https://umami.is/privacy" target="_blank" rel="noopener noreferrer"> Umami's privacy policy</a>.
      </p>
      <p>
        Static files (HTML, JS, audio) are served via a CDN (Vercel or Cloudflare).
        That CDN sees your IP address as part of standard HTTP serving. We don't have
        access to those logs beyond aggregate traffic reports.
      </p>

      <h2>What payments see</h2>
      <p>
        When you purchase, you transact with Lemon Squeezy. They are the Merchant of
        Record and collect your name, billing address, email, and payment details
        directly — we never see your card number. They send us your order details so
        we can verify your license key.
        <a href="https://www.lemonsqueezy.com/privacy" target="_blank" rel="noopener noreferrer"> Lemon Squeezy's privacy policy</a>.
      </p>

      <h2>Audio playback</h2>
      <p>
        Pronunciation audio is pre-generated and served as static files. Some sentences
        use real-time text-to-speech via Microsoft Azure or your browser's built-in
        Web Speech API. Azure receives the text being spoken; it doesn't receive any
        identifying information about you.
      </p>

      <h2>Email</h2>
      <p>
        If you contact us at <a href={`mailto:${BRAND.contactEmail}`}>{BRAND.contactEmail}</a>,
        we keep that email so we can reply. We don't add you to any marketing list
        without your explicit opt-in.
      </p>

      <h2>Your rights</h2>
      <p>
        Email us and we'll tell you everything we have on you (it's not much), delete
        it, or correct it. Under GDPR (we're based in the EU, you're likely covered)
        you have the right to access, rectification, erasure, and portability of any
        personal data we hold.
      </p>

      <h2>Children</h2>
      <p>
        This product isn't designed for or marketed to children under 13. We don't
        knowingly collect data from anyone in that age range. If you believe we have,
        email us and we'll delete it.
      </p>

      <h2>Changes</h2>
      <p>
        If we change how we handle data, this page changes. The "Last updated" date
        at the top tells you when.
      </p>
    </>
  );
}

function RefundBody() {
  return (
    <>
      <p>
        <strong>30-day money-back guarantee, no questions asked.</strong>
      </p>

      <p>
        If you buy a course and decide within 30 days that it isn't for you, email
        us at <a href={`mailto:${BRAND.contactEmail}`}>{BRAND.contactEmail}</a> from
        the address you used to purchase, mention "refund", and we'll process it
        within a few business days.
      </p>

      <h2>What happens when you refund</h2>
      <p>
        Your license key is revoked. The next time you open {BRAND.name}, the paid
        lessons will be locked again. Your local progress (completion marks, last
        position) stays in your browser — that's yours.
      </p>

      <h2>After 30 days</h2>
      <p>
        We can't process automatic refunds after 30 days, but if something has gone
        genuinely wrong — content didn't match what was promised, the site was broken,
        you bought twice by mistake — email us. We'll work something out. We're a
        small team and we'd rather you leave happy than annoyed.
      </p>

      <h2>How long it takes</h2>
      <p>
        Lemon Squeezy processes refunds within 5-10 business days back to your
        original payment method. We don't control their refund timeline.
      </p>
    </>
  );
}
