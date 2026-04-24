"use client";

import { useEffect, useRef } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

/**
 * Small client component that makes the deal-flow sort tab sticky across
 * sessions (audit I-M7).
 *
 *  - On first mount: if the URL has no `?sort=` but localStorage has a
 *    previous pick, replace the URL with the stored value so the SSR-
 *    rendered page re-renders sorted the way the user expects.
 *  - On every URL change with a sort param: persist it to localStorage.
 *
 * Zero UI — lives inside the page tree only to subscribe to URL changes.
 */
const KEY = "dealflow.sort";
const VALID = ["match", "amount_desc", "amount_asc", "newest"] as const;

export default function SortPersist() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rehydratedRef = useRef(false);

  useEffect(() => {
    const urlSort = searchParams.get("sort");

    if (!rehydratedRef.current) {
      rehydratedRef.current = true;
      // One-shot rehydration: if no sort in URL and we have a stored pref,
      // promote it to the URL.
      if (!urlSort) {
        const stored = (() => {
          try { return localStorage.getItem(KEY); } catch { return null; }
        })();
        if (stored && (VALID as readonly string[]).includes(stored)) {
          const params = new URLSearchParams(searchParams.toString());
          params.set("sort", stored);
          router.replace(`${pathname}?${params.toString()}`);
          return;
        }
      }
    }

    // Persist whatever's currently in the URL.
    if (urlSort && (VALID as readonly string[]).includes(urlSort)) {
      try { localStorage.setItem(KEY, urlSort); } catch { /* quota / disabled */ }
    }
  }, [searchParams, pathname, router]);

  return null;
}
