import type { CSSProperties } from "react";
import { Instrument_Serif } from "next/font/google";
import type { GearPalette } from "./mockup-data";

/** Gallery direction: shared by /mockups/gallery and /mockups/gallery/music. */

export const instrument = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--gl-display",
  display: "swap",
});

/** The current site tokens (obsidian, ivory, crimson, amber) plus two gallery greys. */
export const WALL = {
  obsidian: "#080706",
  ivory: "#F5F2EB",
  crimson: "#DC2626",
  amber: "#F59E0B",
  frame: "#1A1715",
  ash: "#9A9187",
  line: "#2E2925",
} as const;

export const GEARS: GearPalette = {
  "Wait / Breathe": "#3A3430",
  "Son Cubano": "#8A7F70",
  "Casino (Smooth)": "#C9BFAE",
  "Casino (Flow)": WALL.ivory,
  "Rumba Guaguancó": WALL.crimson,
  "Afro-Cuban Orishas": "#B45309",
  "Suelta / Shines": WALL.amber,
  "Despelote / Reparto": "#991B1B",
};

// Type scale (max 9 sizes per route)
export const H1 = "text-[17vw] leading-[0.85] md:text-[9vw]";
export const H2 = "text-5xl leading-none md:text-7xl";
export const H3 = "text-3xl leading-tight";
export const serif: CSSProperties = { fontFamily: "var(--gl-display)" };

export const textLink = "inline-flex min-h-[44px] items-center gap-2 border-b text-sm uppercase tracking-widest";

/** Museum wall label */
export function WallLabel({ number, title, medium, note }: { number: number; title: string; medium: string; note?: string }) {
  return (
    <p className="mt-3 border-l pl-3 text-xs leading-relaxed" style={{ borderColor: WALL.crimson, color: WALL.ash }}>
      <span className="font-semibold uppercase tracking-widest" style={{ color: WALL.ivory }}>
        {String(number).padStart(2, "0")} · {title}
      </span>
      <br />
      {medium}
      {note && (
        <>
          <br />
          {note}
        </>
      )}
    </p>
  );
}
