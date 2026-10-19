import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://salsaexplosion.co.uk";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/api/webhooks/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
