import type { CSSProperties } from "react";
import { Cormorant_Garamond, Jost } from "next/font/google";
import { GRAPHICS, type GearPalette } from "./mockup-data";

/** Mediopunto direction: shared by /mockups/mediopunto and /mockups/mediopunto/music. */

export const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
  style: ["normal", "italic"],
  variable: "--mp-display",
  display: "swap",
});
export const jost = Jost({ subsets: ["latin"], variable: "--mp-text", display: "swap" });

/** Candidate stained-glass palette; would become design tokens if this direction wins. */
export const GLASS = {
  night: "#120E0C",
  plaster: "#EFE5D3",
  ruby: "#A3212C",
  amber: "#E0A02A",
  cobalt: "#23509A",
  emerald: "#1F7552",
  amethyst: "#5A3B8C",
  rose: "#C76A7A",
  ivory: "#F5F2EB",
  lead: "#2A221C",
} as const;

export const GEARS: GearPalette = {
  "Wait / Breathe": "#CFC3AD",
  "Son Cubano": GLASS.cobalt,
  "Casino (Smooth)": GLASS.emerald,
  "Casino (Flow)": GLASS.amber,
  "Rumba Guaguancó": GLASS.ruby,
  "Afro-Cuban Orishas": GLASS.amethyst,
  "Suelta / Shines": GLASS.rose,
  "Despelote / Reparto": "#7A1A22",
};
export const FAN_COLORS = [GLASS.ruby, GLASS.amber, GLASS.cobalt, GLASS.emerald, GLASS.amber, GLASS.rose];

// Type scale (max 9 sizes per route)
export const H1 = "text-5xl leading-[0.95] md:text-7xl";
export const H2 = "text-4xl leading-tight md:text-6xl";
export const H3 = "text-2xl leading-snug";
export const serif: CSSProperties = { fontFamily: "var(--mp-display)" };

export const pill = "inline-flex min-h-[48px] items-center rounded-full px-6 text-sm font-medium tracking-wide";
export const arch = "overflow-hidden rounded-t-full";

/** A band of real Havana hydraulic floor tiles (the generated tile, repeated). */
export function TileBand({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`h-14 w-full ${className ?? ""}`}
      style={{ backgroundImage: `url(${GRAPHICS.havanaTile.src})`, backgroundSize: "112px", backgroundRepeat: "repeat-x" }}
    />
  );
}
