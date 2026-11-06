import type { Metadata } from "next";
import { clampDescription, fitTitle } from "@/lib/seo/search-snippets";
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
  const pageTitle = fitTitle(`${title} – What to Dance in Every Section`);
  const description = clampDescription(`Section-by-section ${style} guide for ${title} by ${song.artist}: what to dance in every section, with leader and follower cues.`);
  return {
    title: pageTitle,
    description,
    alternates: { canonical: `/music/${song.id}` },
    // Without these, a shared link shows the site's general title and description
    openGraph: { title: pageTitle, description, url: `/music/${song.id}`, siteName: "Salsa Explosion", locale: "en_GB", type: "website" },
    twitter: { card: "summary_large_image", title: pageTitle, description, images: [`/music/${song.id}/opengraph-image`] },
  };
}

export default async function SongPlayerPage({ params }: SongPlayerPageProps) {
  const song = findSong((await params).songId);
  if (!song) notFound();
  // The player is the cinema screen of the poster system: always on ink
  return (
    <div className="theme-ink bg-canvas">
      <SongPlayerScreen song={song} />
    </div>
  );
}
