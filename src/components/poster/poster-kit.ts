import type { CSSProperties } from "react";
import type { GearPalette } from "@/lib/site-content";

/**
 * ICAIC Poster building blocks for the live pages. Colours are the absolute poster
 * inks from globals.css (`--color-paper`, `--color-ink`, `--color-poster-*`), so a
 * block looks the same on the paper and the ink surface.
 */

export const POSTER_INK = {
  paper: "var(--color-paper)",
  ink: "var(--color-ink)",
  red: "var(--color-poster-red)",
  mustard: "var(--color-poster-mustard)",
  teal: "var(--color-poster-teal)",
  blue: "var(--color-poster-blue)",
  pink: "var(--color-poster-pink)",
  plum: "var(--color-poster-plum)",
} as const;

/** The same inks as hex, for image renderers (ImageResponse can't read CSS variables) */
export const POSTER_HEX = {
  paper: "#F1E6D0",
  ink: "#161311",
  red: "#E8462F",
  mustard: "#F4B41A",
  teal: "#12938F",
  blue: "#22418F",
  pink: "#EE7BA0",
  plum: "#5B2A6E",
} as const;

/** One silkscreen ink per dance gear (song maps, stripes, legends) */
export const GEAR_INKS: GearPalette = {
  "Wait / Breathe": "#D9CCB2",
  "Son Cubano": POSTER_INK.blue,
  "Casino (Smooth)": POSTER_INK.teal,
  "Casino (Flow)": POSTER_INK.mustard,
  "Rumba Guaguancó": POSTER_INK.red,
  "Afro-Cuban Orishas": POSTER_INK.plum,
  "Suelta / Shines": POSTER_INK.pink,
  // Black on paper, paper on ink: the one gear that swaps with the surface
  "Despelote / Reparto": "var(--color-ivory)",
};

/** Gear inks as hex, on a paper ground (Despelote is ink), for share images */
export const GEAR_HEX: GearPalette = {
  "Wait / Breathe": "#D9CCB2",
  "Son Cubano": POSTER_HEX.blue,
  "Casino (Smooth)": POSTER_HEX.teal,
  "Casino (Flow)": POSTER_HEX.mustard,
  "Rumba Guaguancó": POSTER_HEX.red,
  "Afro-Cuban Orishas": POSTER_HEX.plum,
  "Suelta / Shines": POSTER_HEX.pink,
  "Despelote / Reparto": POSTER_HEX.ink,
};

/** Gears whose ink needs ink-coloured text on top (paper text only reads on blue and plum) */
export const DARK_TEXT_GEARS: ReadonlySet<string> = new Set([
  "Wait / Breathe",
  "Casino (Smooth)",
  "Casino (Flow)",
  "Rumba Guaguancó",
  "Suelta / Shines",
]);

export const gearTextInk = (gear: string) =>
  gear === "Despelote / Reparto" ? "var(--color-canvas)" : DARK_TEXT_GEARS.has(gear) ? POSTER_INK.ink : POSTER_INK.paper;

/** Poster blocks in rotation: background class + the text class that reads on it */
export const POSTER_BLOCKS = [
  { bg: "bg-poster-red", text: "text-ink" },
  { bg: "bg-poster-teal", text: "text-ink" },
  { bg: "bg-poster-mustard", text: "text-ink" },
  { bg: "bg-poster-blue", text: "text-paper" },
  { bg: "bg-poster-pink", text: "text-ink" },
  { bg: "bg-poster-plum", text: "text-paper" },
] as const;

/** Display sizes (Anton). Pages stay within the 9-size budget by reusing these. */
export const TYPE = {
  hero: "text-[19vw] leading-[0.84] md:text-[10vw]",
  section: "text-5xl leading-[0.92] md:text-7xl",
  card: "text-3xl leading-none",
  number: "text-5xl leading-none",
} as const;

/** Small caps line above a headline */
export const KICKER = "text-xs font-bold uppercase tracking-[0.3em]";

/** Thick-bordered poster button; pair with one of the POSTER_BUTTON colourways */
export const POSTER_BUTTON =
  "inline-flex min-h-[48px] items-center justify-center border-4 px-5 font-bold uppercase tracking-wider transition-transform hover:-translate-y-0.5";

export const POSTER_BUTTON_COLORS = {
  ink: "border-ink bg-ink text-paper",
  outline: "border-ink text-ink",
  mustard: "border-poster-mustard bg-poster-mustard text-ink",
  paper: "border-paper bg-paper text-ink",
} as const;

/** Halftone dot screen over a solid ink */
export const halftone = (color: string): CSSProperties => ({
  backgroundColor: color,
  backgroundImage: `radial-gradient(circle, ${POSTER_INK.ink} 1.4px, transparent 1.8px)`,
  backgroundSize: "9px 9px",
});
