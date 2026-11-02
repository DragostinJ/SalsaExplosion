# Interview pack: learn the fundamentals through your own code

57 questions an interviewer could ask, each answered with RitmoFlow as the example, plus 10 algorithm problems
taken from the app.

**How to use it:**
- Cover the answer and say yours out loud first.
- Then open the file it points to.
- To practise for real, ask Claude: *"Quiz me on section C, one question at a time, and grade me."*

---

## A. JavaScript

**A1. The player updates the NOW card many times a second. Why read the YouTube time inside
`requestAnimationFrame` instead of `setInterval`?**
`requestAnimationFrame` runs right before the browser paints, so each read lines up with a frame the user will
see. It also pauses in background tabs, which saves battery. `setInterval` isn't tied to painting: timers drift
and get throttled, and you can read a time the screen never shows. Either way, the time itself always comes from
the media element, never from counting ticks, which is why there's no drift.
*Where:* `src/lib/music/use-youtube-song-clock.ts`, and the frame handler in `song-player-screen.tsx`.

**A2. What's a stale closure, and why does the player keep its per-frame logic in a `ref`?**
A function captures the variables that existed when it was created. A callback registered once keeps seeing old
state. The player stores `frameHandlerRef.current = (time) => {…}` on every render, so the long-lived frame loop
always calls the *latest* function, with current loop and quiz state, without re-subscribing.
*Where:* `song-player-screen.tsx` (`frameHandlerRef`).

**A3. Why does `formatSongTime(11.6, true)` need `+ 1e-6`?**
0.1 has no exact binary representation, so `11.6 - 11` is `0.5999999…`, and `Math.floor(0.5999… * 10)` is 5.
Adding a tiny epsilon before flooring fixes the display without changing real values. Rule: never compare or floor
floats that came out of arithmetic without a tolerance.
*Where:* `src/lib/music/song-timing.ts`.

**A4. `findSegmentIndexAt` starts with `if (!(time > segments[0].startTimeSeconds)) return 0`. Why the double
negative instead of `time <= start`?**
NaN. Every comparison with NaN is false, so `NaN <= 0` is false and NaN would fall through to the binary search.
`!(NaN > 0)` is true, so a broken time safely returns the first section.

**A5. Why did importing one small function from `timba-song-anatomy.ts` put every song into the player's
bundle?**
A bundler can only drop code it can prove is unused and side-effect-free. That module builds Zod schemas and a
big array at the top level, so importing anything from it keeps the whole module. The fix was moving the helpers
into small modules. Lesson: keep heavy data in modules that only data consumers import.

**A6. Why do helpers like `applyBoundaryOverrides` return new arrays instead of changing the old ones?**
React decides what to re-render by reference (`===`). If you mutate the old array, nothing looks changed and the
old data is corrupted for everyone else holding it. Returning new objects keeps the original song data safe; a
test checks the original is untouched.

**A7. The calibration parser matches `{` with `}` but ignores braces inside strings. Why?**
A section name like `"Coro {1}"` would otherwise end a JSON object early. The scanner tracks "am I inside a
string?" and skips escaped quotes. This is the same idea as a tokenizer.
*Where:* `matchingBracket` in `src/lib/music/calibration-report.ts` (calibration-autopilot branch).

**A8. What's the difference between `===` and `Object.is`?**
They differ only on `NaN` (`Object.is(NaN, NaN)` is true) and `+0/-0`. React uses `Object.is` for state and hook
comparisons.

## B. TypeScript

**B1. How do one Zod schema give you both runtime validation and types?**
`SongAnatomySchema` validates pasted JSON at runtime, and `type SongAnatomy = z.infer<typeof SongAnatomySchema>`
derives the static type from the same definition, so they can never drift apart. The importer, the AI Studio
response schema and the tests are all built from it.

**B2. `unknown` vs `any`?**
`any` switches type checking off. `unknown` means "could be anything, prove it before use". The importer's
`extractJson` returns `unknown`, and the code must narrow it (`Array.isArray`, `"song" in parsed`, then Zod)
before touching it. The repo's rule: zero `any`.

**B3. How does `Record<SongDanceGear, string>` help?**
`SongDanceGear` is a union of 8 string literals. A `Record` keyed by it makes TypeScript demand a colour for
*every* gear: add a gear and every palette fails to compile until it's handled. That's exhaustiveness for free.
*Where:* `GearPalette` in the mock-up themes.

**B4. What does `as const` do to `MEDIA_MANIFEST`?**
It makes values read-only and keeps literal types (`"/images/…jpg"` instead of `string`). `MOCKUP_DIRECTIONS` uses
it so `(typeof MOCKUP_DIRECTIONS)[number]["slug"]` becomes the union `"icaic" | "mediopunto" | "gallery"`.

**B5. What's a type guard?**
A function whose return type is `x is T`, such as `.filter((m): m is CurriculumSkillItem => Boolean(m))`. It tells
the compiler the array no longer contains `undefined`.

**B6. Why validate at boundaries, not everywhere?**
Data from outside (pasted JSON, form posts, webhooks, API responses) is untrusted, so validate it once at the
edge. Inside, the types are true, so re-checking just adds noise.

## C. React

**C1. Why does the calibration store use `useSyncExternalStore` instead of `useState` + `useEffect` for
localStorage?**
localStorage is an *external* store. `useSyncExternalStore` lets every component that reads it see the same value
in the same render (no "tearing"), handles server rendering with a server snapshot, and re-renders subscribers
when it changes. Copying it into local state can go stale between components.
*Where:* `src/components/music/song-player/calibration-store.ts`.

**C2. `SectionMovesList` gets `key={segment.id}`. Why?**
A changed key makes React throw away the old component and mount a fresh one, so the open/closed accordion state
resets when the section changes. Without it, the old section's open move would stay open on the new one.

**C3. Server vs client components: why are the mock-up pages server components but the player a client one?**
The mock-ups only render data, so they ship almost no JavaScript. The player needs browser APIs (YouTube iframe,
animation frames, touch, localStorage), so it must be a client component. Pass data *down* from the server
instead of importing big data modules into client code.

**C4. `isGetReady` isn't state. Why not?**
It's *derived* from the current time and the next section's start, so compute it during render. Storing derived
values in state creates two sources of truth that can disagree.

**C5. When do you use a ref instead of state?**
For values that must persist between renders but shouldn't trigger one: the frame handler, "quiz already asked"
sets, timers. State is for what the UI shows.

**C6. How do you avoid layout shift in a live UI?**
Reserve space. The NEXT strip got a fixed height and single-line, truncated text, so "Get ready" and the
final-section box can't change its height. Measure it: the strip used to grow from 55 to 71 px.

**C7. What's WCAG 2.5.3 (label in name), and how did it fail here?**
A control's accessible name must include its visible text, so voice users can say what they see. The song links
had an `aria-label` ("Open practice player for…") that didn't start with the visible title. The fix: drop the
`aria-label` and let the link's text be its name.

**C8. Why does the React Compiler lint rule complain about `Date.now()` in render?**
Render must be pure: the same props give the same output. `Date.now()` differs every call, so the mock-ups compute
upcoming events once at module level instead.

## D. Next.js (App Router)

**D1. How are the 14 song pages built?**
`/music/[songId]` uses `generateStaticParams`, so every song page is prerendered at build time: fast, cacheable,
with no database needed to view a song.

**D2. What protects a server action?**
Server actions are public HTTP endpoints. Each one must check who's calling (role helpers like `requireRole`)
and validate its input with Zod. Middleware alone isn't enough: Clerk now deprecates path-matching protection
because routes can drift from the matcher.

**D3. What changed for `next/image` in Next 16 that bit us?**
`priority` is deprecated in favour of `preload` / `fetchPriority`, and `qualities` defaults to `[75]` (other values
are coerced). For a different photo on phone vs desktop, use `getImageProps()` with `<picture>`, so only one file
downloads.

**D4. Why are fonts loaded with `next/font`?**
They're downloaded at build time and self-hosted, so there's no request to Google at runtime and no layout shift.
CSS variables let each mock-up use its own fonts. When Turbopack's cache got corrupted, the build failed inside
the font loader; clearing `.next/cache/turbopack` fixed it.

**D5. The unsubscribe link: why does GET only show a page while POST does the change?**
Email scanners and link previews follow links with GET. If GET unsubscribed, people would be unsubscribed by
their spam filter. RFC 8058 one-click unsubscribe uses POST.

**D6. How is the daily cron protected?**
`/api/cron/daily` requires `Authorization: Bearer <CRON_SECRET>`, compared with `timingSafeEqual`. If the
secret isn't configured it **fails closed** (401), never open.
*Where:* `src/lib/cron-auth.ts`.

**D7. What does `export const metadata = { robots: { index: false } }` on `/mockups` do, and what else hides
them?**
It emits a noindex meta tag. The pages also aren't in `sitemap.ts` or the site menu, and they're public in
`proxy.ts` so people without an account can open them.

## E. Web and security

**E1. What does a Content-Security-Policy protect against?**
It tells the browser which origins may load scripts, frames, images and so on, limiting the damage of XSS. Ours
allows YouTube frames, Stripe and Clerk. `'unsafe-inline'` weakens it (Next and Clerk need it today; nonces would
remove it).

**E2. Why `Permissions-Policy: camera=(self)` and not `camera=()`?**
The check-in QR scanner uses `getUserMedia`. `camera=()` blocks it everywhere; `(self)` allows our pages only and
still blocks embedded third parties.

**E3. Why sign unsubscribe tokens with HMAC, and why `timingSafeEqual`?**
The HMAC proves we created the link for that user, so nobody can unsubscribe others by guessing ids.
`timingSafeEqual` takes the same time whether the first byte or the last one differs, so an attacker can't
guess the signature byte by byte from response times.

**E4. What's IDOR, and how is it tested?**
Insecure Direct Object Reference: changing an id in a request to reach someone else's data. Every student query is
scoped to the signed-in user, and `tests/unit/idor-ownership.test.ts` proves a student can't read or cancel another
student's booking.

**E5. How is the anonymous practice tracking protected from spam?**
A rate limit (`PRACTICE_EVENT`: 30 requests per 10 minutes) plus Zod-validated, known song and section ids only.

**E6. What's Row Level Security, and why was it a risk here?**
RLS makes Postgres check a policy per row. It was off, so anyone with Supabase's public anon key could use its
REST API on every table. Prisma connects as the table owner, which bypasses RLS, so enabling it with no policies
blocks the public API without breaking the app.

**E7. Why do Clerk *development* keys in production matter?**
Development instances do an extra redirect "handshake" for every new visitor, show development badges and have
limits. Production needs a production instance and domain.

**E8. Why never disable TLS verification, even locally?**
`NODE_TLS_REJECT_UNAUTHORIZED=0` accepts any certificate, so a man in the middle could read or alter traffic,
including secrets. On this machine the fix was trusting the system certificate store (`--use-system-ca`,
`http.sslBackend=schannel`), not turning checks off.

## F. Databases

**F1. How do practice stats avoid one row per click?**
`PracticeSectionStat` has a unique key on `(songId, sectionId, day)`. Each event *upserts* and increments
`loops` or `replays`: one row per section per day.

**F2. `prisma db push` vs migrations?**
`db push` syncs the schema directly; it's quick, but it keeps no history and can't be reviewed or rolled back.
Migrations are SQL files you commit, review and replay. Use migrations once real data and several environments
exist.

**F3. Spot the performance smell in `rankPracticeHotspots`.**
It does `.find` over all songs for every row: O(rows × songs). Fine for 14 songs, but at scale, build a `Map` by id
first for O(1) lookups.

**F4. What would you index for the hotspots page?**
It filters by date range and groups by song and section, so an index on `day` (plus the existing unique
`(songId, sectionId, day)`) keeps it fast.

**F5. How do you make webhooks safe to retry?**
Stripe retries webhooks. Store each processed event id (`ProcessedWebhookEvent`) and skip duplicates, so a retry
can't create a second booking.

**F6. How do class reminders avoid sending twice?**
`Booking.reminderSentAt` is set when a reminder goes out, and the cron only selects bookings where it's null:
idempotent even if the job runs twice.

## G. Testing

**G1. A security test passed while the protection was gone. What was wrong?**
It searched `next.config.ts` for the text `"Content-Security-Policy"`, and a comment contained it. The fix: call
the config's real `headers()` function and assert on what's returned, then check that the test *fails* when the
header is removed.

**G2. How do you test code that depends on randomness?**
Make it deterministic. The tap-tempo tests generate "human" jitter with a seeded pseudo-random generator, so
every run sees the same taps.

**G3. What do you do with a flaky test?**
Re-run it to confirm it's flaky, then find the cause (timing, clipboard permissions, animations) and fix it or
quarantine it. Never just retry forever. Here, an intermittent layout-shift failure turned out to exist on `main`
too, so it went to the backlog instead of blocking a merge.

**G4. Unit vs e2e: what did each catch?**
Unit tests caught logic: importer guards, timeline gaps, label mismatches. Browser measurement caught what code
review couldn't: the NEXT strip jump, text pushed off-screen by a flexbox `min-width`, and overflow hidden by
`overflow-x: hidden`.

**G5. Why test invariants instead of snapshots for the song data?**
Snapshots pinned exact times, so every re-time or calibration broke them. Invariants (continuous, covers the
video, labels match numbers, tempo in range) hold for every correct song and fail only for broken ones.

## H. System design (talk for 5 minutes each)

**H1. Design the practice player.** One clock (the YouTube time); sections as sorted start times (binary search per
frame); NEXT computed from the next start; preview and loop as views over the same data; zero-scroll layout;
YouTube terms as hard constraints; static pages per song.

**H2. Design the AI timing pipeline.** Model with a strict response schema; an importer with Zod and guards for
known failure modes; a benchmark against a reference; human calibration with tap tempo; stale-report protection;
everything versioned in git.

**H3. Turn it into a product for many schools.** Add a `tenantId` on every table; put the data that's now in
code (schedule, songs) into the database; enforce tenant scoping in queries and with RLS; separate Clerk
organizations; give each tenant its own domain or subdomain.

**H4. Class reminder emails at scale.** A cron selects due bookings; a send queue with retries; idempotency via
`reminderSentAt`; unsubscribe and consent (UK PECR: marketing needs opt-in); a dry run when no key is set.

**H5. Combos that fit a song section.** A section has a bar count, and one 8-count is 2 bars, so a combo fits when
the section's bars divide evenly by its bars. Index moves by section; offer combos that fill the section exactly.

## I. Behavioural (STAR answers to prepare)

1. **"Tell me about a hard problem."** The AI timing benchmark: wrong maps → structured output → importer guards
   → Argon 9/11 vs Pro 4/11.
2. **"A bug you found by measuring."** The 96 KB bundle leak, or the NEXT strip measured at 55 → 71 px.
3. **"Working with others / AI."** Reviewing Antigravity's branch: the removed CSP, the test passing on a
   comment, and the brief I rewrote.
4. **"A time you pushed back."** Not importing an AI answer with times past the end of the song, because
   "timing is sacred".

---

## Algorithm problems from the app

Solve each one first, then compare with the real code.

1. **Section at time t.** Given sorted section start times and a time `t`, return the index of the section
   playing. *Target O(log n).* (Binary search for the last start ≤ t.) → `findSegmentIndexAt`.
2. **Validate a timeline.** Given `[start, end]` sections and a duration, report gaps, overlaps, a wrong first
   start or a wrong last end. *O(n).* → `validateSongTimeline`.
3. **Best-fit line.** Given points `(i, tᵢ)`, return the slope and intercept that minimise squared error. Then
   drop points further than ¼ of the slope from the line and refit. → `fitBeatGrid`.
4. **Median of intervals.** Return the median of the differences between consecutive sorted taps, ignoring gaps
   under 0.15 s. *O(n log n).*
5. **Once per key.** Write a function that runs a callback at most once per `(section, kind)` key until reset
   (what the practice reporter does). Sets and closures.
6. **Parse `m:ss.s`.** Turn `"4:28.3"` into seconds; then detect when a number like `428` is really `4:28` typed as
   digits. → `parseRangeSeconds`, `digitsAsMinutes` in the importer.
7. **Matching brackets.** Given a string with several JSON objects, return each object's text, ignoring brackets
   inside strings. *Stack or depth counter.* → `matchingBracket`.
8. **Top-k hotspots.** Given `(song, section, loops, replays)` rows, return the k most-practised sections. Sort vs
   heap: when does a heap win? → `rankPracticeHotspots`.
9. **Clave rotation.** Given 2-3 son clave stroke beats `[2, 3, 5, 6.5, 8]` on an 8-count, produce the 3-2
   version (shift by 4 beats, wrap around). Modular arithmetic. → `getClaveStrokeBeats`.
10. **Combo fits section.** Given section bar counts and combos measured in 8-counts, list for each section every
    combo that fills it exactly, and the minimum number of combos to fill it (a small coin-change problem).
