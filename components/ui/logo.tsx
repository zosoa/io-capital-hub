"use client";

/**
 * CEO Summit logo components.
 *
 * SETUP: copy the CEO Summit logo PNG to /public/ceo-summit-logo.png
 *
 * Until the file is placed, all components fall back to the SVG mark automatically.
 */

import { useState } from "react";

// ── SVG mark ────────────────────────────────────────────────────────────────
// Approximates the CEO Summit visual identity (two arcs + red circle + star).
// Used as fallback when the PNG is not yet placed, and for tiny icon contexts.
export function LogoMark({
  size = 32,
  variant = "light",
}: {
  size?: number;
  variant?: "light" | "dark";
}) {
  const arc    = variant === "light" ? "#FFFFFF" : "#0E1B2E";
  const circle = "#C0392B";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="CEO Summit"
      style={{ flexShrink: 0 }}
    >
      {/* Outer arc */}
      <path d="M6 24C6 13.5 14.5 5 24 5C18 5 12 11.5 12 24C12 36.5 18 43 24 43C14.5 43 6 34.5 6 24Z" fill={arc}/>
      {/* Inner arc */}
      <path d="M12 24C12 16 17 10 24 10C19.5 10 16 16 16 24C16 32 19.5 38 24 38C17 38 12 32 12 24Z" fill={arc} opacity="0.55"/>
      {/* Red circle */}
      <circle cx="32" cy="24" r="14" fill={circle}/>
      {/* 4-pointed star */}
      <path d="M32 16L33.8 22.2L40 24L33.8 25.8L32 32L30.2 25.8L24 24L30.2 22.2Z" fill="white"/>
    </svg>
  );
}

// ── LogoBadge: real image in white pill → falls back to SVG on dark bg ───────
export function LogoBadge({
  height = 40,
  className = "",
}: {
  height?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    // Fallback: compact mark + text in a subtle pill
    return (
      <div
        className={`inline-flex items-center gap-2 flex-shrink-0 ${className}`}
        style={{ height: height + 8 }}
      >
        <LogoMark size={height - 2} variant="light"/>
      </div>
    );
  }

  const pad = Math.round(height * 0.12);
  return (
    <div
      className={`bg-white rounded-lg inline-flex items-center justify-center flex-shrink-0 overflow-hidden ${className}`}
      style={{ padding: pad, height: height + pad * 2, maxWidth: height * 5 }}
    >
      <img
        src="/ceo-summit-logo.png"
        alt="CEO Summit"
        onError={() => setFailed(true)}
        style={{ height, width: "auto", maxWidth: height * 4, display: "block", objectFit: "contain" }}
      />
    </div>
  );
}

// ── LogoImage: real image directly (for light/cream backgrounds) ─────────────
export function LogoImage({
  height = 40,
  className = "",
}: {
  height?: number;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <LogoMark size={height} variant="dark"/>;
  }

  return (
    <img
      src="/ceo-summit-logo.png"
      alt="CEO Summit Investment Hub"
      className={className}
      onError={() => setFailed(true)}
      style={{ height, width: "auto", display: "block" }}
    />
  );
}
