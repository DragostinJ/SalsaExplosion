import type { Move } from "@/lib/moves/move-schema";

const SITE = "https://salsaexplosion.co.uk";

/**
 * Structured data for an approved move page: a breadcrumb (Moves › family › move) and a
 * LearningResource that ties the page to the school, so search engines can show the move as
 * a lesson from Salsa Explosion. Only ever built for moves a teacher approved.
 */
export function buildMoveJsonLd(move: Move, baseUrl: string = process.env.NEXT_PUBLIC_APP_URL || SITE) {
  const url = `${baseUrl}/moves/${move.id}`;
  const name = move.spanishName ?? move.name;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Move library", item: `${baseUrl}/moves` },
          { "@type": "ListItem", position: 2, name: move.category, item: `${baseUrl}/moves` },
          { "@type": "ListItem", position: 3, name, item: url },
        ],
      },
      {
        "@type": "LearningResource",
        "@id": `${url}#move`,
        name,
        alternateName: move.name !== name ? move.name : undefined,
        description: move.summary,
        url,
        inLanguage: "en-GB",
        learningResourceType: "Dance move",
        educationalLevel: move.level,
        teaches: `${move.category}: ${name}`,
        keywords: [move.category, move.level, ...move.tags].join(", "),
        isPartOf: { "@type": "CreativeWork", name: "La biblioteca de pasos", url: `${baseUrl}/moves` },
        provider: { "@id": `${SITE}/#organization` },
        reviewedBy: move.reviewedBy ? { "@type": "Person", name: move.reviewedBy } : undefined,
      },
    ],
  };
}

/** JSON for a <script type="application/ld+json">, with "<" escaped so text can never close the tag. */
export function jsonLdHtml(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
