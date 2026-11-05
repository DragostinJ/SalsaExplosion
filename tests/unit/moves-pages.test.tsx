import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { Move } from "@/lib/moves/move-schema";

const published: Move[] = [];

vi.mock("@/lib/moves/move-library", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/moves/move-library")>();
  return {
    ...actual,
    getPublishedMoves: () => published,
    // The pages read getVisibleMoves (approved moves, plus drafts only in the local preview)
    getVisibleMoves: () => published,
    songSectionsForMove: () => [{ songId: "me-dicen-cuba", sectionId: "s4", sectionName: "Montuno 1", startTimeSeconds: 155 }],
  };
});

async function approvedMove(): Promise<Move> {
  const { SEEDED_MOVES } = await vi.importActual<typeof import("@/lib/moves/move-library")>("@/lib/moves/move-library");
  return {
    ...SEEDED_MOVES[0],
    reviewedBy: "Maestro Enrique Perez Valdes",
    videos: [
      {
        youtubeVideoId: "abcdefghijk",
        startSeconds: 42,
        channelTitle: "Salsa Explosion",
        title: "Guapea breakdown",
        embeddable: true,
        checkedAt: "2026-11-01T20:00:00.000Z",
      },
    ],
  };
}

describe("dancer move library (/moves)", () => {
  beforeEach(() => {
    published.length = 0;
  });

  it("shows 'coming soon' until a teacher approves a move", async () => {
    const { default: MovesPage } = await import("@/app/moves/page");
    const html = renderToStaticMarkup(<MovesPage />);
    expect(html).toContain("Próximamente");
    expect(html).not.toContain('href="/moves/');
  });

  it("lists approved moves as poster cards that open their page", async () => {
    const move = await approvedMove();
    published.push(move);
    const { default: MovesPage } = await import("@/app/moves/page");
    const html = renderToStaticMarkup(<MovesPage />);
    expect(html).toContain(`href="/moves/${move.id}"`);
    expect(html).toContain(`${move.eightCounts} eight-count`);
  });

  it("builds a page per approved move, with the approved video and song links", async () => {
    const move = await approvedMove();
    published.push(move);
    const page = await import("@/app/moves/[moveId]/page");
    expect(page.generateStaticParams()).toEqual([{ moveId: move.id }]);

    const html = renderToStaticMarkup(await page.default({ params: Promise.resolve({ moveId: move.id }) }));
    expect(html).toContain("Checked on the music by Maestro Enrique Perez Valdes");
    expect(html).toContain("https://www.youtube-nocookie.com/embed/abcdefghijk?rel=0&amp;start=42");
    expect(html).toContain('href="/music/me-dicen-cuba?section=s4"');
  });

  it("opens every move page with a way back to the list (the browser fills in 'Back to …')", async () => {
    const move = await approvedMove();
    published.push(move);
    const page = await import("@/app/moves/[moveId]/page");
    const html = renderToStaticMarkup(await page.default({ params: Promise.resolve({ moveId: move.id }) }));
    expect(html).toMatch(/<nav aria-label="Back"[^>]*>.*href="\/moves".*All moves/);
    expect(html).not.toContain("Back to ");
  });

  it("404s a move that isn't approved", async () => {
    const page = await import("@/app/moves/[moveId]/page");
    await expect(page.default({ params: Promise.resolve({ moveId: "guapea" }) })).rejects.toThrow();
  });
});
