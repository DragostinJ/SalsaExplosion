import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://salsaexplosion.co.uk";
  const disallowedPrivatePaths = [
    "/api/",
    "/api/webhooks/",
    "/admin/",
    "/instructor/",
    "/checkin/",
    "/dashboard/progression",
    "/dashboard/recaps",
    "/dashboard/wallet",
    "/dashboard/referrals",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/llms.txt"],
        disallow: disallowedPrivatePaths,
      },
      {
        userAgent: [
          "GPTBot",
          "OAI-SearchBot",
          "ChatGPT-User",
          "ClaudeBot",
          "PerplexityBot",
          "Google-Extended",
        ],
        allow: ["/", "/llms.txt", "/dashboard/schedule", "/events", "/pricing", "/venues", "/about"],
        disallow: disallowedPrivatePaths,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
