import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TIMBA_SONG_ANATOMY_DATA } from "@/lib/constants/timba-song-anatomy";
import { SongPlayerScreen } from "@/components/music/song-player/song-player-screen";
import { displaySongTitle, isTimba } from "@/lib/music/song-style";

interface SongPlayerPageProps {
  params: Promise<{ songId: string }>;
}

function findSong(songId: string) {
  return TIMBA_SONG_ANATOMY_DATA.find((song) => song.id === songId);
}

export function generateStaticParams() {
  return TIMBA_SONG_ANATOMY_DATA.map((song) => ({ songId: song.id }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: SongPlayerPageProps): Promise<Metadata> {
  const song = findSong((await params).songId);
  if (!song) return {};
  const title = displaySongTitle(song.title);
  const style = isTimba(song.style) ? "timba" : song.style;
  return {
    title: `${title} – What to Dance in Every Section`,
    description: `Section-by-section ${style} guide for ${title} by ${song.artist}: what to dance in every section, with leader and follower cues.`,
    alternates: { canonical: `/music/${song.id}` },
  };
}

export default async function SongPlayerPage({ params }: SongPlayerPageProps) {
  const song = findSong((await params).songId);
  if (!song) notFound();
  return <SongPlayerScreen song={song} />;
}
