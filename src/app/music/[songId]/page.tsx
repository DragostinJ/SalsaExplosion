import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TIMBA_SONG_ANATOMY_DATA } from "@/lib/constants/timba-song-anatomy";
import { SongPlayerScreen } from "@/components/music/song-player/song-player-screen";

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
  const title = song.title.replace(/\s*\(Official Video\)/i, "");
  return {
    title: `${title} – What to Dance in Every Section | Salsa Explosion`,
    description: `Section-by-section timba guide for ${title} by ${song.artist}: when to dance son, casino, rumba or shines, with leader and follower cues.`,
    alternates: { canonical: `/music/${song.id}` },
  };
}

export default async function SongPlayerPage({ params }: SongPlayerPageProps) {
  const song = findSong((await params).songId);
  if (!song) notFound();
  return <SongPlayerScreen song={song} />;
}
