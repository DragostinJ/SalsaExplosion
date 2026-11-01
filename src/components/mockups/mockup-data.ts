import {
  ACADEMY_METRICS,
  DOOR_PRICING,
  UPCOMING_EVENTS,
  VENUE_INFO,
  WEEKLY_SCHEDULE_LIST,
} from "@/lib/academy-data";
import {
  TIMBA_SONG_ANATOMY_DATA,
  getSongAnatomyById,
  type SongAnatomy,
  type SongDanceGear,
} from "@/lib/constants/timba-song-anatomy";
import { MEDIA_MANIFEST } from "@/lib/media-manifest";

/**
 * Content for the three art-direction mock-ups (/mockups). Every business fact
 * comes from the canonical modules (academy-data, song data, media manifest), so
 * the mock-ups compare *looks*, never different facts.
 */

export const MOCKUP_DIRECTIONS = [
  {
    slug: "icaic",
    name: "ICAIC Poster",
    summary:
      "Bold silkscreen colour, giant condensed type and cut-out shapes, after 1960s–70s Cuban film posters.",
  },
  {
    slug: "mediopunto",
    name: "Mediopunto",
    summary:
      "Havana stained-glass fans, arched photo frames and floor-tile patterns: warm, elegant and jewel-toned.",
  },
  {
    slug: "gallery",
    name: "Gallery",
    summary:
      "Today's black-and-ivory style taken further: huge serif type, museum captions, photos hung like artworks.",
  },
] as const;

export type MockupSlug = (typeof MOCKUP_DIRECTIONS)[number]["slug"];

export const PHOTOS = MEDIA_MANIFEST.editorial;

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
  { name: "Rueda & casino", spanish: "La rueda", photo: PHOTOS.ruedaOverhead, note: "Calls, combos and partner figures" },
] as const;

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

/** Events that haven't finished yet (evaluated when the page is built). */
export const NEXT_EVENTS = UPCOMING_EVENTS.filter(
  (event) => Date.parse(event.endDateIso ?? event.startDateIso) >= Date.now()
);

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
