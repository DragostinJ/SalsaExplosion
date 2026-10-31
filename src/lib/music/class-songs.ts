import { TIMBA_SONG_ANATOMY_DATA, type SongAnatomy, type SongStyle } from "@/lib/constants/timba-song-anatomy";
import { displaySongTitle } from "@/lib/music/song-style";

/** "Tonight's songs": how many practice-player songs a teacher can link to one class. */
export const MAX_CLASS_PRACTICE_SONGS = 3;

export function isKnownSongId(id: string): boolean {
  return TIMBA_SONG_ANATOMY_DATA.some((song) => song.id === id);
}

/** Songs for stored ids, in the teacher's order; ids of songs since removed are skipped. */
export function resolveClassSongs(ids: readonly string[]): SongAnatomy[] {
  return ids.flatMap((id) => TIMBA_SONG_ANATOMY_DATA.find((song) => song.id === id) ?? []);
}

/** What client components need to link a song (keeps the full song maps out of their bundles). */
export interface ClassSongSummary {
  id: string;
  title: string;
  artist: string;
  style: SongStyle;
}

export function summarizeClassSongs(ids: readonly string[]): ClassSongSummary[] {
  return resolveClassSongs(ids).map((song) => ({
    id: song.id,
    title: displaySongTitle(song.title),
    artist: song.artist,
    style: song.style,
  }));
}
