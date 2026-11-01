# 10 landing-page photo prompts (Nano Banana Pro / Gemini)

Use **Nano Banana Pro** (Gemini app on your Pro plan, or `gemini-3-pro-image` in AI Studio). Paste the
**style block** at the end of every prompt so the 10 photos look like one series.

## Style block (add to every prompt)

> Photorealistic editorial dance photograph, full-frame camera, natural film grain like Kodak Portra 800
> pushed one stop. Deep near-black shadows, warm ivory highlights, and colour accents ONLY in deep crimson
> red and warm amber gold. Real skin texture, real fabric weave, natural hands with five fingers, no
> plastic or CGI look, no glossy retouching. Tasteful, athletic, joyful; documentary feel. No text, no
> letters, no logos, no watermarks, no signage.

---

### 1. Hero: "La vuelta" (16:9, plus a 9:16 mobile version)
A Cuban casino couple mid-turn in a dark dance studio at night. The follower spins under the leader's
raised right arm; her flared skirt is a long sweep of motion blur (slow shutter 1/20 s, rear-curtain flash)
while both faces stay sharp and smiling. A single crimson rim light from behind, amber key light from the
left, faint haze in the air. The couple sits in the right two-thirds of the frame; the left third is calm,
dark negative space for a headline. Low camera, 35 mm lens, f/2.

### 2. Feet on Havana tiles (4:5)
Close-up at floor level of two dancers' feet mid-step on worn Cuban cement tiles (mosaico hidráulico)
with a faded geometric pattern in ivory, terracotta and black. Her heels, his suede dance shoes, one
foot lifted with motion blur. A pair of wooden claves lies at the edge of the frame. Warm amber side light
skimming across the tile texture, 50 mm macro feel, shallow depth of field.

### 3. Mediopunto light (21:9 banner)
Inside a Havana colonial room: late-afternoon sun pours through a semicircular stained-glass fan window
(mediopunto) above a tall wooden door, throwing crimson, amber and cobalt light patterns across the
bare back and shoulders of a dancer doing a slow ribcage isolation. Dust in the light beams, peeling
plaster walls, high ceiling. Wide composition with the dancer off-centre right; calm wall on the left.

### 4. Conga slap (4:5)
Extreme close-up of a percussionist's hands striking a conga drum mid-slap, sweat droplets frozen in the
air by flash, motion trails from ambient light drag. Warm wood grain of the tumbadora, worn rawhide head,
a silver ring on one finger. Background dissolves into crimson bokeh from stage lights. 85 mm, f/2.8.

### 5. La rueda from above (1:1)
Overhead shot from a high balcony looking straight down on a rueda de casino: six couples in a perfect
circle on a dark wooden floor, mid "Dame" partner change, curved motion-blur arcs of skirts and arms. One
caller in the circle raises a hand with two fingers up. Warm amber pools of light from above, crimson
accents on a few outfits. Geometric, almost like a mandala. 24 mm.

### 6. The brass section (16:9)
Trumpet and trombone bells of a live timba band catching amber stage light, shot slightly from below, with
haze and a red back light making the brass glow. The musicians are dark silhouettes; a drop of
condensation shines on a trumpet bell. Top half of the frame is dark haze, room for a headline.

### 7. Despelote (4:5)
A female dancer mid shoulder-and-ribcage isolation in timba despelote style, photographed from a low
angle; her curls and earrings move with the motion, eyes closed, big laugh. Crimson gel light from one
side, amber from the other, dark background. Athletic, joyful, never sexualised; loose linen shirt.
50 mm, f/1.8, slight motion blur on the hair only.

### 8. Rumba in the solar (3:2)
A Havana courtyard (solar) at golden hour: a rumba guaguancó couple in white clothes at the playful
"vacunao" moment, the man's hip thrust, the woman covering with her skirt and a grin. Peeling pastel walls
with ivy, a laundry line, an older musician on a cajón and two congas in soft focus behind. Warm amber
light, crimson headscarf as the only strong colour. 35 mm documentary.

### 9. "Cinco, seis, siete, ocho" (16:9)
A teacher's hands in the foreground counting in, fingers spread on "5", sharp focus; behind, a mirror
reflects a row of students in soft focus ready to step. A dark studio with amber practice lights; a red
water bottle on the floor is the only crimson. Room for text on the right. 85 mm, f/1.8.

### 10. The social after class (16:9)
Candid wide shot of the social dance after class: couples dancing under warm amber festoon lights, a DJ
booth glowing at the back, one couple in the foreground laughing mid-turn with motion blur, haze catching
the light, a crimson glow across the ceiling. Feels like a real Saturday night, not a stock photo. 28 mm.

---

## Tips
- **Make a series:** generate #1 first. When you like the couple, upload that image with the next
  prompt and add "same couple, same clothing" (Nano Banana keeps characters consistent from a reference).
- **Ask for variations:** "same scene, camera 1 m lower", "warmer", "less haze", "make the skirt red".
- **Crop for mobile:** every hero needs a 9:16 version (ask for it, don't just crop).
- **Before using on the site:** export at the largest size, convert to AVIF/WebP, and catalogue each one in
  `src/lib/media-manifest.ts` (AGENTS.md rule: aspect ratio + intrinsic size, so there's no layout shift).
- **Honesty:** use AI photos for atmosphere (feet, hands, light, drums, crowds). For anything presented as
  *your* teachers, students or venue (BOH Studios), use real photos, so nobody is misled.
- **Respect:** if you ever want Orisha imagery (Yemayá, Changó...), ask the studio first: those are
  sacred figures in Santería, not decoration.

---

# Round 2: graphic assets for the art directions (for Gemini's remaining quota)

Same rules: no text, no logos. Save the originals somewhere outside the repo (e.g. `Desktop\ritmo\round2\`)
and tell Claude; Claude optimises them and adds them to the media manifest.

### R1. ICAIC screenprint illustrations (1:1, make 4: conga + claves, trumpet, dancing couple, palm + Malecón wave)
> Flat three-colour screenprint illustration of a conga drum and a pair of wooden claves, in the style of
> 1960s–70s Cuban ICAIC film posters: bold simple cut-out shapes, ink black, vermilion red and mustard yellow
> on warm cream paper, visible paper grain, slight ink misregistration between colours, halftone dots in the
> shadows. No text, no letters, no frame. Centred with generous empty margin.

### R2. Havana floor tile, seamless (1:1)
> Top-down, perfectly flat, evenly lit scan of a single Cuban hydraulic cement floor tile (mosaico
> hidráulico) with a symmetrical geometric pattern in ruby red, cobalt blue, amber and ivory. Slightly worn
> matte surface. The pattern must tile seamlessly on all four edges. No shadows, no perspective, no grout.

### R3. Mediopunto window, front-on (2:1)
> Front-on, symmetrical photograph of a Havana colonial stained-glass mediopunto (semicircular fan window)
> above a tall wooden door, sun shining through from behind so the ruby, amber, cobalt and emerald glass
> glows. The window is centred and fills the width; the wall around it is dark and plain. Sharp leading
> lines, no people.

### R4. Paper texture, seamless (1:1)
> Seamless warm cream paper texture with subtle risograph grain and soft fibres, flat and evenly lit, no
> objects, no vignette, tileable on all edges.

### R5. Two more move-library covers (4:5), same photo series style as round 1
> (a) Son cubano: an older couple dancing close hold, small steps, warm amber light in a Havana living room
> with a radio on a shelf. (b) Casino partnerwork: a couple mid "dile que no" at a social, hands connected,
> crimson rim light, motion blur on the skirt only.

### R6. Social-share image background (1200×630)
> Dark stage, crimson rim light, a conga silhouette on the right third, haze, the left two-thirds calm and
> nearly black for a headline. Same film-grain style.
