import { useTranslation } from "react-i18next";
import { BRAND } from "../config";

/**
 * Three legal pages — Terms of Service, Privacy Policy, Refund Policy.
 *
 * Mounted at /terms, /privacy, /refund in App.tsx routing. Written in plain
 * prose, not legalese. Adequate for an indie digital-product launch — if
 * the business scales to a real company, replace with lawyer-reviewed text.
 *
 * Localised: each page has an English (en) and Ukrainian (uk) version.
 * The current UI language (from i18next) selects which body to render.
 * Plain HTML inside JSX — easy to edit, easy to read, easy to translate.
 */

type LegalPageKey = "terms" | "privacy" | "refund";
type Lang = "en" | "uk";

const LAST_UPDATED = "2026-05-22";

// ─── Titles (per language) ──────────────────────────────────────

const TITLES: Record<Lang, Record<LegalPageKey, string>> = {
  en: {
    terms: "Terms of Service",
    privacy: "Privacy Policy",
    refund: "Refund Policy",
  },
  uk: {
    terms: "Умови використання",
    privacy: "Політика конфіденційності",
    refund: "Політика повернення коштів",
  },
};

const LAST_UPDATED_LABEL: Record<Lang, string> = {
  en: "Last updated",
  uk: "Останнє оновлення",
};

// ─── Main component ─────────────────────────────────────────────

export function LegalPage({ which }: { which: LegalPageKey }) {
  const { t, i18n } = useTranslation();

  // Resolve current UI language → "en" or "uk". Default to en for anything
  // we haven't translated yet.
  const lang: Lang =
    i18n.resolvedLanguage?.toLowerCase().startsWith("uk") || i18n.language?.toLowerCase().startsWith("uk")
      ? "uk"
      : "en";

  const Body = pickBody(which, lang);

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
          <h1>{TITLES[lang][which]}</h1>
          <p className="legal-meta">
            {LAST_UPDATED_LABEL[lang]}: {LAST_UPDATED}
          </p>
          <Body />
        </article>
      </div>
    </div>
  );
}

function pickBody(which: LegalPageKey, lang: Lang) {
  if (lang === "uk") {
    if (which === "terms") return TermsBodyUk;
    if (which === "privacy") return PrivacyBodyUk;
    return RefundBodyUk;
  }
  if (which === "terms") return TermsBodyEn;
  if (which === "privacy") return PrivacyBodyEn;
  return RefundBodyEn;
}

// ─── English bodies ─────────────────────────────────────────────

function TermsBodyEn() {
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

function PrivacyBodyEn() {
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
        Static files (HTML, JS, audio) are served via a CDN (Vercel). That CDN sees
        your IP address as part of standard HTTP serving. We don't have access to
        those logs beyond aggregate traffic reports.
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
        it, or correct it. Under GDPR you have the right to access, rectification,
        erasure, and portability of any personal data we hold.
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

function RefundBodyEn() {
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

// ─── Ukrainian bodies ───────────────────────────────────────────

function TermsBodyUk() {
  return (
    <>
      <p>
        Це умови використання <strong>{BRAND.name}</strong> ({BRAND.domain}).
        Користуючись сайтом, ти погоджуєшся з ними. Якщо не погоджуєшся — не користуйся.
        Дата останнього оновлення — вище.
      </p>

      <h2>Що ми надаємо</h2>
      <p>
        {BRAND.name} продає доступ до інтерактивних підручників з вивчення мов.
        Безкоштовний контент (лендінг, онбординг, Practice Matrix, безкоштовні уроки)
        доступний усім. Платний контент потребує одноразової покупки за окрему мову
        або пакет, який відкриває всі поточні й майбутні мови.
      </p>

      <h2>Твоя покупка</h2>
      <p>
        Платежі обробляє Lemon Squeezy — Merchant of Record. Вони приймають оплату,
        обробляють ПДВ/GST і надсилають тобі на email ліцензійний ключ після покупки.
        Цей ключ ти активуєш на сайті, щоб розблокувати куплений курс.
      </p>
      <p>
        Ліцензійні ключі не прив'язані до конкретного пристрою. Можеш використовувати
        той самий ключ у різних браузерах і на різних пристроях. Будь ласка, не діли
        ключ з іншими — це не контролюється технічно, але саме так цей незалежний
        проєкт залишається життєздатним.
      </p>

      <h2>Твій обліковий запис</h2>
      <p>
        Ми не вимагаємо створення облікового запису. Твій прогрес і ліцензійний ключ
        зберігаються у твоєму браузері. Якщо очистиш дані браузера — втратиш прогрес
        (але не доступ: можеш ввести ключ знову з листа про покупку).
      </p>

      <h2>Що не можна робити</h2>
      <p>
        Не можна перепродавати, перевидавати чи розповсюджувати матеріали курсу.
        Можна вільно використовувати їх для власного навчання, ділитися скріншотами,
        рекомендувати друзям і цитувати короткі уривки з посиланням. Не можна
        перевидавати уроки повністю в іншому місці чи продавати їх.
      </p>

      <h2>Якщо щось зламається</h2>
      <p>
        Ми робимо все можливе, щоб сайт працював, але не гарантуємо безперервний
        доступ. Якщо щось не працює довше за кілька днів і ти не маєш доступу до
        оплаченого контенту — напиши нам, ми або полагодимо, або повернемо гроші.
      </p>
      <p>
        Ми не відповідаємо за непрямі збитки — якщо ти провалив(ла) розмову румунською
        через те, що сайт лежав того ранку, це не наша проблема. Максимум, що ми
        зобов'язані повернути в будь-якому спорі, — це сума, яку ти нам заплатив(ла).
      </p>

      <h2>Повернення коштів</h2>
      <p>
        Див. окрему <a href="/refund">Політику повернення</a>. 30 днів на повернення
        грошей без зайвих питань.
      </p>

      <h2>Зміни в умовах</h2>
      <p>
        Ми можемо оновлювати ці умови, коли продукт змінюється істотно. Дата
        "Останнє оновлення" нагорі показує коли. Продовження використання після
        зміни означає, що ти приймаєш нові умови.
      </p>

      <h2>Контакт</h2>
      <p>
        Питання: <a href={`mailto:${BRAND.contactEmail}`}>{BRAND.contactEmail}</a>
      </p>
    </>
  );
}

function PrivacyBodyUk() {
  return (
    <>
      <p>
        Ми збираємо мінімум інформації, потрібної для роботи продукту. Жодних
        трекінг-cookies. Жодної реклами. Жодного продажу твоїх даних — ніколи.
      </p>

      <h2>Що ми зберігаємо на твоєму пристрої</h2>
      <p>
        У <code>localStorage</code> твого браузера зберігаються мовні налаштування,
        прогрес онбордингу, відмітки про завершені уроки, остання позиція читання та
        ліцензійні ключі. Нічого з цього не залишає твій браузер, якщо ти сам(а)
        явно не надішлеш (наприклад, не напишеш нам ключ для підтримки).
      </p>

      <h2>Що бачать наші сервери</h2>
      <p>
        Ми використовуємо Umami Cloud (регіон ЄС) для підрахунку переглядів сторінок
        і кількох власних подій (старт онбордингу, перегляд пейволу, активація ліцензії).
        Umami не використовує cookies, не збирає особисту інформацію і агрегує все на
        рівні анонімізованих IP. Дані зберігаються в межах Європейського Союзу.
        <a href="https://umami.is/privacy" target="_blank" rel="noopener noreferrer"> Політика конфіденційності Umami</a>.
      </p>
      <p>
        Статичні файли (HTML, JS, аудіо) роздаються через CDN (Vercel). Цей CDN бачить
        твою IP-адресу в межах стандартної роботи HTTP. У нас немає доступу до цих
        логів понад агреговану аналітику трафіку.
      </p>

      <h2>Що бачить платіжна система</h2>
      <p>
        Коли ти купуєш, угода укладається з Lemon Squeezy. Вони — Merchant of Record
        і збирають твоє ім'я, платіжну адресу, email і дані карти напряму — ми ніколи
        не бачимо номер карти. Вони надсилають нам деталі замовлення, щоб ми могли
        перевірити твій ліцензійний ключ.
        <a href="https://www.lemonsqueezy.com/privacy" target="_blank" rel="noopener noreferrer"> Політика конфіденційності Lemon Squeezy</a>.
      </p>

      <h2>Відтворення аудіо</h2>
      <p>
        Аудіо вимови згенеровано заздалегідь і роздається як статичні файли. Деякі
        речення використовують текст-у-мовлення в реальному часі через Microsoft Azure
        або вбудоване Web Speech API браузера. Azure отримує текст, який треба
        озвучити; жодної інформації про тебе він не отримує.
      </p>

      <h2>Email</h2>
      <p>
        Якщо ти напишеш нам на <a href={`mailto:${BRAND.contactEmail}`}>{BRAND.contactEmail}</a>,
        ми збережемо цей лист, щоб відповісти. Ми не додаємо тебе до жодного
        маркетингового списку без явної згоди.
      </p>

      <h2>Твої права</h2>
      <p>
        Напиши нам — і ми розкажемо все, що про тебе знаємо (це небагато), видалимо
        або виправимо. Відповідно до GDPR ти маєш право на доступ, виправлення,
        видалення та портативність будь-яких персональних даних, які ми зберігаємо.
      </p>

      <h2>Діти</h2>
      <p>
        Цей продукт не призначений і не рекламується для дітей до 13 років. Ми свідомо
        не збираємо дані з цієї вікової групи. Якщо вважаєш, що ми це зробили — напиши,
        і ми видалимо.
      </p>

      <h2>Зміни</h2>
      <p>
        Якщо ми змінимо, як працюємо з даними, ця сторінка зміниться. Дата
        "Останнє оновлення" нагорі показує коли.
      </p>
    </>
  );
}

function RefundBodyUk() {
  return (
    <>
      <p>
        <strong>30 днів на повернення коштів без зайвих питань.</strong>
      </p>

      <p>
        Якщо купиш курс і протягом 30 днів вирішиш, що він тобі не підходить — напиши
        нам на <a href={`mailto:${BRAND.contactEmail}`}>{BRAND.contactEmail}</a> з тієї
        самої адреси, з якої купував(ла), зазнач "повернення", і ми обробимо запит
        протягом кількох робочих днів.
      </p>

      <h2>Що відбувається після повернення</h2>
      <p>
        Твій ліцензійний ключ деактивується. Наступного разу, коли відкриєш {BRAND.name},
        платні уроки знову будуть заблоковані. Твій локальний прогрес (позначки про
        завершення, остання позиція) залишається в браузері — він твій.
      </p>

      <h2>Після 30 днів</h2>
      <p>
        Ми не можемо обробити автоматичне повернення після 30 днів, але якщо щось
        справді пішло не так — контент не відповідав обіцяному, сайт зламався, ти
        випадково купив(ла) двічі — напиши. Ми щось придумаємо. Ми невелика команда
        і нам приємніше, щоб ти пішов(ла) задоволеним(ою), а не роздратованим(ою).
      </p>

      <h2>Скільки це триває</h2>
      <p>
        Lemon Squeezy обробляє повернення протягом 5-10 робочих днів на твій
        початковий спосіб оплати. Ми не контролюємо їхні терміни.
      </p>
    </>
  );
}
