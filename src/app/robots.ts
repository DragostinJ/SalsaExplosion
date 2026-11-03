import { getSiteOrigin } from "@/lib/safe-url";
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteOrigin();
  const disallowedPrivatePaths = [
    "/api/",
    "/api/webhooks/",
    "/admin/",
    "/instructor/",
    "/checkin/",
    "/dashboard/progression",
    "/dashboard/recaps",
    "/dashboard/wallet",
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
        allow: ["/", "/llms.txt", "/classes", "/events", "/pricing", "/venues", "/about"],
        disallow: disallowedPrivatePaths,
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
