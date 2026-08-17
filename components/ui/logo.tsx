/**
 * KAPEX — Kapital Exchange Portal logo components.
 *
 * The KAPEX mark is a geometric "K" (navy blade + red diagonal + a red
 * compass node). It's inlined as SVG so it recolors cleanly per background:
 *   variant="dark"  → navy mark, for light backgrounds
 *   variant="light" → white mark, for dark backgrounds (e.g. the navy sidebar)
 * Red always stays red — per brand, red lives only inside the logo.
 *
 * Exports keep the historical names (LogoMark / LogoBadge / LogoImage) so
 * existing imports keep working; KapexLogo is the canonical alias.
 */

const NAVY = "#0C1F36";
const RED = "#D80000";
const WORDMARK_NAVY = "#0E2841";
const WORDMARK_RED = "#C00000";
const DESCRIPTOR = "#808080";

type Variant = "light" | "dark";

// ── The K symbol ─────────────────────────────────────────────────────────────
export function LogoMark({ size = 32, variant = "dark" }: { size?: number; variant?: Variant }) {
  const blade = variant === "light" ? "#FFFFFF" : NAVY;
  return (
    <svg
      width={size * 0.8636}
      height={size}
      viewBox="0 0 863.6 1000"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-label="KAPEX"
      style={{ flexShrink: 0, display: "block" }}
    >
      <path d="M 0.0007,0 L 264.9355,0 L 264.9355,1000 L 0.0007,1000 Z M 569.2486,1000 L 264.9353,600.6505 L 264.9353,214.374 L 863.6001,1000 Z" fill={blade} />
      <path d="M 0,500.8632 L 460.9172,0 L 779.2214,0 L 0,846.7536 Z" fill={RED} />
      <path d="M 67.0086,889.2347 A 70.8544,70.8544 0 1 0 208.7173,889.2347 A 70.8544,70.8544 0 1 0 67.0086,889.2347 Z" fill={RED} />
      <path d="M 137.863,826.3361 C 142.1416,859.139 167.9586,884.9561 200.7615,889.2347 C 167.9586,893.5134 142.1416,919.3304 137.863,952.1333 C 133.5843,919.3304 107.7673,893.5134 74.9644,889.2347 C 107.7673,884.9561 133.5843,859.139 137.863,826.3361 Z" fill={blade} />
    </svg>
  );
}

// ── Full horizontal lockup: mark + KAPEX wordmark (+ optional descriptor) ─────
export function KapexLogo({
  height = 34,
  variant = "dark",
  showDescriptor = true,
  className = "",
}: {
  height?: number;
  variant?: Variant;
  showDescriptor?: boolean;
  className?: string;
}) {
  const kap = variant === "light" ? "#FFFFFF" : WORDMARK_NAVY;
  const desc = variant === "light" ? "rgba(255,255,255,0.62)" : DESCRIPTOR;
  return (
    <span className={`inline-flex items-center ${className}`} style={{ gap: height * 0.28, lineHeight: 1 }}>
      <LogoMark size={height} variant={variant} />
      <span style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: height * 0.09 }}>
        <span style={{
          fontWeight: 800, fontSize: height * 0.66, letterSpacing: "-0.01em",
          lineHeight: 0.9, fontFamily: "'Inter', system-ui, sans-serif",
        }}>
          <span style={{ color: kap }}>KAP</span><span style={{ color: WORDMARK_RED }}>EX</span>
        </span>
        {showDescriptor && (
          <span className="kapex-descriptor" style={{
            fontSize: Math.max(7, height * 0.185), letterSpacing: "0.12em", textTransform: "uppercase",
            color: desc, fontWeight: 600, whiteSpace: "nowrap",
          }}>
            Kapital Exchange Portal
          </span>
        )}
      </span>
    </span>
  );
}

// ── Back-compat aliases ──────────────────────────────────────────────────────
export function LogoBadge({ height = 34, className = "", variant = "light" as Variant, showDescriptor = true }:
  { height?: number; className?: string; variant?: Variant; showDescriptor?: boolean }) {
  return <KapexLogo height={height} variant={variant} showDescriptor={showDescriptor} className={className} />;
}

export function LogoImage({ height = 34, className = "" }: { height?: number; className?: string }) {
  return <KapexLogo height={height} variant="dark" className={className} />;
}
