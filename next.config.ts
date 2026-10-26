import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 86400,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "commondatastorage.googleapis.com",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react", "sonner", "@clerk/nextjs"],
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      {
        source: "/schedule",
        destination: "/dashboard/schedule",
        permanent: false,
      },
    ];
  },
  async headers() {
    const enforcedCspDirectives = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://clerk.salsaexplosion.co.uk https://*.clerk.com https://cdn.protect.clerk.com https://js.stripe.com https://www.youtube.com https://s.ytimg.com https://www.googletagmanager.com https://www.google-analytics.com;
      worker-src 'self' blob:;
      connect-src 'self' https://*.supabase.co https://api.stripe.com https://*.clerk.accounts.dev wss://*.clerk.accounts.dev https://*.clerk.com https://clerk.salsaexplosion.co.uk https://www.youtube.com https://*.googlevideo.com https://www.google-analytics.com https://analytics.google.com;
      img-src 'self' data: blob: https://images.unsplash.com https://*.clerk.com https://img.clerk.com https://i.ytimg.com https://*.youtube.com https://www.google-analytics.com https://*.stripe.com https://commondatastorage.googleapis.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      font-src 'self' data: https://fonts.gstatic.com;
      frame-src 'self' https://js.stripe.com https://open.spotify.com https://*.clerk.accounts.dev https://www.youtube.com https://www.youtube-nocookie.com;
      media-src 'self' blob: https://*.supabase.co https://commondatastorage.googleapis.com;
      object-src 'none';
      base-uri 'self';
      form-action 'self' https://checkout.stripe.com;
      frame-ancestors 'self';
    `
      .replace(/\s{2,}/g, " ")
      .trim();

    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "SAMEORIGIN",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value: 'camera=(self), microphone=(), geolocation=(), payment=(self "https://js.stripe.com")',
          },
          {
            key: "Content-Security-Policy",
            value: enforcedCspDirectives,
          },
        ],
      },
    ];
  },
};

export default nextConfig;
