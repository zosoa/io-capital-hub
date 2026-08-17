"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/**
 * Minimal cookie-consent banner — only essential cookies are used anyway,
 * but GDPR still requires explicit disclosure + dismissal.
 *
 * Stores decision in localStorage under `ceoio-cookie-consent`:
 *   "essential-only" | undefined (never shown again once set).
 */
const STORAGE_KEY = "ceoio-cookie-consent";

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only render after hydration so SSR output stays the same.
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch { /* private mode — just don't show */ }
  }, []);

  function accept() {
    try { window.localStorage.setItem(STORAGE_KEY, "essential-only"); } catch { /* ignore */ }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookies et confidentialité"
      aria-live="polite"
      className="fixed bottom-4 left-4 right-4 md:left-6 md:right-auto md:max-w-md z-[100]
                 bg-white/98 backdrop-blur-xl border border-[#DADEE4] rounded-xl shadow-2xl
                 p-5 md:p-6"
    >
      <div className="flex items-start gap-3 mb-3">
        <span className="flex-shrink-0 w-8 h-8 rounded-lg bg-[#1F4E79]/10 border border-[#1F4E79]/20 text-[#1F4E79] flex items-center justify-center">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z"/>
          </svg>
        </span>
        <div className="flex-1 min-w-0">
          <div className="text-[#22201B] font-semibold text-sm">Cookies &amp; confidentialité</div>
          <p className="text-[#575249] text-xs leading-relaxed mt-1.5">
            Nous utilisons uniquement des cookies essentiels (authentification, session).
            Aucun cookie de traçage publicitaire.
            {" "}
            <Link href="/legal/privacy" className="text-[#1F4E79] hover:text-[#163C5E] underline">
              En savoir plus
            </Link>.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 pt-1">
        <button
          onClick={accept}
          className="flex-1 bg-[#0C1F36] hover:bg-[#1B3E63] text-white text-xs font-semibold py-2.5 rounded-lg transition-colors">
          J&apos;ai compris
        </button>
        <Link
          href="/legal/privacy"
          className="flex-1 text-center border border-[#DADEE4] hover:border-[#1F4E79]/50 text-[#575249] hover:text-[#22201B] text-xs font-medium py-2.5 rounded-lg transition-all">
          Détails
        </Link>
      </div>
    </div>
  );
}
