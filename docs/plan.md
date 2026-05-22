# Production & Monetization Plan

## Current State Assessment

**What's built:** A fully architected, multi-language-ready learning platform with Romanian as the first complete module. React + Vite + TypeScript. Clean component library, i18n, 3-tier TTS, dark mode, mobile-responsive, print styles, 5-step onboarding, URL routing (`/ro`, `/es`, etc.), and a `LanguageModule` interface that makes adding languages a folder-copy operation.

**What's missing:** Product name & branding, landing/sales page, access control (paywall), analytics, SEO/meta tags, legal pages, payment integration, and a second language to prove the multi-language promise.

---

## Phase 0 — Decisions (Before Any Code)

### Product Name

The name needs to work across all languages and communicate the method. It should be short, memorable, and available as a `.com` domain.

Candidates to evaluate:

| Name | Why | Domain check needed |
|------|-----|---------------------|
| **VerbMatrix** | Directly names the core method | verbmatrix.com |
| **SpeakGrid** | Grid = matrix, Speak = outcome | speakgrid.com |
| **MatrixLang** | Method + language | matrixlang.com |
| **GridFluent** | Method + outcome | gridfluent.com |
| **NineCell** | 3×3 matrix = 9 cells, memorable | ninecell.com |

**Decision needed:** Pick one. Check domain availability. Register it.

### Pricing Structure

Per-language access with a bundle option:

| Tier | Price | What they get |
|------|-------|---------------|
| Romanian | $14.99 | Full Romanian course |
| Spanish | $49.99 | Full Spanish course |
| Japanese | $79.99 | Full Japanese course (premium — harder language, more willing-to-pay audience) |
| All Access | $99.99 | All current + future languages |
| Free tier | $0 | Landing page + onboarding + Practice Matrix demo + Lesson 0 |

The free tier is critical — it lets people experience the matrix method before paying. The onboarding flow is your best sales tool.

### Free vs Paid Content Split

```
FREE (no login needed):
├── Landing / sales page
├── Language picker
├── 5-step onboarding (per language)
├── Practice Matrix (interactive demo — all verbs)
├── Lesson 0 — Mindset
└── Lesson 1 — Pronunciation (partial — first 3 sections)

PAID (per-language access):
├── Lesson 1 (full) through Lesson 17
├── Full vocabulary reference (500+ words)
├── All 16 dialogues
├── 32-day study plan
├── About Me template
└── Future updates for that language
```

This split works because the free content demonstrates the method convincingly. Someone who goes through onboarding, plays with the matrix, and reads Lesson 0 already understands the system. The paywall hits right when they think "OK, I want the rest."

---

## Phase 1 — Brand & Sales Layer (Week 1–2)

### 1.1 Product Name Implementation

Update all references from `ro-study` to the chosen brand name:

**Files to change:**
- `src/locales/en.json` → `app_brand` and `app_brand_suffix` keys
- `src/locales/uk.json` → same keys
- `src/main.tsx` → localStorage key `ro-study-theme` → `<brand>-theme`
- `src/context/TargetLanguage.tsx` → `STORAGE_KEY` from `ro-study-learning-lang` → `<brand>-lang`
- `src/lib/translate.ts` → `STORAGE_KEY` from `ro-study-tx-cache-v1` → `<brand>-tx-v1`
- `src/components/Onboarding.tsx` → `SEEN_KEY_PREFIX` from `study-onboarded:` → `<brand>-onboarded:`
- `index.html` → `<title>`, meta description, Open Graph tags

### 1.2 Landing Page (New Component)

Create `src/components/LandingPage.tsx` — this replaces `FirstVisitPicker` as the root `/` page for non-authenticated visitors.

**Structure:**

```
Hero
  "Learn any language with one system."
  "Three tenses × three forms = nine sentence types.
   Master them and you can say almost anything."
  [Try it free →]

How it works (3 steps)
  1. The Matrix — 3×3 grid, any verb
  2. 32 core verbs — covers 90% of daily speech
  3. 32 days — structured practice schedule

Social proof / testimonials
  (Even 2-3 beta tester quotes work at launch)

Language cards
  Romanian — Available now
  Spanish — Coming soon
  Japanese — Coming soon

Pricing
  Per-language cards with price + "Get access" button
  All-Access bundle highlighted

FAQ
  "Is this an app?" → It's a web-based interactive textbook...
  "How is this different from Duolingo?" → ...
  "What if I want a refund?" → 30-day money-back guarantee

Footer
  Legal links, contact email, brand
```

### 1.3 SEO & Meta Tags

Update `index.html`:

```html
<title>[Brand] — Learn any language with one system</title>
<meta name="description" content="Three tenses, three forms, nine sentence types. Master the verb matrix and speak any language in 32 days." />
<meta property="og:title" content="[Brand]" />
<meta property="og:description" content="Learn any language with one system." />
<meta property="og:image" content="/og-image.png" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
```

Create an OG image (1200×630px) showing the verb matrix grid — this is what appears when someone shares your link.

### 1.4 Legal Pages

Create minimal but necessary pages (can be simple markdown rendered as components):

- **Terms of Service** — covers digital product purchase, refund policy, account terms
- **Privacy Policy** — what data you collect (email, payment via Stripe), no tracking beyond analytics
- **Refund Policy** — 30-day money-back guarantee, no questions asked

---

## Phase 2 — Access Control & Payments (Week 2–3)

### 2.1 Architecture Decision: Client-Side Gating vs Server-Side

**Recommended: Hybrid approach.**

Your content is all in the JavaScript bundle — a determined person could view-source and see everything. For a $15–50 product, this is acceptable. The goal is to make honest people pay, not to build Fort Knox.

**Implementation:**

```
Option A — Simplest (LemonSqueezy / Gumroad)
├── User pays on LemonSqueezy
├── Receives a license key
├── Enters key on your site
├── Key stored in localStorage
├── Client-side check: has valid key for this language?
│   ├── Yes → render lessons
│   └── No → render paywall component
└── Validate key against LemonSqueezy API on page load (async)

Option B — More robust (Supabase Auth + Stripe)
├── User creates account (email/password or magic link)
├── Pays via Stripe Checkout
├── Stripe webhook → Supabase DB marks language as purchased
├── User logs in → fetch purchased languages from Supabase
├── Client-side gate based on purchase record
└── Server-side: Supabase Row Level Security ensures data integrity
```

**Recommendation: Start with Option A.** It takes 1-2 days to implement vs 1-2 weeks for Option B. You can always upgrade later. LemonSqueezy handles payments, tax compliance (VAT for EU customers — this matters since you're in Romania), and license key generation.

### 2.2 New Components Needed

**`src/components/AccessGate.tsx`**

Wraps lesson content. Checks if the user has access to the current language.

```typescript
// Pseudocode
function AccessGate({ children, languageCode }) {
  const hasAccess = useAccess(languageCode);

  if (hasAccess) return children;

  return <PaywallCard languageCode={languageCode} />;
}
```

**`src/components/PaywallCard.tsx`**

Shown when a user scrolls past the free content. Should feel like a natural pause, not a wall.

```
┌─────────────────────────────────────────┐
│  ✦ You've seen the system.              │
│                                         │
│  The full Romanian course includes:     │
│  · 17 lessons from zero to conversation │
│  · 32 core verbs with full conjugations │
│  · 500+ vocabulary words with audio     │
│  · 16 real-life dialogues               │
│  · 32-day study plan                    │
│                                         │
│  [$14.99 — Get full access]             │
│                                         │
│  30-day money-back guarantee.           │
│  One-time payment. Yours forever.       │
└─────────────────────────────────────────┘
```

**`src/components/LicenseKeyEntry.tsx`**

Simple input field + "Activate" button. Validates against LemonSqueezy API.

### 2.3 Modify App.tsx Flow

Current flow:
```
/ → FirstVisitPicker → Onboarding → Full lessons
```

New flow:
```
/ → LandingPage (public sales page)
/ro → Onboarding (free, per-language) → Free lessons + AccessGate → PaywallCard
/ro (with valid key) → Onboarding → All lessons
```

### 2.4 LemonSqueezy Setup

1. Create LemonSqueezy account
2. Create one Product per language ("Romanian Course", "Spanish Course")
3. Create one "All Access" Product (bundle)
4. Enable license key generation for each product
5. Add your domain to allowed origins
6. Store the API key as `VITE_LEMONSQUEEZY_API` (or keep server-side if using a thin API)

---

## Phase 3 — Analytics & Tracking (Week 3)

### 3.1 Plausible Analytics

Plausible is privacy-friendly (no cookies, GDPR-compliant without consent banners) and costs $9/month.

Add to `index.html`:
```html
<script defer data-domain="yourdomain.com" src="https://plausible.io/js/script.js"></script>
```

### 3.2 Custom Events to Track

```javascript
// Track these via Plausible custom events:
plausible('onboarding-start', { language: 'ro' })
plausible('onboarding-complete', { language: 'ro' })
plausible('paywall-seen', { language: 'ro' })
plausible('purchase-click', { language: 'ro', price: '14.99' })
plausible('license-activated', { language: 'ro' })
plausible('lesson-viewed', { language: 'ro', lesson: 'L3' })
```

This tells you: How many people start onboarding? How many finish? How many hit the paywall? How many click "buy"? Where do they drop off?

---

## Phase 4 — Domain, Hosting & Deployment (Week 3)

### 4.1 Domain

Register `[brand].com`. Also grab `.io` or `.co` if available as redirects.

### 4.2 Hosting

**Recommended: Vercel or Cloudflare Pages.**

Both are free for static sites, have global CDN, automatic HTTPS, and deploy-on-push from GitHub.

Vite builds to static files → perfect for either platform.

### 4.3 Deployment Pipeline

```
GitHub repo (private)
  ↓ push to main
Vercel / Cloudflare Pages
  ↓ auto-build (npm run build)
  ↓ deploy to CDN
yourdomain.com ← live
```

### 4.4 Email Setup

You need a transactional email for license key delivery and a marketing email for the list.

- **Transactional:** LemonSqueezy handles purchase confirmation + key delivery automatically
- **Marketing list:** Buttondown ($0 for first 100 subscribers) or ConvertKit free tier
- **Contact email:** hello@[brand].com via your domain provider

---

## Phase 5 — Content Polish for Launch (Week 3–4)

### 5.1 Audio Quality

The Romanian audio manifest has 1275 entries. For launch, this is fine — the ElevenLabs pre-generated audio is premium quality.

For the free tier specifically, ensure the Practice Matrix verbs and Lesson 0 phrases all have pre-generated audio. The paywall content can fall back to Azure/browser TTS initially and be upgraded over time.

### 5.2 Rename `<RO />` Component

Despite the comment saying "name kept for stability," this should be renamed before adding a second language. A find-and-replace from `<RO` to `<Word` (or `<TL` for "Target Language") across all files. The Romanian module has ~100+ call sites — do this in one batch.

Actually — **reconsider this.** The component works perfectly. Every new language module will use the same `<RO />` import. The name is quirky but harmless. The rename is pure cosmetics and risks introducing bugs across 100+ call sites. **Skip this for launch.** Rename later if it bothers you.

### 5.3 Visual Brand Touch

Add a small logo/wordmark to:
- Landing page header
- Sidebar top (replacing the text-only brand)
- OG image
- Favicon

This can be as simple as a custom SVG wordmark in your display serif font. No need for a graphic designer — typographic logos look premium and cost nothing.

---

## Phase 6 — Pre-Launch Marketing (Week 2–4, parallel)

### 6.1 Email Waitlist

On the landing page, before the product is purchasable, collect emails:

```
"Be the first to try [Brand]."
[Email input] [Join the waitlist →]
```

Use Buttondown or ConvertKit. Even 50 emails at launch is better than zero.

### 6.2 Content Creation (Start Immediately)

Create 10 TikTok/Reels showing the verb matrix concept:

1. "Learn to say anything in Romanian with this one trick" — show the 3×3 grid
2. "I learned 24 Romanian words in 30 seconds" — the cognate reel from onboarding
3. "Why most language apps fail" — hook, then show the matrix as the solution
4. "The multiplication table for language learning" — the principle explained
5. "Say 'I spoke' in Romanian — you already know how" — past tense pattern
6. "One grid. Any verb. Any tense." — matrix demo
7. "Romanian pronunciation is easier than English" — the 5 special characters
8. "This is how Romanians ACTUALLY talk" — contractions lesson preview
9. "32 verbs = 90% of daily speech" — verb card preview
10. "Day 1 vs Day 32" — before/after of what the course covers

**Format:** Screen recording of the interactive site with voiceover. No face needed. 15–60 seconds each.

### 6.3 Communities to Seed

- Reddit: r/romanian, r/languagelearning, r/learnalanguage
- Facebook: Romanian language learner groups, expat groups in Romania
- Discord: language learning servers
- Digital nomad communities (many are in Bucharest/Cluj)

Don't spam. Post genuine value: "I built a free interactive Romanian verb drill — would love feedback." Link to the free tier.

---

## Phase 7 — Launch (Week 4–5)

### 7.1 Soft Launch

1. Enable payments on LemonSqueezy
2. Deploy the full site with access gating
3. Send email to waitlist: "It's live. First 50 buyers get 40% off."
4. Post in communities
5. Early-bird pricing for 1 week: $8.99 Romanian (normally $14.99)

### 7.2 Launch Day Checklist

```
□ Domain pointing to Vercel/Cloudflare
□ HTTPS working
□ LemonSqueezy products created + tested (buy your own product)
□ License key activation flow tested end-to-end
□ Analytics firing
□ OG image showing correctly (test with Twitter Card Validator)
□ Mobile responsive tested on real phone
□ Landing page loads under 2 seconds
□ Legal pages linked from footer
□ Contact email working
□ Error states handled (expired key, network failure, etc.)
```

---

## Phase 8 — Post-Launch & Spanish (Month 2–4)

### 8.1 Build Spanish Module

Using the Romanian module as a template:

```
src/languages/es/
├── index.ts              ← LanguageModule definition
├── pronounce.ts          ← Spanish pronunciation rules
├── audio-manifest.ts     ← ElevenLabs-generated audio map
├── PracticeMatrix.tsx     ← Same structure, Spanish conjugations
├── locales/
│   ├── en.json           ← English translations of Spanish lesson content
│   └── uk.json           ← Ukrainian translations (if needed)
├── lessons/
│   ├── Foundation.tsx     ← Spanish-specific foundation lessons
│   ├── CoreVerbs.tsx      ← 32 Spanish core verbs
│   ├── Grammar.tsx        ← Spanish grammar (articles, adjectives, etc.)
│   ├── Tenses.tsx         ← Spanish tenses
│   ├── Matrix.tsx         ← Matrix lesson explanation
│   └── Reference.tsx      ← Vocab, dialogues, schedule
└── data/
    ├── conjugations.ts    ← Spanish verb conjugation data
    ├── vocabulary.ts      ← 500+ Spanish vocabulary
    ├── dialogues.ts       ← 16 Spanish dialogues
    ├── verbs.ts           ← 32 core verb definitions
    ├── matrices.ts        ← Pre-built matrix examples
    ├── schedule.ts        ← Navigation groups + 32-day plan
    └── onboarding.ts      ← Spanish cognates, first verb, first sentence
```

**Estimated time:** 6–8 weeks. The framework is done — it's pure content creation.

**Register the module:**
```typescript
// src/languages/index.ts
import { ro } from "./ro";
import { es } from "./es";
export const LANGUAGES: readonly LanguageModule[] = [ro, es];
```

That's it. The picker, routing, onboarding, TTS — everything else works automatically.

### 8.2 Iterate Based on Data

After 4 weeks of the Romanian launch, you'll know:
- Conversion rate from free → paid
- Where people drop off in onboarding
- Which lessons get the most views
- How many people complete the 32-day plan

Use this data to refine the Spanish version before building it.

---

## Timeline Summary

| Week | Milestone |
|------|-----------|
| 1 | Product name decided, domain registered, branding implemented |
| 1–2 | Landing page built, legal pages written |
| 2–3 | LemonSqueezy integration, access gating, license key flow |
| 3 | Analytics, deployment pipeline, domain + hosting |
| 3–4 | Content polish, audio check, pre-launch marketing begins |
| 4 | Soft launch to waitlist + communities |
| 5 | Public launch, early-bird pricing |
| 6–12 | Spanish module development + ongoing content marketing |
| 12–16 | Japanese module development |

---

## Budget Estimate

| Item | Cost | Frequency |
|------|------|-----------|
| Domain | $12 | /year |
| Hosting (Vercel free tier) | $0 | — |
| LemonSqueezy | 5% + $0.50 per transaction | per sale |
| Plausible Analytics | $9 | /month |
| ElevenLabs (audio generation) | $22 | /month (during generation only) |
| Email (Buttondown free tier) | $0 | until 100 subscribers |
| Total fixed monthly | ~$9 | |
| Total to launch | ~$50 | one-time |

---

## Revenue Projections (Conservative)

| Month | Scenario | Revenue |
|-------|----------|---------|
| 1 | 30 Romanian sales @ $14.99 (early bird + communities) | ~$450 |
| 2 | 40 sales + some organic traffic | ~$600 |
| 3 | 50 sales + content marketing picking up | ~$750 |
| 4 | Spanish launches @ $49.99, 20 Spanish + 30 Romanian | ~$1,450 |
| 5 | Word of mouth + YouTube compounding, 30 Spanish + 40 Romanian | ~$2,100 |
| 6 | Bundle sales start, email list growing | ~$3,000 |

These are conservative. A single viral TikTok could 10x any of these months.

---

## Implementation Priority (What to Build First)

```
1. ████████████ Branding (name, localStorage keys, meta tags)
2. ████████████ Landing page
3. ████████████ LemonSqueezy integration + AccessGate
4. ████████████ PaywallCard component
5. ██████████   License key entry + validation
6. ██████████   Analytics
7. ████████     Deploy to Vercel + custom domain
8. ████████     Legal pages
9. ██████       OG image
10.██████       Email waitlist
```

Items 1–5 are the critical path. Nothing ships without them.
Items 6–10 are launch-day requirements but can be done in parallel.