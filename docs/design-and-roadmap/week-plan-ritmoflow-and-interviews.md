# Next week: RitmoFlow as a piece of art + interview fundamentals

Rhythm of every day:
- **Morning (2 h): learn** one fundamentals topic. Claude quizzes you on it, using RitmoFlow's own code.
- **While you study:** a Gemini job runs in AI Studio (songs, photos, move drafts).
- **Afternoon: build** one feature with Claude on its own branch. You test the Vercel preview, then approve.
- **Night:** Antigravity runs a brief Claude writes.
- **Daily:** 1–2 algorithm problems (20–30 min).

---

## 1. Ideas: make it look like Cuban art

### Art directions to try (Claude builds 3 clickable mock-ups, you pick one)
1. **ICAIC poster.** Inspired by 1960s–70s Cuban film posters (silkscreen, by artists like Eduardo
   Muñoz Bachs, René Azcuy, Antonio Reboiro). Flat bold colour fields, halftone photos, huge hand-drawn
   type, playful cut-out shapes. Modern, loud, unmistakably Cuban.
2. **Mediopunto.** The stained-glass fan windows and hydraulic floor tiles of Havana homes: geometric
   colour shapes as section dividers and frames, light "falling" through coloured glass on photos.
   Elegant and warm.
3. **Gallery.** Today's direction pushed further (The Place): huge editorial serif type, lots of black,
   photos like artworks with captions, a museum-label feel. Calm, premium.

### Ingredients that make a site feel "arty"
- **Big editorial type** (one display font with character + one clean text font), asymmetric grids, text
  that crosses images.
- **Texture:** film grain or noise overlay, halftone or duotone photo treatment (CSS blend modes or SVG
  filters), paper and silkscreen feel.
- **Motion:**
  - scroll-driven reveals (CSS scroll-driven animations; add a fallback for older browsers);
  - page transitions (View Transitions API);
  - a marquee of coro lyrics;
  - GSAP for richer sequences (free, including its plugins).
- **A brand motif:** the clave. Five dots in the 2-3 pattern as the logo mark, dividers, loading
  indicator and hover rhythm.
- **Real content as art:** the song maps themselves (coloured section bars) are beautiful. A big
  "anatomy of a timba song" poster on the landing page.
- **Keep it fast:** art that loads in 1 s on a phone beats art that loads in 5.

### Tools to see and design the visuals
| Tool | What for |
|---|---|
| **Vercel preview + Toolbar comments** | Every branch gets a live link; you can pin comments on the page |
| **Responsively App** (free) or **Polypane** | See the site on many phone and desktop sizes side by side |
| **Claude mock-ups** (artifact pages) | 3 art directions in an afternoon, clickable, before any real code |
| **Google Stitch / v0** | Quick AI layout ideas to steal from |
| **Figma** (+ the Figma connector) | If you want to hand-tune a design. Note: the connector failed to connect this session |
| **Awwwards, Godly, Siteinspire** | Inspiration: search "editorial", "museum", "music festival" |
| `npm run audit:design` | The project's own screenshot + design-rule checker (desktop + 390 px) |

---

## 2. Idea: the move library (shines, rumba, body movement, combos)

### What it is
A section `/moves` with a page per move:
- name (Spanish + English), category, level;
- counts (how many 8-counts);
- a count-by-count breakdown for leader and follower;
- common mistakes, prerequisites, variations;
- the rueda call and hand signal;
- **videos;**
- **"practise it in these songs"**, with links to the song sections that recommend it.

Categories:
- Casino figures and rueda calls
- Shines / suelta (footwork)
- Body movement: despelote, tembleque, cintura, ribcage, shoulders
- Rumba: guaguancó, yambú, columbia
- Afro-Cuban Orishas (ask the owner first)
- Son, reparto

### The clever part only RitmoFlow can do
Songs already know their **bar counts** per section (from the song maker). One 8-count = 2 bars, so the app
can say **"this combo fits this section exactly"**: a 16-bar montuno fits an 8 × 8-count combo. Combos
become musical, not random.

### Where the content comes from
1. **Text:** a "move maker" in AI Studio drafts entries in a fixed format, like the song maker (structured
   output, same importer idea). **The owner or a teacher must check every move** before it goes live,
   because AI gets dance details wrong.
2. **Videos, best option:** the owner films 10–20 s phone clips of each move (front and side). That's
   content the studio owns, it's consistent, and it's a great portfolio story. 3–4 moves a week adds up.
3. **Videos, quick option:** embed existing YouTube tutorials (rules below), cut to just the moment that
   shows the move, using the player's start/end times.

### YouTube rules for embedding other people's videos (short version)
- **Allowed:** embedding public videos with YouTube's official player when the uploader allows embedding
  (most do). You may set a **start and end time** to show only the relevant part.
- **Not allowed:**
  - downloading, re-uploading, cutting or editing their video;
  - hiding or covering the player, or making it smaller than 200 × 200;
  - removing YouTube branding.
- **No paywall:** don't put embedded third-party videos behind a paid membership. YouTube's developer
  policies don't allow charging for access to YouTube content. A free library is fine.
- **Credit and courtesy:** show the channel name with a link, and ideally message the creator. Many dance
  teachers are happy for the exposure, and they can turn embedding off at any time. Our weekly video check
  would then flag it.
- **Finding them:** don't let an AI "remember" video links: Gemini already invented a video id once
  (`vanvantemba`). Claude can write a small script that searches with the **official YouTube Data API**
  (your API key) and lists real candidates (title, channel, length, embeddable yes/no) for you to pick from.
- Not legal advice: read YouTube's *API Services Terms* and *Developer Policies* once before launch.

---

## 3. Idea: make it a portfolio piece

- **A case-study page** (`/about-this-project` or on your own portfolio site):
  - the problem, the architecture diagram, and the AI pipeline (AI Studio → importer → calibration →
    media clock);
  - the numbers: 350 tests, e2e on every song, −96 KB on the player, Lighthouse scores.
- **Engineering stories employers love** (each one is also an interview answer):
  1. Benchmarking AI models for music timing: Gemini web guessed from captions; Argon won 9/11 vs 4/11.
     Then building guards for its mistakes ("1:18" typed as 118, invented video ids, double-time BPM).
  2. Finding a 122 KB bundle leak caused by two imports.
  3. Measuring a UI jump frame by frame (the NEXT strip) instead of guessing.
  4. Working safely with AI agents: branches, quality gates, never disabling TLS, RLS security review.
- **README:** screenshots and GIFs, a live demo link, a recruiter demo account, CI badges.
- **A 2-minute Loom walkthrough** on your phone at the studio.
- **For freelancing:** "I build booking, ticketing, payments and practice tools for dance schools,
  gyms and studios." Multi-school support (parked idea #13) turns it into a product you can sell.

---

## 4. The week, day by day

### Mon 2 Nov: JavaScript core
- **Learn:** event loop, call stack, closures, `this`, promises and async/await, prototypes, `==` vs `===`,
  hoisting, ES modules.
- **Gemini:** re-time Agua Pa' Yemayá + De La Timba a Pogolotti (2 per message).
- **Claude:** review and merge Antigravity's branches (hardening-v2, overnight-polish); run the RLS SQL
  together; import any calibration reports you have.

### Tue 3 Nov: TypeScript + React
- **Learn:**
  - TS: generics, narrowing, discriminated unions, `unknown` vs `any`, utility types, Zod at the
    boundaries.
  - React: rendering, keys, hooks rules, `useEffect` pitfalls, memoisation, Server vs Client
    Components.
- **Gemini:** photos 1–5 from `nano-banana-landing-photos.md`.
- **Claude:** 3 art-direction mock-ups (ICAIC poster / Mediopunto / Gallery). You pick one.

### Wed 4 Nov: Next.js App Router
- **Learn:** server components, server actions, caching and revalidation, SSG/SSR, route handlers,
  middleware (`proxy.ts`), streaming, Suspense.
- **Gemini:** photos 6–10; re-time Me Dicen Cuba + Esto Te Pone La Cabeza Mala.
- **Claude:** build the chosen direction on the landing page (branch `feat/art-direction`).

### Thu 5 Nov: web + security
- **Learn:**
  - HTTP methods, status codes and caching headers; CORS; cookies vs tokens;
  - OWASP Top 10: XSS, CSRF, IDOR (in AGENTS.md), SQL injection;
  - RLS (you just did it!);
  - Core Web Vitals (LCP, CLS, INP).
- **Gemini:** first move-maker drafts (after Claude sets it up).
- **Claude:** move library v1: data format, `/moves` pages, links to song sections, "fits this section".

### Fri 6 Nov: databases
- **Learn:** SQL joins, GROUP BY, indexes, transactions, N+1 queries, normalisation, Prisma relations,
  migrations vs `db push`.
- **Gemini:** more move drafts; re-time Tremenda Pinta.
- **Claude:** YouTube search script + curated embeds with start/end times, credits and the weekly
  health check.

### Sat 7 Nov: testing + front-end system design
- **Learn:**
  - unit vs integration vs e2e, what to mock;
  - design exercises: "design a class booking system", "design a video practice player", "design
    rate limiting".
- **Claude:** case-study page + README with screenshots; Lighthouse pass.

### Sun 8 Nov: behavioural + mock interview
- **Learn:** write 5 STAR stories (section 3 list); do a 45-min mock interview with Claude (technical +
  behavioural); review the week and plan the next.

---

## 5. Interview fundamentals checklist (tick as you go)

- [ ] JS: event loop, closures, `this`, promises, async/await, prototypes, scope, modules, array methods
- [ ] TS: generics, narrowing, unions, `unknown`, utility types, type vs interface
- [ ] React: state, props, effects, refs, keys, memo, context, controlled inputs, rendering performance
- [ ] Next.js: server/client components, server actions, caching, routing, middleware, deployment
- [ ] CSS: flexbox, grid, specificity, responsive design, stacking context, animations
- [ ] Web: HTTP, REST, status codes, caching, CORS, cookies, auth (sessions, JWT, OAuth)
- [ ] Security: XSS, CSRF, IDOR, injection, secrets, RLS
- [ ] Databases: SQL, joins, indexes, transactions, N+1, ORM trade-offs
- [ ] Testing: pyramid, mocking, flaky tests, e2e
- [ ] Performance: Core Web Vitals, bundle size, lazy loading, images
- [ ] Accessibility basics: semantic HTML, labels, keyboard, contrast
- [ ] Git: branching, rebase vs merge, resolving conflicts, CI
- [ ] Algorithms: big-O, arrays and strings, hash maps, two pointers, sliding window, stack and queue,
      binary search, recursion, BFS/DFS (a well-known list like "NeetCode 150" is a good path)
- [ ] Behavioural: 5 STAR stories, "why remote", "tell me about a bug", "a time you disagreed"

---

## 6. Copy-paste prompts

### For Claude (learning)
- "Quiz me on JavaScript closures: 8 questions, one at a time, use RitmoFlow code where you can, grade
  each answer and explain what I missed."
- "Explain `src/components/music/song-player/calibration-store.ts` like a senior developer in an interview:
  why `useSyncExternalStore`, what could break, how you'd test it."
- "Give me one algorithm problem at easy-medium level. Don't show the solution until I paste mine."
- "Mock interview: 30 min technical (React/Next.js) + 15 min behavioural. Be strict, score me at the end."
- "Turn the 'Argon benchmark' story into a 2-minute STAR answer, then ask me follow-up questions an
  interviewer would ask."

### For Claude (building)
- "Make 3 art-direction mock-ups for the landing page: ICAIC poster, Mediopunto, Gallery. Use the
  photos in <folder>."
- "Build move library v1 on a new branch: data format, /moves pages, links to song sections, the
  'combo fits this section' feature."
- "Set up the AI Studio 'move maker': system instructions, response schema and importer, like the song maker."
- "Write the YouTube search script for move videos and the curated-embed format with start/end and credits."
- "Write the case-study page and a new README with screenshots."

### For Gemini (AI Studio)
- Song re-times: `argon-retime-all-songs.md` (still to do: Agua Pa' Yemayá, Pogolotti, Me Dicen Cuba,
  Esto Te Pone La Cabeza Mala, Tremenda Pinta). 2 per message to Claude.
- Photos: `nano-banana-landing-photos.md`.
- Move drafts: once the move maker exists (Thursday).

### For Antigravity (overnight ideas)
- e2e tests for the move library and new landing page.
- Image pipeline: convert new photos to AVIF/WebP, catalogue them in media-manifest, check CLS.
- Lighthouse after the art direction, with fixes outside the music folders.
- The owner's handbook (if the overnight-polish run didn't finish it).
