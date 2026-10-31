import type { SongStyle } from "@/lib/constants/timba-song-anatomy";

/**
 * What each musical style means for the dancer. The player is built around
 * timba, so every other style says plainly what changes on the floor.
 */
export const SONG_STYLE_HINTS: Record<SongStyle, string> = {
  Timba: "Modern Cuban salsa: expect gear changes between casino, despelote and breaks. Follow the cards.",
  "Cuban Son": "Traditional son: small steps, close hold, often contratiempo. No despelote.",
  "Cuban Salsa-Pop": "Romantic Cuban salsa: mostly smooth casino with few breaks. No despelote.",
  "Puerto Rican Salsa": "Not timba: no despelote or rumba breaks. Dance casino throughout; shine on the mambo and solos.",
  "New York Salsa": "Not timba: classic New York salsa. Dance casino throughout; shine on the mambo and timbal solos.",
  "Cuban Hip-Hop / Fusion": "Hip-hop built on Cuban son: mostly son and smooth casino. Follow the cards for the breaks.",
};

export function isTimba(style: SongStyle): boolean {
  return style === "Timba";
}

/** Song title without the YouTube upload tag, e.g. "(Official Video)" or "(Video Oficial)". */
export function displaySongTitle(title: string): string {
  return title.replace(/\s*\((official video|video oficial|studio video|official audio|audio oficial)\)/i, "");
}
