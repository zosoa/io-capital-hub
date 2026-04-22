"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: {
        sitekey:   string;
        callback:  (token: string) => void;
        "error-callback"?:   () => void;
        "expired-callback"?: () => void;
        theme?:    "auto" | "dark" | "light";
      }) => string;
      remove?: (widgetId: string) => void;
    };
  }
}

/**
 * Cloudflare Turnstile — the CAPTCHA Supabase Auth integrates with natively.
 *
 * Renders invisible, hands a token back via `onToken`. Signup form passes that
 * token in `supabase.auth.signUp({ options: { captchaToken } })`. Supabase
 * verifies server-side before creating the auth user, blocking bots.
 *
 * The site key is NEXT_PUBLIC_* because it's browser-facing; the matching
 * secret lives inside Supabase auth settings, not in app env.
 */
export default function Turnstile({ onToken }: { onToken: (token: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);

  useEffect(() => {
    const sitekey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;
    if (!sitekey) return; // Not configured yet — signup still works without captcha in dev.

    const renderWidget = () => {
      if (!ref.current || !window.turnstile) return;
      widgetId.current = window.turnstile.render(ref.current, {
        sitekey,
        theme:    "dark",
        callback: onToken,
      });
    };

    if (window.turnstile) {
      renderWidget();
    } else {
      // Load the script once and render on ready.
      const existing = document.querySelector<HTMLScriptElement>(
        'script[src*="challenges.cloudflare.com/turnstile"]',
      );
      if (existing) {
        existing.addEventListener("load", renderWidget, { once: true });
      } else {
        const s = document.createElement("script");
        s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
        s.async = true;
        s.defer = true;
        s.addEventListener("load", renderWidget);
        document.head.appendChild(s);
      }
    }

    return () => {
      if (widgetId.current && window.turnstile?.remove) {
        window.turnstile.remove(widgetId.current);
      }
    };
  }, [onToken]);

  // If sitekey is not configured, render nothing — dev-mode fallback.
  if (!process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY) return null;

  return <div ref={ref} className="flex justify-center my-2"/>;
}
