import type { NextConfig } from "next";

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
  // Next 15 lets middleware run on Node.js runtime instead of Edge, which
  // doesn't expose __dirname. Some transitive dep in @supabase/ssr (or its
  // internals) references __dirname on Vercel's build — Node runtime sidesteps
  // that entirely. The `experimental.nodeMiddleware` flag isn't in the types
  // yet in 15.5.x, so we cast.
  experimental: { nodeMiddleware: true } as NextConfig["experimental"],
};

export default nextConfig;
