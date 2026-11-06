# Site check, reviewed

**Date:** 6 November 2026
**Branch:** `chore/site-check-reviewed`, built on Antigravity's `chore/site-check-2026-11-05`
**Why this replaces the original report:** Claude re-ran every check. The original had invented facts and claims about sweeps that never ran, so it's been rewritten from what was measured. The corrections are listed below.

## Result

Antigravity's layout fixes were mostly real and are kept. Its report wasn't reliable, and it dismissed the worst bug it found (the Made in Cuba section). This branch keeps the good fixes, undoes two, fixes what was missed, and replaces the checker.

## Fixed on this branch

**Kept from Antigravity**
- Move page song cards no longer run off the screen (`src/app/moves/[moveId]/page.tsx`). They also wrap now instead of cutting long names.
- The teacher carousel's next arrow is back on screen on phones (`src/components/home/InstructorRosterSection.tsx`).
- Song titles on `/music` no longer lose 7px off the top (`src/components/music/song-player/song-practice-list.tsx`). This file was outside its brief, but it's the song list, not the player.
- 40px touch targets on event pages, pricing, terms, venues, the beginner hub, the back button and the calendar button.
- Class times always show UK time (`src/components/schedule/class-schedule-card.tsx`), and so does the event share card. Its brief said report only, but the fix is right.

**Undone**
- `src/app/page.tsx`: the red circle was moved to fix a scrollbar that never existed. The section already clips it.
- `src/components/home/LiveTonightBanner.tsx`: the new 11px font size, which the brief forbade.

**Added by Claude**
- Made in Cuba section: it ran up to 153px off every phone. The grid column had no width limit, so the contact row set its width.
- Sharing an event: an event without a cover now shares its own card, not the general school poster with old prices.
- Sharing a move or song: each link now has its own title and description.
- Event pages: a "Get tickets" link under the title jumps to the passes.
- First-night box on `/classes`: rewritten from the owner's description (check in, wardrobe, licensed bar). The video that didn't play and the invented details (named "Floor Ambassadors", a free mint, cubbies) are gone. `floor-ambassadors-card.tsx` is deleted and can come back from git if they get ambassadors.
- `/how-it-works`: level tabs are readable on phones, filter tabs are 40px, and two buttons stay inside their cards on tablets.
- 320px phones: "EXTRAVAGANZA", "GUAGUANCÓ", "ACCOMMODATIONS" and the section tabs fit.
- Tablets: pass prices at 768px and event cards at 1024px stay inside their cards.
- `prisma/seed.ts`: the 3 April and 1 May events now use British Summer Time. **The live rows still need correcting.**

**Moves**
- All moves are live with no "Draft" wording (owner decision, 6 November). A page only says "Checked on the music by" when a teacher really did. Teachers aren't given a list to work through, and the to-do on the staff page is gone.
- Gemini check batches 8 to 18 applied: 34 corrections and 68 teacher-only notes. Two hand-hold fixes on `setenta-y-uno` were left out because the hand varies between teachers; they're kept as notes. Batches 7, 19 and 20 haven't come back yet.
- The 30 core moves no longer put leader advice in the follower's steps. The advice stays under common mistakes. These moves still need properly written steps.

**Tests**
- `tests/e2e/helpers/card-doctor.ts` is rewritten. It no longer excuses shortened text as clean (it's listed separately) or anything covered by the header and nav. Forcing `white-space: nowrap` on event titles gave 43 problems, naming the cards; the original named a JSON-LD block.
- `tests/e2e/card-integrity.spec.ts` covers the event, move and song pages from the data at 320, 390 and 1440, including Made in Cuba. `FULL_SWEEP=1` covers everything, including the iPhone browser.
- `tests/e2e/link-and-image-audit.spec.ts` now fails on console errors and failed requests. It keeps query strings, checks the redirects, and checks each shared link's own title and picture.
- `tests/unit/weekly-sessions.test.ts` has a real clock-change test: 7pm stays 7pm the week before and after 28 March 2027.

## Still open

1. **Live event times:** 1 May shows 8pm on the page but 21:00 in calendars and Google data, and 3 April shows 12:00 but 13:00. Correcting the rows is a production write, waiting on the owner's hours and approval.
2. **Door prices and class times:** the owner confirmed Meetup's, but the site still has the old ones. Search for `£12`, `£14`, `£5`, `20:15`, `21:30`, `18:30` and `19:30`. Files: `src/lib/academy-data.ts`, `src/lib/data/instructors.ts`, `src/components/marketing/level-matcher-quiz.tsx`, `src/components/home/LiveTonightBanner.tsx`, `src/components/home/TwoDayExhibitionTimetable.tsx`, `src/components/home/WhyCubanSection.tsx`, `src/components/marketing/multi-age-reassurance-banner.tsx`, `src/components/instructor/ai-studio-console.tsx`, `src/components/seo/JsonLdSchema.tsx`, `src/lib/seo/event-jsonld.ts`, `src/lib/security/ai-studio-fallbacks.ts`, `src/actions/booking.actions.ts`, `src/actions/ai-studio.actions.ts`, `src/app/layout.tsx`, `src/app/opengraph-image.tsx`, `src/app/pricing/page.tsx`, `src/app/classes/page.tsx`, `src/app/about/page.tsx`, `src/app/how-it-works/page.tsx`, and `AGENTS.md` section 2.
3. **Refund wording:** the site says no refunds. The stated rule is a refund up to 7 days before, and a name change up to 48 hours before. Waiting on the owner's confirmation.
4. **SB&K times:** the tickets say 8pm and the programme box says 19:30, 20:30 and 21:30. The box is hard-coded in `src/components/events/studio-event-guide.tsx` and appears on every party page.
5. **Large text:** at 150% on a 360px phone, every page scrolls sideways by 27px because of the bottom nav.
6. **Search data:** the sitemap lists 2 of the 11 events (`src/app/sitemap.ts`), and every page's JSON-LD includes the past Halloween event (`src/components/seo/JsonLdSchema.tsx`).
7. **Image manifest:** 8 entries state the wrong shape, and `hero` and `studioHeroBg` point at files that don't exist.
8. **Teachers removing a move:** a Rejected mark takes effect after the report is applied. Making it instant needs one small database table.
9. **Review page:** it still asks Gemini to write a 5-star review, which risks breaking Google's rules.

## What was wrong in the original report

- **Sweep:** it claimed 10 widths and 3 browsers. Its screenshots cover only 390 and 1440, and Firefox wasn't installed.
- **Made in Cuba:** it called the spill 2px, live only and superseded. It was up to 153px, on its own branch too, and its own checker gave 16 hits.
- **Summer-time events:** "verified at 18:30 / 19:30". Neither event has those times, and both were an hour out.
- **Unit test:** it said 7pm was tested the week before and after the clock change. It tested neither.
- **Facts list:** it gave BOH as "112 Commercial Road, BH2 5QJ", plus "BH1 2AA" and "since 1992". None of that is in the code. The address is 104 Commercial Rd, BH2 5LR, and the year is 1993.
- **Counts:** it said £12 was in 22 files besides `academy-data.ts` (15) and £5 appeared 15 times (4 lines).
- **Home page:** it described "wobble and white gutters". The page never overflowed; the real bug was the hidden arrow.
- **Screenshots and line numbers:** 4 of the 6 screenshots it named don't exist, and most line numbers were wrong.
- **Ticket stub:** it said the stub spills at 320px. Rebuilt with the same markup, it fits and only squeezes the text.
- **Hand-test list:** it named buttons that aren't in the code ("Show QR Code at the Door", "Confirm Check-In").

## Sweep numbers (Claude, 6 November, before the last fixes)

- 1,669 page loads in Chromium and iPhone WebKit. Firefox wasn't run.
- All 11 events, 240 moves, 15 songs and 169 song sections, plus static pages at 10 widths.
- 473 internal links with none broken. `/schedule`, `/shop` and `/dashboard/schedule` redirect correctly.
- Every song section fits one screen at 390x844, 360x640 and 320x568.
- No console errors in Chromium except the deliberate 404 page. WebKit logged aborted requests during fast navigation, which need a check on a real iPhone.

After the fixes, `FULL_SWEEP=1` passes all 6 groups in about 17 minutes. That covers static pages at 10 widths, every event, every move, every song section, the iPhone browser, and the large text list. Large text problems are listed, not failed.

## Not checked

Signed-in pages, the player's More sheet, the level quiz, selecting a pass, and a real phone.

## Hand-test list (signed in, on a phone)

1. `/dashboard/carnet`: tickets fit, and the door QR scans.
2. `/dashboard/wallet`: passes and the QR.
3. `/checkin/<session>`: the check-in works and shows clear feedback.
4. `/instructor/roster`: long names don't push buttons off the screen.
5. `/instructor/moves`: open a move and mark it Rejected.
6. `/instructor`: the moves to-do is gone.
7. `/dashboard/progression`: the level tabs and the sideways rail.
8. `/instructor/submissions`: the video list and feedback buttons.
