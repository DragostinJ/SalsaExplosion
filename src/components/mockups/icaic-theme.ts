import type { CSSProperties } from "react";
import { Anton, Archivo } from "next/font/google";
import type { GearPalette } from "./mockup-data";

/** ICAIC Poster direction: shared by /mockups/icaic and /mockups/icaic/music. */

export const anton = Anton({ subsets: ["latin"], weight: "400", variable: "--ic-display", display: "swap" });
export const archivo = Archivo({ subsets: ["latin"], variable: "--ic-text", display: "swap" });

/** Candidate silkscreen inks; they would become design tokens if this direction wins. */
export const INK = {
  paper: "#F1E6D0",
  ink: "#161311",
  red: "#E4412B",
  mustard: "#F4B41A",
  teal: "#12938F",
  blue: "#22418F",
  pink: "#EE7BA0",
  plum: "#5B2A6E",
} as const;

export const GEARS: GearPalette = {
  "Wait / Breathe": "#D9CCB2",
  "Son Cubano": INK.blue,
  "Casino (Smooth)": INK.teal,
  "Casino (Flow)": INK.mustard,
  "Rumba Guaguancó": INK.red,
  "Afro-Cuban Orishas": INK.plum,
  "Suelta / Shines": INK.pink,
  "Despelote / Reparto": INK.ink,
};
export const DARK_TEXT_GEARS = new Set(["Wait / Breathe", "Casino (Flow)", "Suelta / Shines"]);
export const POSTER_COLORS = [INK.red, INK.teal, INK.mustard, INK.blue, INK.pink, INK.plum];
/** Text colour that reads on each poster colour */
export const ON_POSTER = [INK.paper, INK.paper, INK.ink, INK.paper, INK.ink, INK.paper];

// Type scale (max 9 sizes per route)
export const H1 = "text-[21vw] leading-[0.82] md:text-[10.5vw]";
export const H2 = "text-6xl leading-[0.9] md:text-8xl";
export const H3 = "text-3xl leading-none";
export const BIG = "text-5xl leading-none";
export const display: CSSProperties = { fontFamily: "var(--ic-display)" };

export const halftone = (color: string): CSSProperties => ({
  backgroundColor: color,
  backgroundImage: `radial-gradient(circle, ${INK.ink} 1.4px, transparent 1.8px)`,
  backgroundSize: "9px 9px",
});

/** Paper-grain page background (the texture is a tiny 9 KB tile) */
export const paper = (textureUrl: string): CSSProperties => ({
  backgroundColor: INK.paper,
  backgroundImage: `url(${textureUrl})`,
  backgroundSize: "384px",
});

export const button =
  "inline-flex min-h-[48px] items-center border-4 px-5 font-bold uppercase tracking-wider transition-transform hover:-translate-y-0.5";
