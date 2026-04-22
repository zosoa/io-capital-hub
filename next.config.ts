import type { NextConfig } from "next";

// ─── S-1: Security headers (P1 from audit) ───────────────────────────────────
// Applied to every response. CSP is shipped in Report-Only mode first so we
// can observe violations in Sentry / browser devtools before enforcing — that
// avoids a hard-to-diagnose production breakage from an over-strict policy
// interacting with Supabase, Turnstile, or third-party images.
const contentSecurityPolicy = [
  "default-src 'self'",
  // Next.js ships inline+eval JS for runtime hydration; 'unsafe-inline' is a
  // known Next 15 requirement until we wire nonces end-to-end.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com https://*.vercel-insights.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' data: https://fonts.gstatic.com",
  "img-src 'self' data: blob: https://*.supabase.co https://images.unsplash.com",
  "media-src 'self'",
  "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.resend.com https://challenges.cloudflare.com",
  "frame-src https://challenges.cloudflare.com",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  // Deny iframe embedding (clickjacking defence — stricter than CSP frame-ancestors alone).
  { key: "X-Frame-Options", value: "DENY" },
  // Disable MIME-sniffing so browsers trust our Content-Type headers.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Leak the origin but not the path on cross-origin navigation.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Block powerful APIs we never use (Permissions-Policy replaces Feature-Policy).
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()" },
  // Force HTTPS for 2 years + subdomains; preload-eligible.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  // CSP in *Report-Only* mode first — flip to "Content-Security-Policy" after
  // a week of clean logs. Browsers enforce only the non-Report-Only header.
  { key: "Content-Security-Policy-Report-Only", value: contentSecurityPolicy },
  // Older browsers that don't speak CSP still honour this.
  { key: "X-XSS-Protection", value: "1; mode=block" },
];

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "*.supabase.co" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  async headers() {
    return [
      { source: "/(.*)", headers: securityHeaders },
    ];
  },
};

export default nextConfig;
