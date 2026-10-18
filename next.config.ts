import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
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
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async headers() {
    const cspDirectives = `
      default-src 'self';
      script-src 'self' 'unsafe-inline' 'unsafe-eval' https://*.clerk.accounts.dev https://clerk.salsaexplosion.co.uk https://js.stripe.com;
      connect-src 'self' https://*.supabase.co https://api.stripe.com https://*.clerk.accounts.dev wss://*.clerk.accounts.dev;
      img-src 'self' data: blob: https://images.unsplash.com https://img.clerk.com https://commondatastorage.googleapis.com;
      style-src 'self' 'unsafe-inline';
      font-src 'self' data:;
      frame-src 'self' https://js.stripe.com https://open.spotify.com https://*.clerk.accounts.dev;
      media-src 'self' blob: https://*.supabase.co;
      object-src 'none';
      base-uri 'self';
      form-action 'self';
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
            value: "camera=(self), microphone=(), geolocation=(), payment=(self 'https://js.stripe.com')",
          },
          {
            key: "Content-Security-Policy-Report-Only",
            value: cspDirectives,
          },
        ],
      },
    ];
  },
};

export default nextConfig;

