# Design & roadmap: RitmoFlow as a piece of Cuban art

The goal: make RitmoFlow look and feel like a piece of (Cuban) art, while staying fast and useful:
- dancers practise at home (`/music`, later `/moves`) and check the Thursday/Sunday schedule;
- newcomers find the studio through local search;
- it doubles as a portfolio piece.

Files in this folder:
- [`week-plan-ritmoflow-and-interviews.md`](week-plan-ritmoflow-and-interviews.md): the ideas, the week plan
  and the interview-fundamentals checklist.
- [`nano-banana-landing-photos.md`](nano-banana-landing-photos.md): the photo prompts (round 1: done,
  round 2: graphic assets).

## Status

### Art direction
- [x] 11 editorial photos generated (Nano Banana Pro), optimised (33 MB → 3 MB) into `public/images/editorial/`
      and catalogued in `src/lib/media-manifest.ts` (`MEDIA_MANIFEST.editorial`).
- [x] Three clickable mock-ups on branch `feat/cuban-art-direction-mockups`, all with the same real data:
  - `/mockups`: compare page.
  - `/mockups/icaic`: ICAIC film-poster silkscreen.
  - `/mockups/mediopunto`: stained-glass fans, arches, Havana tiles.
  - `/mockups/gallery`: museum style (today's tokens, pushed further).
- [ ] Owner picks a direction (or a mix: e.g. the Mediopunto song fan inside the Gallery layout).
- [ ] Turn the winner's palette and fonts into design tokens (`globals.css`) and update AGENTS.md section 3
      (colour tokens), since the vibrant palettes go beyond today's obsidian/ivory/crimson/amber.
- [ ] Rebuild the landing page in the chosen direction: editorial photos for mood, real photos for the venue,
      teachers and schedule.
- [ ] Carry the direction into `/music` (song list) and later `/moves`; keep the player's zero-scroll rules.

### Move library
- [ ] Foundation, by Antigravity on `feat/move-library-foundation`: data model, links to song sections,
      "combo fits this section", the AI Studio move maker, and the YouTube candidate finder.
- [ ] Owner or teachers review drafted moves (`reviewedBy`), film short clips (best), or pick curated YouTube
      embeds (start/end, credit, no paywall).
- [ ] `/moves` pages in the chosen art direction.

### Portfolio
- [ ] Case-study page + README with screenshots, demo link and engineering stories.
- [ ] Lighthouse pass after the new landing page.

## Mock-up rules (why they look the way they do)
- **Same facts everywhere:** every schedule, price, venue and song detail comes from `academy-data.ts`,
  the song data and the media manifest, so only the look differs.
- **Real where it matters:** AI photos are mood only. The venue and Maestro Enrique use real photos,
  labelled "Real photo".
- **Natural colour:** photos stay in full natural colour (the visual-audit rule). The poster and halftone
  effects are separate graphic layers, never filters on the photos.
- **Hidden from search:** `/mockups` is `noindex`, isn't in the sitemap, and hides the site header and footer
  (each mock-up has its own).
- **Same discipline as the site:** ≤ 9 font sizes per page, 40 px+ touch targets, and no sideways scroll at
  390 px (checked).
