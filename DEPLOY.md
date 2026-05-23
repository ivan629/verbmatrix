# VerbMatrix — Production Deployment Guide

This is the end-to-end runbook for taking VerbMatrix from local code to a
live, monetized website at `verbmatrix.com`. Order matters — do each step
before the next.

---

## Prerequisites

- [ ] A bank account or PayPal in your name that can receive international payouts
- [ ] Government-issued photo ID (passport works)
- [ ] Domain registered: `verbmatrix.com` (Namecheap, Cloudflare Registrar, or similar)
- [ ] GitHub account with this repo pushed to a private repository
- [ ] Vercel account (free tier is fine — sign up with GitHub)

---

## 1. Set up LemonSqueezy

1. Sign up at <https://lemonsqueezy.com> as an individual seller.
2. Submit verification — passport + address proof. Approval takes 1-3 days.
3. Set **PayPal** as your payout method (easier to change the underlying
   bank later than re-verifying with LemonSqueezy).
4. Create a Store. Name it "VerbMatrix" or similar.
5. Create two Products:
   - **Romanian Course** — One-time payment, $14.99 USD, license keys
     enabled (unlimited activations, no expiry).
   - **All Access** — One-time payment, $99.99 USD, license keys enabled.
6. From each product page, copy these values for the env vars:
   - **Buy Link** → goes into `VITE_LS_CHECKOUT_RO` / `VITE_LS_CHECKOUT_ALL`
   - **Product ID** (the number in the URL `/products/12345`) → goes into
     `VITE_LS_PRODUCT_RO` / `VITE_LS_PRODUCT_ALL`
7. Buy your own product (use a test card or your real card — you can refund
   yourself afterward). Verify the email arrives with a license key.

---

## 2. Analytics (Umami Cloud — already set up)

VerbMatrix uses Umami Cloud (EU region) for privacy-friendly analytics. The
tracking script is already in `index.html` and wired to website ID
`8f88f6b9-ab5d-4392-9d4f-8316bce875c0`.

1. Dashboard: <https://eu.umami.is/>
2. Free tier covers 10,000 events/month — plenty for launch traffic.
3. Custom events fire automatically (`onboarding-complete`, `paywall-seen`,
   `purchase-click`, `license-activated`, `lesson-completed`) once the site
   is live. No additional code or goal setup required.
4. Once data starts flowing, build a conversion funnel report in Umami:
   Reports → New Report → Funnel → add each event in order.

---

## 3. Deploy to Vercel

1. Push this repo to GitHub (private repo).
2. Go to <https://vercel.com/new> → Import the GitHub repo.
3. Framework: Vite (auto-detected). Build command and output dir come from
   `vercel.json` — leave defaults.
4. Add environment variables (Project Settings → Environment Variables):
   ```
   VITE_REMOTE_VALIDATION  =  true
   VITE_LS_CHECKOUT_RO     =  https://YOURSTORE.lemonsqueezy.com/buy/UUID
   VITE_LS_CHECKOUT_ALL    =  https://YOURSTORE.lemonsqueezy.com/buy/UUID
   VITE_LS_PRODUCT_RO      =  12345
   VITE_LS_PRODUCT_ALL     =  67890
   ```
   **Do NOT set** `VITE_DISABLE_PAYWALL=true` in production.
5. Click Deploy. First build takes ~2 minutes.
6. Once deployed, you get a URL like `verbmatrix.vercel.app`.

---

## 4. Connect your domain

1. In Vercel: Project → Domains → Add `verbmatrix.com` and `www.verbmatrix.com`.
2. Vercel shows DNS records to add at your registrar.
3. At your domain registrar: add the A and CNAME records Vercel provides.
4. Wait 5-30 minutes for DNS propagation.
5. HTTPS certificate is auto-provisioned by Vercel.

---

## 5. Supporting assets (✓ included in this repo)

These ship in the `public/` folder and don't need any further work to launch:

- **`favicon.svg`** + `favicon-16x16.png`, `favicon-32x32.png`, `favicon-192x192.png`,
  `favicon-512x512.png`, `apple-touch-icon.png` — the gold ★ glyph on cream background.
  Matches the brand mark used throughout the textbook.

- **`og-image.png`** (1200×630) — social-share preview showing the
  VerbMatrix wordmark, the verb matrix grid (with the present-tense row
  highlighted in gold), and the tagline *"One verb. Nine sentences. Any language."*
  Used by Twitter/X, Facebook, LinkedIn, Slack, Discord, iMessage previews.

- **`site.webmanifest`** — PWA manifest so the site can be installed to phone
  home screens with the right name, theme color, and icons.

If you want to redesign any of these, edit the SVG source (`favicon.svg`,
`og-image.svg`) and re-render the PNGs with any SVG-to-PNG tool
(<https://cloudconvert.com/svg-to-png> works, or `cairosvg` in Python).

---

## 6. Pre-launch smoke test

Open your deployed site in an **incognito window** to skip cached data:

- [ ] Landing page loads, all language cards visible, pricing correct
- [ ] Click Romanian card → URL becomes `/ro`, onboarding starts
- [ ] Complete onboarding → textbook opens with sidebar
- [ ] Scroll through free lessons (matrix, principles, L0, L1) — all visible
- [ ] Continue scrolling → PaywallCard appears at L2
- [ ] Click "Get full access $14.99" → opens LemonSqueezy checkout in new tab
- [ ] Click "I have a key" → modal opens
- [ ] Enter a random string → see error "This key isn't valid"
- [ ] Enter your real license key from your test purchase → "Validating…" → success → all lessons unlock
- [ ] Refresh the page → still unlocked, sidebar shows completion dots if any
- [ ] Click `/terms`, `/privacy`, `/refund` → legal pages render with back-link
- [ ] Open on phone → mobile layout works, sidebar toggles
- [ ] Open Umami dashboard → see your test sessions

If all 12 pass, you're live.

---

## 7. Post-launch

- [ ] Email yourself a test purchase confirmation, verify the license key works
- [ ] Refund your test purchase via LemonSqueezy dashboard
- [ ] Confirm on next page load, the key is auto-revoked and paywall reappears
- [ ] Build a Umami funnel report with steps: `pageview /` → `onboarding-complete` → `paywall-seen` → `purchase-click` → `license-activated` — this gives conversion rate over time

---

## Troubleshooting

**Paywall doesn't appear after L1:** Check `FLAGS.paywallEnabled` resolves
to `true`. In production this means `VITE_DISABLE_PAYWALL` is NOT set.

**License key validation always fails:** Check the Network tab — the
`POST /v1/licenses/validate` request should return `valid: true` for real
keys. If it returns `valid: false`, the key has been refunded, expired, or
the product ID in your env var doesn't match the product the key was issued
against.

**"This key is for a different course" on a valid key:** The `meta.product_id`
returned by LemonSqueezy doesn't match `VITE_LS_PRODUCT_RO` (or `_ALL`).
Verify those env vars match the dashboard.

**Custom events not showing in Umami:** Confirm the Umami script
loads (Network tab — should see a request to `cloud.umami.is/script.js`).
Browsers with aggressive blockers (Brave, Firefox strict mode, uBlock Origin)
may block it — that's expected and not actionable.
