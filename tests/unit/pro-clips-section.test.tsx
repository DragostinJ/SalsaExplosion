import { describe, it, expect } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ProClipsSection } from "@/components/moves/pro-clips-section";
import { getProClips, type StoredProClip } from "@/lib/moves/pro-clips";

const clip: StoredProClip = {
  id: "paolo-alina-homenaje",
  youtubeVideoId: "Wh1zERcDWGM",
  title: "Paolo & Alina [Homenaje a la Música Cubana - Orq. Mercadonegro] Salsa @WorldLatinCongress",
  channelTitle: "World Latin Congress",
  dancers: ["Paolo", "Alina"],
  songId: "homenaje-a-la-musica-cubana",
  reviewedBy: "Enrique",
  reviewedAt: "2026-11-03T09:00:00.000Z",
  rows: [
    { startSeconds: 36, endSeconds: 46, type: "figure", moveIds: ["exhibela"], mechanics: "Right-to-right hold, she turns to her right on 1-3." },
    { startSeconds: 96, endSeconds: 104.5, type: "figure", moveIds: ["exhibela", "dile-que-no"], mechanics: "Exhíbela again, closed with a dile que no.", musicalMoment: "Brass hit on 1: both freeze" },
  ],
};

describe("Bailado por los pros (move pages)", () => {
  it("shows nothing until a teacher has confirmed a clip for the move", () => {
    expect(renderToStaticMarkup(<ProClipsSection moveId="exhibela" clips={[]} />)).toBe("");
    expect(renderToStaticMarkup(<ProClipsSection moveId="setenta" clips={[clip]} />)).toBe("");
  });

  it("embeds the official player at the first confirmed moment and lists every moment with credit", () => {
    const html = renderToStaticMarkup(<ProClipsSection moveId="exhibela" clips={[clip]} />);
    expect(html).toContain("https://www.youtube-nocookie.com/embed/Wh1zERcDWGM?rel=0&amp;start=36&amp;end=46");
    expect(html).toContain("Paolo &amp; Alina · World Latin Congress");
    expect(html).toContain("https://www.youtube.com/watch?v=Wh1zERcDWGM&amp;t=96s");
    expect(html).toContain("Brass hit on 1: both freeze");
    expect(html).toContain("Checked against the video by Enrique");
  });

  it("only ever reads confirmed data: the stored file is valid and names real moves", async () => {
    const { getAllMoves } = await import("@/lib/moves/move-library");
    const ids = new Set(getAllMoves().map((m) => m.id));
    for (const stored of getProClips()) {
      for (const row of stored.rows) for (const id of row.moveIds) expect(ids.has(id), `${stored.id}: ${id}`).toBe(true);
    }
  });
});
