# Optimisation pass and roadmap (3 November 2026, evening)

Branch: `feat/optimise`, on top of `feat/round6-and-automation`. Everything below is measured on a production build (`next build` + `next start`), in Chromium at phone size (390×844) with the CPU slowed 4×, unless it says otherwise.

## What changed

### Speed

| Page | JavaScript before | After |
|---|---|---|
| Home | 599 KB | 518 KB |
| /moves | 667 KB | 559 KB |
| /music | 709 KB | 600 KB |
| /music/me-dicen-cuba (player) | 623 KB | 546 KB |
| /classes | 643 KB | 582 KB |
| **Average over 20 public pages** | **635 KB** | **548 KB (−14%)** |

Transfer sizes, compressed. Layout shift (CLS) was already 0 on every page and still is; the largest paint is under 1.2 s on every page once the image cache is warm.

Where the 87 KB went:

- **Every song's timing data** (159 KB minified) reached the browser through two routes: `move-schema.ts` took one enum from `timba-song-anatomy.ts`, and the song list was imported by client components. Next.js prefetches linked pages, so it loaded almost everywhere. The enum moved to `song-dance-gear.ts`; the server pages render `<SongPracticeList />` and pass it in.
- **zod** (about 100 KB minified) came with `move-schema.ts` (via the /moves filters) and `cuban-curriculum-2027.ts` (music hub, practice player). The family list moved to `move-categories.ts` and the curriculum schemas to `cuban-curriculum-schema.ts`.
- **The media manifest** came with the root error boundary (my round 6 change) and the home page's teacher roster. Both now get just the values they show.
- **/moves HTML** went from 136 KB to 78 KB: the page sent every move whole (steps, mistakes) to the filters, which only need the card fields.
- **The hero photo** was 2.6 MB on disk (2400×1792 at near-maximum quality). Re-encoded to 314 KB at the same size; an unused byte-identical copy is gone.

### Moves

- **The notes Gemini wrote were being thrown away.** The move schema had no `notes` field, so every import since batch 1 dropped them, including every "UNSURE: confirm with the teachers…". The field is back (teachers only, never sent to dancers, not part of the approval fingerprint), and all 210 drafts have their notes again, recovered from the original Gemini files. **107 drafts say UNSURE.** The review desk shows the note above each move and can list only those.
- **Importer for tonight's Gemini check:** `scripts/apply-move-check.ts` (see `docs/move-library/gemini-move-check.md`). It applies a fix only when its text is found exactly once and the move still validates, never touches a move a teacher has reviewed, and turns skipped fixes and flags into notes.
- **Library health check** (`move-health.ts`, in the tests): no counts past a move's length, no repeated labels, no prerequisite loops, no unknown prerequisites, no duplicate names. The 240 moves pass today.

### Less work for the teachers

- **Festival reminders**: two days before a published festival or party, everyone with a paid pass gets one email with the day, time, venue, their passes (in Mi carnet, to show at the door) and a link to the programme.
- **Recap nudge**: the morning after class, each teacher whose class has no recap yet gets one email listing those classes and a link to add the recap.
- Both run in the existing daily job, use a one-day window (so each event or class is emailed once without storing anything), skip people who stopped reminders, and never send without an unsubscribe link.

### Class lists that assumed classes are made by hand

Now that classes are created four weeks ahead, two teacher lists would have gone wrong:

- **The roster and door check-in** loaded the 25 oldest classes ever. After about five weeks of weekly classes it would only show old ones and tonight's class would be missing. It now shows the last 7 days (for recaps) and what's coming, and opens on tonight's class.
- **The recap picker** took the 15 newest classes with no upper limit: soon 15 future classes with nothing to recap. It now takes the 15 most recent that have started.

### Accessibility and routing

- An axe scan of every public page at phone and desktop size found four kinds of issue. Fixed: the home page's swipeable illustration row wasn't keyboard-focusable. Not ours: YouTube's player internals, and Clerk's development-mode badge (see below).
- **Unknown addresses showed the sign-in page** (the proxy asked for sign-in on anything not on its public list), so typos, old links and bots got a sign-in wall and search engines saw sign-in pages for broken links. They now get the normal "page not found". Every real route keeps its protection, and a test fails if a route folder is added without being listed.

## Needs a decision or a setting

1. **`NEXT_PUBLIC_APP_URL` in Vercel** is `https://SalsaExplosion.vercel.app`, which returns 404 (the app is `salsa-explosion.vercel.app`). Canonical links, the sitemap and, most likely, the Stripe return address after paying for a festival pass all point there. Set it to `https://salsa-explosion.vercel.app` and redeploy.
2. **Clerk runs on a development instance on the live site** (`pk_test_…`, `*.clerk.accounts.dev`): the sign-in box shows Clerk's orange "Development mode" badge, and development instances aren't meant for real users. A production instance needs a domain you own. `salsaexplosion.co.uk` currently forwards to the Facebook group; pointing it at Vercel would fix the domain, Clerk and the canonical links at once.
3. **Email**: reminders, the new cancellation and lesson-request emails, and the Monday digest only go out with `RESEND_API_KEY`, `EMAIL_FROM` and `ADMIN_EMAILS` set in Vercel.
4. **Weekly classes**: after deploying, press "Add the next 4 weeks now" on /admin/classes once (the daily job does it from then on).
5. **/review** is linked from the public footer but needs sign-in.

## Ideas for later, in the order I'd do them

### Less work for Enrique
1. **"We miss you" email**: a dancer who came three times and then missed three weeks gets one friendly note (with an unsubscribe). Retention is where a small school wins or loses.
2. **Monday poster pack**: the Instagram posters on /cartel are already generated; email them to Enrique every Monday so posting is one tap. Posting automatically needs a Meta business app, which is a bigger step.
3. **Beginners who came twice**: list them in the Monday digest, so Enrique can say hello by name on Thursday.

### Moves
1. **Tonight's check, then Enrique's review in priority order**: Beginner moves first, then the 107 marked UNSURE. A one-tap "Approve" on the phone, and corrections spoken instead of typed, would make 210 reviews realistic.
2. **This week's moves**: the teacher picks the class's moves and songs; dancers see them on /classes and in the reminder email, and practise them in the player.
3. **Rueda flashcards with spaced repetition** from the 100+ rueda calls (dancers say which calls they know; the app asks the weak ones more often).
4. **Videos on move pages** from the Move Mapper's pro clips, once the gold-set score is good enough.
5. **Search by every name a move goes by** (Enchufla / Enchúfla / Enchufle, Sácala / Exhíbela).

### Speed
1. **Clerk on every page** is the biggest remaining cost: about 218 KB of the ~550 KB, loaded even for visitors who never sign in. Loading it only on the sign-in, account and staff pages needs care (the header shows the account button), so it belongs on its own branch with the sign-in flows tested.
2. **The practice player** still blocks the main thread for ~700 ms on a slow phone while it starts. Worth profiling: the moves list and the more-sheet could render after the video is ready.

### Platform (parked earlier, still right)
- Song maps in the database, so teachers can add songs without a deploy (the first SaaS step).
- More than one school (tenants), only once a second school is interested.
- The on-screen count (1-2-3 · 5-6-7) and clave pulse, once the beat timing is exact.

## Checks on this branch

- `npx tsc --noEmit`: clean
- `npx eslint src tests scripts --quiet`: clean
- `npm test`: 91 files, 567 tests, all passing
- `npm run build`: 0 warnings
- `npm run audit:design`: all routes pass
- `npx playwright test`: 110 passed, 4 skipped (the signed-in tests need a test login)
