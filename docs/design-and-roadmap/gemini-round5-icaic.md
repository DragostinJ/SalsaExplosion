# Image brief: Salsa Explosion website, round 5 (ICAIC rollout)

## Instructions for Gemini

Create **one separate image for every numbered item below**: 12 images in total, in this order.

- Use each item's aspect ratio exactly.
- **No text, letters, numbers, logos, signage or watermarks inside any image.**
- Under each image in your reply, write its number and title (e.g. "1. Maracas") so I can tell them apart.
- If you can't make all 12 in one reply, make **Part A** first, then continue with **Part B** when I say "continue".

All 12 images are **one matching set** of flat screen-print illustrations in the style of 1960s–70s Cuban ICAIC film posters. They must look like they came from the same print studio as each other, and as the earlier rounds (ticket, alarm clock, pier, phone, medal, cine camera, vinyl record).

---

## Part A: spot illustrations (9 images)

**Shared style for items 1–9:** flat three-colour screenprint illustration in the style of 1960s–70s Cuban ICAIC film posters: bold simple cut-out shapes, ink black, vermilion red and mustard yellow only, visible paper grain, slight ink misregistration between the colours, halftone dots in the shadows. **On a perfectly plain, flat warm cream background, with nothing touching the edges and no shadow under the object.** No frame. The object centred with a generous empty margin. Square 1:1.

### 1. Maracas (square 1:1)
A pair of Cuban maracas crossed like an X, a small five-pointed star between the handles, and short shake lines around the heads.

### 2. Map and pin (square 1:1)
A folded paper road map lying half open, a dotted route line running across it to a big round map pin with a star on its head. The map has only simple shapes for roads and a coastline: no names or writing.

### 3. Tear-off calendar (square 1:1)
A tear-off wall calendar hanging from a nail, its top page curling off and flying away, a small star on the binding strip. The pages are blank: no numbers and no day names.

### 4. Five stars (square 1:1)
A rounded speech bubble with five five-pointed stars bursting up out of it in a gentle arc, with short burst lines around them.

### 5. Shopping bag (square 1:1)
A paper shopping bag with rope handles and a single star on its side, a ticket and the end of a ribbon peeking out of the top.

### 6. Pen and sealed letter (square 1:1)
A fountain pen lying diagonally across a folded letter that is closed with a round wax seal stamped with a star. The letter shows only a few plain ruled lines, no writing.

### 7. Door key (square 1:1)
A large old-fashioned door key with a star-shaped bow, a blank paper tag tied to it with a loop of string.

### 8. Dance footprints (square 1:1)
A simple dance-step diagram seen from above: one pair of men's shoe prints and one pair of women's heeled shoe prints facing each other, with two curved arrows between them showing a turn. No numbers, letters or labels.

### 9. Clave sticks (square 1:1)
Two wooden clave sticks crossed in an X, with five small burst marks around the point where they meet, as if the rhythm is being struck.

---

## Part B: poster banners (3 images)

**Shared style for items 10–12:** the same ICAIC screenprint style as Part A (bold cut-out shapes, visible paper grain, slight misregistration, halftone dots), but a **full-bleed poster composition** that fills the whole frame, edge to edge. Four inks allowed: ink black, vermilion red, mustard yellow and deep teal, on warm cream paper. Keep **the left third of the frame calm and simple** (flat colour or plain sky) so a headline can sit there. No people's faces in detail: figures are bold silhouettes.

### 10. Festival by the sea (wide 21:9)
A summer dance festival on a beach at sunset: a striped marquee tent hung with strings of round light bulbs, couples dancing on the sand as black silhouettes, a long seaside pier on stilts in the distance, a huge red sun low over the sea.

### 11. The studio at night (landscape 16:9)
Inside a dance studio at night: a long wall mirror above a wooden floor, a couple dancing as silhouettes with their reflection in the mirror, and a tall window showing a crescent moon and a palm tree outside.

### 12. The teacher's count (landscape 16:9)
A dance teacher seen from behind as a bold silhouette, clapping the count, facing a line of students who all step the same way, their long shadows stretching across the floor, a huge mustard sun shape behind them.

---

## Where each image goes (for Claude, not for Gemini)

Delivered 2026-11-03 and processed into `public/images/editorial/` (`icaic-*.png` cut-outs, `banner-*.jpg`), registered in `MEDIA_MANIFEST.mockupGraphics` (maracas, map, calendar, stars, bag, letter, key, footprints, claves) and `MEDIA_MANIFEST.editorial` (bannerFestival, bannerStudio, bannerTeacher).

The brief aimed at pages with no illustration. Three of them turned out to be redirects (`/shop` → /pricing, `/schedule` and `/dashboard` → /classes), so those pictures went to the page people land on instead.

| # | Image | Where it is |
|---|-------|-------------|
| 1 | Maracas | /events/[slug], beside "Available Passes" |
| 2 | Map and pin | /venues hero |
| 3 | Tear-off calendar | /cartel header (the class-night posters, which carry the next class date) |
| 4 | Five stars | /review hero, in place of the five star icons |
| 5 | Shopping bag | /pricing, the "Festivals & Special Events" card |
| 6 | Pen and sealed letter | /terms hero |
| 7 | Door key | /checkin/[sessionId], above the check-in card (not on its mustard header, where the key's mustard would vanish) |
| 8 | Dance footprints | /moves/[moveId], above "El que lleva / La que sigue" |
| 9 | Clave sticks | /sign-in and /sign-up, above the Clerk form |
| 10 | Festival by the sea | /events, under the hero ("Fiesta junto al mar") |
| 11 | The studio at night | /classes, after the timetable ("Jueves y domingos en BOH Studios") |
| 12 | The teacher's count | /how-it-works, under the hero ("Uno, dos, tres") |

Banners use `PosterBanner` from `src/components/poster/poster-art.tsx`. Items 1–9 are transparent PNGs (1024 px) like rounds 2–4; their black outlines vanish on ink, so keep them on paper or a light poster ink. Items 10–12 are JPEGs at 2400 px wide.
