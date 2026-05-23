/**
 * Tiny URL-routing helper for the target language.
 *
 * URL convention:
 *   /                 → no target language picked yet (first-visit picker shows)
 *   /<code>           → target language is <code>; lessons render
 *   /<code>#L3        → same, with section anchor preserved
 *
 * If Vite is configured with a non-root `base` (e.g. base="/study/"), all of
 * the above are prefixed by it: /study/, /study/ro, /study/ro#L3. This module
 * strips the base before parsing and re-adds it when navigating.
 *
 * We don't need a router library. Three functions are enough:
 *   - readCodeFromPath()           → returns the code from the URL, or null
 *   - navigateToCode(code)         → replaces the URL and notifies subscribers
 *   - subscribeToPath(fn)          → fires fn() on back/forward navigation
 *
 * The provider that owns target-language state plugs into these.
 */

const PATH_RE = /^\/([a-z][a-z0-9-]*)(?:\/.*)?$/i;

/** Vite's base URL, normalized to start and end with `/`. */
function basePrefix(): string {
  const raw = (import.meta.env?.BASE_URL ?? "/") || "/";
  let b = raw.startsWith("/") ? raw : `/${raw}`;
  if (!b.endsWith("/")) b += "/";
  return b;
}

/** Pathname relative to the base — i.e. everything after Vite's `base`. */
function relativePath(): string {
  if (typeof window === "undefined") return "/";
  const b = basePrefix();
  const p = window.location.pathname;
  return p.startsWith(b) ? `/${p.slice(b.length)}` : p;
}

/** Pull the language code from the URL, or null if at root. */
export function readCodeFromPath(): string | null {
  if (typeof window === "undefined") return null;
  const m = relativePath().match(PATH_RE);
  return m ? m[1].toLowerCase() : null;
}

/**
 * Replace the URL so its first segment (under the base) is `<code>`,
 * preserving any hash. Uses `history.pushState` so the back button works.
 *
 * Scroll reset: when changing language (landing → /ro, or /ro → /es),
 * scroll to top of the new view. Last-position restoration (in LessonNav)
 * handles the case where the user reloads or returns via back-button.
 */
export function navigateToCode(code: string): void {
  if (typeof window === "undefined") return;
  const b = basePrefix();
  const next = `${b}${code}${window.location.hash}`;
  const currentPath = window.location.pathname + window.location.hash;
  if (currentPath === next) return;
  const previousPath = window.location.pathname;
  // Reset scroll FIRST (instant, while still in the old view), then push the
  // URL change. This way the user doesn't see the old view smooth-scroll up
  // before the new view appears — it's just an instant cut to the new view
  // already at the top. Only reset if the view is actually changing.
  if (previousPath !== `${b}${code}`) {
    resetScrollIfNoHash();
  }
  window.history.pushState({ code }, "", next);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

/**
 * Navigate to the bare base URL ("/" or whatever Vite's `base` is), dropping
 * any language code. Used by the header chip to return to the language-picker
 * home page. The hash is intentionally cleared too — the user is going home,
 * not to a section.
 *
 * Scroll reset: always reset to top when going home. The home page is a
 * fresh context; the user isn't returning to a reading position. Reset is
 * done BEFORE the URL change so the user doesn't see the old view smooth-
 * scroll up before the home page appears.
 */
export function navigateToHome(): void {
  if (typeof window === "undefined") return;
  const b = basePrefix();
  if (window.location.pathname === b && !window.location.hash) return;
  resetScrollIfNoHash();
  window.history.pushState(null, "", b);
  window.dispatchEvent(new PopStateEvent("popstate"));
}

/**
 * Scroll to the top of the page — unless the URL has a hash, in which case
 * the browser's native anchor-scrolling (with our scroll-padding-top) will
 * land the user on the right section. Called by navigation helpers above.
 *
 * Critical: CSS `html { scroll-behavior: smooth }` will override the JS
 * `behavior: "auto"` request. To get a truly instant jump (no visible
 * smooth-scroll through the old view's content), we temporarily switch
 * scroll-behavior off, scroll, then restore it on the next frame.
 */
function resetScrollIfNoHash(): void {
  if (typeof window === "undefined") return;
  if (window.location.hash) return;
  const html = document.documentElement;
  const prev = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";
  window.scrollTo(0, 0);
  // Restore on the next frame so the instant jump takes effect first.
  requestAnimationFrame(() => {
    html.style.scrollBehavior = prev;
  });
}

/**
 * Subscribe to URL changes (back/forward, or programmatic via navigateToCode).
 * Returns an unsubscribe function.
 */
export function subscribeToPath(fn: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("popstate", fn);
  return () => window.removeEventListener("popstate", fn);
}

/** Build a URL for `<code>` under the current base, preserving the hash. */
export function buildPathForCode(code: string): string {
  if (typeof window === "undefined") return `/${code}`;
  return `${basePrefix()}${code}${window.location.hash}`;
}

