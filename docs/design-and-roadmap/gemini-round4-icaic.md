# Image brief: Salsa Explosion website, round 4 (ICAIC rollout)

## Instructions for Gemini

Create **one separate image for every numbered item below**: 12 images in total, in this order.

- Use each item's aspect ratio exactly.
- **No text, letters, numbers, logos, signage or watermarks inside any image.**
- Under each image in your reply, write its number and title (e.g. "1. Admission ticket") so I can tell them apart.
- If you can't make all 12 in one reply, make **Part A** first, then continue with **Part B** when I say "continue".

All 12 images are **one matching set** of flat screen-print illustrations in the style of 1960s–70s Cuban ICAIC film posters. They must look like they came from the same print studio as each other.

---

## Part A: spot illustrations (9 images)

**Shared style for items 1–9:** flat three-colour screenprint illustration in the style of 1960s–70s Cuban ICAIC film posters: bold simple cut-out shapes, ink black, vermilion red and mustard yellow only, visible paper grain, slight ink misregistration between the colours, halftone dots in the shadows. **On a perfectly plain, flat warm cream background, with nothing touching the edges and no shadow under the object.** No frame. The object centred with a generous empty margin. Square 1:1.

### 1. Admission ticket (square 1:1)
A torn vintage cinema admission ticket with a perforated edge and a single five-pointed star, slightly tilted. Leave the ticket face blank (no printing).

### 2. Alarm clock (square 1:1)
A 1950s twin-bell wind-up alarm clock, ringing, with short burst lines around the bells. The clock face shows only simple tick marks, no numerals.

### 3. Seaside pier with a palm (square 1:1)
An English seaside pier on wooden stilts running out to sea, a single palm tree in the foreground and a large round sun behind, two simple wave lines in the water.

### 4. Phone with a pattern (square 1:1)
A hand holding a modern smartphone upright, the screen showing a simple abstract grid of black and red squares (not a real code), with three small musical notes floating above it.

### 5. The caller's hand (square 1:1)
A raised hand making a clear signal with two fingers up, with a small metal whistle on a cord hanging from the wrist, and short burst lines around the fingertips.

### 6. Gift envelope (square 1:1)
A closed envelope tied with a ribbon and a big bow, a single star seal on the flap.

### 7. Medal on a ribbon (square 1:1)
A round medal with a star in the middle, hanging from a striped ribbon, with three small sparkle shapes around it.

### 8. Vintage cine camera (square 1:1)
A 1960s film camera on a short tripod with two film reels on top, a cone of light coming out of the lens.

### 9. Vinyl record (square 1:1)
A black vinyl record seen from slightly above, with a plain red centre label and a star in the middle, small motion lines showing it spinning.

---

## Part B: poster banners (3 images)

**Shared style for items 10–12:** the same ICAIC screenprint style as Part A (bold cut-out shapes, visible paper grain, slight misregistration, halftone dots), but a **full-bleed poster composition** that fills the whole frame, edge to edge. Four inks allowed: ink black, vermilion red, mustard yellow and deep teal, on warm cream paper. Keep **the left third of the frame calm and simple** (flat colour or plain sky) so a headline can sit there. No people's faces in detail: figures are bold silhouettes.

### 10. The big band (wide 21:9)
A Cuban big band on a small stage under a string of round light bulbs: trumpets raised, a conga player, a timbales player, silhouettes only. Dancing couples in the foreground as black silhouettes, a huge red sun behind the stage.

### 11. Havana at sunset (landscape 16:9)
The Havana Capitolio dome and a row of colonial buildings along the Malecón sea wall at sunset, one big wave breaking over the wall, a 1950s car as a small silhouette on the road, a huge mustard sun low in the sky.

### 12. The dance-hall door (landscape 16:9)
The open double doors of a dance hall at night, warm light spilling out onto the pavement, the silhouettes of two dancers inside, a single street lamp and a palm tree outside.

---

## Where each image goes (for Claude, not for Gemini)

Delivered 2026-11-01 and processed into `public/images/editorial/` (`icaic-*.png` cut-outs, `banner-*.jpg`),
registered in `MEDIA_MANIFEST.mockupGraphics` (ticket, clock, pier, phone, caller, gift, medal, camera, record)
and `MEDIA_MANIFEST.editorial` (bannerBigBand, bannerHavana, bannerDoor).

The cut-outs lose their cream interiors on ink, so put them on paper or a light poster ink.

| # | Image | Placed (2026-11-01) | Still to place (pages Antigravity restyled overnight) |
|---|-------|---------------------|-------------------------------------------------------|
| 1 | Admission ticket | Home: next to the £12 / £14 door price | /pricing door prices |
| 2 | Alarm clock | Home: cartelera heading | /dashboard/schedule header |
| 3 | Pier and palm | Home: venue block | /venues "getting here" |
| 4 | Phone with a pattern | Mi carnet: "Tus pases" | /how-it-works, /dashboard/wallet |
| 5 | The caller's hand | Rueda flashcards header | /dashboard/rueda dictionary header |
| 6 | Gift envelope | Home: gift voucher band | /pricing#vouchers |
| 7 | Medal on a ribbon | Mi carnet: next to the counts | /dashboard/progression |
| 8 | Vintage cine camera | /moves "Próximamente" | /dashboard/recaps |
| 9 | Vinyl record | 404 page ("Se rayó el disco") | empty states |
| 10 | The big band | Home: "Próximas funciones" | /events hero |
| 11 | Havana at sunset | none yet | /about hero ("Desde La Habana") |
| 12 | The dance-hall door | none yet | /private-lessons or /venues hero |

Items 1–9 are cut out to transparent PNGs (1024 px) like rounds 2–3; items 10–12 are optimised JPEGs (max 2400 px). Save Gemini's files into `public/images/editorial/` as before; Claude processes and places them.
