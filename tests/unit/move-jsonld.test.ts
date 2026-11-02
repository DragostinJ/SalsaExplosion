import { describe, it, expect } from "vitest";
import { SEEDED_MOVES } from "@/lib/moves/move-library";
import { buildMoveJsonLd, jsonLdHtml } from "@/lib/seo/move-jsonld";

describe("move page structured data", () => {
  const move = { ...SEEDED_MOVES[0], reviewedBy: "Maestro Enrique Perez Valdes" };

  it("describes the move as a lesson from the school, with a breadcrumb", () => {
    const ld = buildMoveJsonLd(move, "https://example.test");
    const [breadcrumb, resource] = ld["@graph"];
    expect(breadcrumb["@type"]).toBe("BreadcrumbList");
    expect(resource).toMatchObject({
      "@type": "LearningResource",
      url: `https://example.test/moves/${move.id}`,
      educationalLevel: move.level,
      provider: { "@id": "https://salsaexplosion.co.uk/#organization" },
      reviewedBy: { "@type": "Person", name: "Maestro Enrique Perez Valdes" },
    });
  });

  it("can never close its own <script> tag", () => {
    const html = jsonLdHtml({ text: "</script><script>alert(1)</script>" });
    expect(html).not.toContain("</script>");
    expect(JSON.parse(html)).toEqual({ text: "</script><script>alert(1)</script>" });
  });
});
