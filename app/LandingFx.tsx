"use client";

import { useEffect } from "react";

/**
 * Landing-page micro-interactions for the editorial redesign:
 *  - adds `.js` to the `.lp` root so scroll-reveal only hides content when JS is active
 *  - IntersectionObserver scroll reveals (`.rv` → `.in`)
 *  - count-up on `[data-count]` stats
 *  - nav border on scroll (`#lpnav`)
 * All scoped to the `.lp` landing container so nothing touches the rest of the app.
 */
export default function LandingFx() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>(".lp");
    root?.classList.add("js");

    const reveal = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const el = e.target as HTMLElement;
            el.style.transitionDelay = `${el.dataset.d || 0}ms`;
            el.classList.add("in");
            reveal.unobserve(el);
          }
        });
      },
      { threshold: 0.14, rootMargin: "0px 0px -8% 0px" }
    );
    document.querySelectorAll<HTMLElement>(".lp .rv").forEach((el, i) => {
      el.dataset.d = String((i % 4) * 90);
      reveal.observe(el);
    });

    const nav = document.getElementById("lpnav");
    const onScroll = () => nav?.classList.toggle("scrolled", window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    const countUp = (el: HTMLElement) => {
      const target = Number(el.dataset.count);
      const dur = 1400;
      const start = performance.now();
      const tick = (now: number) => {
        const p = Math.min((now - start) / dur, 1);
        el.textContent = String(Math.round((1 - Math.pow(1 - p, 3)) * target));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const counters = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            countUp(e.target as HTMLElement);
            counters.unobserve(e.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    document.querySelectorAll<HTMLElement>(".lp [data-count]").forEach((el) => counters.observe(el));

    return () => {
      reveal.disconnect();
      counters.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return null;
}
