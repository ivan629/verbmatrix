import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./styles/globals.css";
import "./lib/i18n";

// ─── Theme: prevent FOUC ────────────────────────────────────────
// Resolve the user's theme BEFORE React renders, so the page paints
// with the correct background. Mirrors the logic in `context/Theme.tsx`.
(function applyInitialTheme() {
  try {
    const stored = localStorage.getItem("ro-study-theme");
    const pref = stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
    const systemDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches;
    const resolved = pref === "system" ? (systemDark ? "dark" : "light") : pref;
    document.documentElement.setAttribute("data-theme", resolved);
  } catch {
    /* ignore — defaults to light via :root */
  }
})();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
