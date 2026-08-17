"use client";

import { useEffect, useState } from "react";

/**
 * Cross-fading image backdrop for the auth (login / signup) split layout.
 * Alternates between the Malagasy entrepreneur portrait and the geo-drill-rig
 * blueprint — a slow Higgsfield-style dissolve. Sits behind the gradient +
 * logo overlays (which the parent renders on top). Honours reduced-motion.
 */
const IMAGES = [
  { src: "/landing/auth-hero.jpg", pos: "center" },
  { src: "/landing/auth-rig.jpg", pos: "center" },
];

export default function AuthHero() {
  const [i, setI] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const t = setInterval(() => setI(v => (v + 1) % IMAGES.length), 6500);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      {IMAGES.map((img, idx) => (
        <img
          key={img.src}
          src={img.src}
          alt=""
          aria-hidden
          className="absolute inset-0 w-full h-full object-cover transition-opacity duration-[1400ms] ease-in-out"
          style={{ objectPosition: img.pos, opacity: idx === i ? 1 : 0 }}
        />
      ))}
    </>
  );
}
