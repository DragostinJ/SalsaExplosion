import { TIMBA_SONG_ANATOMY_DATA } from "@/lib/constants/timba-song-anatomy";
import { displaySongTitle } from "@/lib/music/song-style";

export interface PracticeHotspot {
  songId: string;
  songTitle: string;
  sectionId: string;
  sectionName: string;
  startTimeSeconds: number;
  loops: number;
  replays: number;
}

export interface PracticeCountRow {
  songId: string;
  sectionId: string;
  loops: number;
  replays: number;
}

/** Most looped + replayed sections first, named from the song data; rows for removed songs are skipped. */
export function rankPracticeHotspots(rows: readonly PracticeCountRow[], limit: number): PracticeHotspot[] {
  return rows
    .flatMap((row) => {
      const song = TIMBA_SONG_ANATOMY_DATA.find((candidate) => candidate.id === row.songId);
      const section = song?.segments.find((segment) => segment.id === row.sectionId);
      if (!song || !section) return [];
      return [
        {
          songId: song.id,
          songTitle: displaySongTitle(song.title),
          sectionId: section.id,
          sectionName: section.sectionName,
          startTimeSeconds: section.startTimeSeconds,
          loops: row.loops,
          replays: row.replays,
        },
      ];
    })
    .sort((a, b) => b.loops + b.replays - (a.loops + a.replays))
    .slice(0, Math.max(1, Math.min(limit, 50)));
}
