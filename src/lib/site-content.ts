import { ACADEMY_METRICS, DOOR_PRICING, VENUE_INFO, WEEKLY_SCHEDULE_LIST } from "@/lib/academy-data";
import {
  TIMBA_SONG_ANATOMY_DATA,
  getSongAnatomyById,
  type SongAnatomy,
  type SongDanceGear,
} from "@/lib/constants/timba-song-anatomy";
import { MEDIA_MANIFEST } from "@/lib/media-manifest";
import { displaySongTitle } from "@/lib/music/song-style";

/**
 * Page-ready views of the canonical data (academy-data, song data, media manifest)
 * for the ICAIC poster pages and the art-direction mock-ups. Derived only: every
 * fact still lives in its canonical module.
 */

export const PHOTOS = MEDIA_MANIFEST.editorial;
export const GRAPHICS = MEDIA_MANIFEST.mockupGraphics;

/** Real photography for the places where real-world proof matters (venue, teacher). */
export const REAL_PHOTOS = {
  venueSocial: {
    src: MEDIA_MANIFEST.heroPortrait.src,
    alt: MEDIA_MANIFEST.heroPortrait.alt,
    width: MEDIA_MANIFEST.heroPortrait.width,
    height: MEDIA_MANIFEST.heroPortrait.height,
  },
  maestro: {
    src: MEDIA_MANIFEST.instructors.enrique,
    alt: `${ACADEMY_METRICS.founderTitleName}, founder of Salsa Explosion`,
    width: 400,
    height: 500,
  },
} as const;

export const FEATURED_SONG: SongAnatomy = getSongAnatomyById("temba-tumba-timba") ?? TIMBA_SONG_ANATOMY_DATA[0];

export const SCORE_SONGS: SongAnatomy[] = ["temba-tumba-timba", "marcando-la-distancia", "esto-esta"]
  .map((id) => getSongAnatomyById(id))
  .filter((song): song is SongAnatomy => Boolean(song));

export const SONG_COUNT = TIMBA_SONG_ANATOMY_DATA.length;

export const SCHEDULE = WEEKLY_SCHEDULE_LIST.map((day) => ({
  id: day.id,
  dayName: day.dayName,
  dayPlural: day.dayPlural,
  headline: day.headline,
  doorsTime: day.doorsTime,
  classes: day.sessions.filter((session) => !session.isSocial),
  social: day.sessions.find((session) => session.isSocial),
}));

/** Spanish day names for the poster credits */
export const SPANISH_DAY: Record<string, string> = { Thursday: "Jueves", Sunday: "Domingo" };

/** Planned move-library families, each paired with its editorial photo */
export const MOVE_FAMILIES = [
  { name: "Shines", spanish: "Pasitos", photo: PHOTOS.feetHavanaTiles, note: "Solo footwork for mambos and breaks" },
  { name: "Body movement", spanish: "Despelote", photo: PHOTOS.despelote, note: "Ribcage, shoulders, cintura, tembleque" },
  { name: "Rumba", spanish: "Guaguancó", photo: PHOTOS.rumbaSolar, note: "Yambú, guaguancó, columbia" },
  { name: "Rueda", spanish: "La rueda", photo: PHOTOS.ruedaOverhead, note: "Calls and combos in the circle" },
  { name: "Casino", spanish: "Casino", photo: PHOTOS.casinoCouple, note: "Partner figures, turns and hand changes" },
  { name: "Son", spanish: "Son", photo: PHOTOS.sonCouple, note: "Close hold, small steps, contratiempo" },
] as const;

/** Every song in the practice player, for the /mockups/<direction>/music lists. */
export const PRACTICE_SONGS = TIMBA_SONG_ANATOMY_DATA.map((song) => ({
  song,
  title: displaySongTitle(song.title),
  duration: songDurationLabel(song),
}));

export const FACTS = {
  founder: ACADEMY_METRICS.founderTitleName,
  founderShort: "Maestro Enrique",
  origin: ACADEMY_METRICS.founderOrigin,
  since: ACADEMY_METRICS.establishedYear,
  heritage: ACADEMY_METRICS.yearsInUk,
  dancers: ACADEMY_METRICS.dancersMentored,
  dancersLabel: ACADEMY_METRICS.dancersMentoredLabel,
  award: ACADEMY_METRICS.founderAward,
  partner: `${ACADEMY_METRICS.partnerPolicy} ${ACADEMY_METRICS.partnerPolicyLabel.toLowerCase()}`,
} as const;

export { DOOR_PRICING, VENUE_INFO };

/** Every dance gear used across all practice songs (for page-level legends). */
export function allGears(): SongDanceGear[] {
  return [...new Set(TIMBA_SONG_ANATOMY_DATA.flatMap((song) => song.segments.map((segment) => segment.danceGear)))];
}

/** The dance gears a song uses, in order of first appearance (for legends). */
export function gearsIn(song: SongAnatomy): SongDanceGear[] {
  return [...new Set(song.segments.map((segment) => segment.danceGear))];
}

export function songDurationLabel(song: SongAnatomy): string {
  const minutes = Math.floor(song.durationSeconds / 60);
  const seconds = String(song.durationSeconds % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export type GearPalette = Record<SongDanceGear, string>;
