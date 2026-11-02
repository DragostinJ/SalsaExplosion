import { getImageProps } from "next/image";
import type { SongAnatomy } from "@/lib/constants/timba-song-anatomy";
import type { MediaAssetConfig } from "@/lib/media-manifest";
import type { GearPalette } from "@/lib/site-content";
import { cn } from "@/lib/utils";

/**
 * Hero photo with art direction: the 9:16 crop on phones, the 16:9 one from 768px
 * (getImageProps + <picture>, as in the Next.js image docs). Only one file loads.
 */
export function HeroPicture({
  desktop,
  mobile,
  className,
}: {
  desktop: MediaAssetConfig;
  mobile: MediaAssetConfig;
  className?: string;
}) {
  const common = { alt: desktop.alt, sizes: "100vw" };
  const {
    props: { srcSet: desktopSet },
  } = getImageProps({ ...common, src: desktop.src, width: desktop.width, height: desktop.height });
  const {
    props: { srcSet: mobileSet, ...rest },
  } = getImageProps({
    ...common,
    src: mobile.src,
    width: mobile.width,
    height: mobile.height,
    loading: "eager",
    fetchPriority: "high",
  });
  return (
    <picture>
      <source media="(min-width: 768px)" srcSet={desktopSet} />
      <source srcSet={mobileSet} />
      <img {...rest} alt={desktop.alt} className={className} />
    </picture>
  );
}

/**
 * The 2-3 son clave as a mark: 16 sixteenth-note ticks, 5 strokes
 * (beats 2, 3 | 5, 6&, 8 of the dance count).
 */
const CLAVE_SIXTEENTHS = [2, 4, 8, 11, 14];

export function ClaveMark({ color, tickColor, className }: { color: string; tickColor?: string; className?: string }) {
  return (
    <svg viewBox="0 0 160 20" className={className} role="img" aria-label="2-3 son clave">
      {Array.from({ length: 16 }, (_, i) => (
        <rect key={i} x={i * 10 + 4} y={9} width={2} height={2} fill={tickColor ?? color} opacity={0.45} />
      ))}
      {CLAVE_SIXTEENTHS.map((i) => (
        <circle key={i} cx={i * 10 + 5} cy={10} r={5} fill={color} />
      ))}
    </svg>
  );
}

const sectionWeight = (start: number, end: number) => Math.max(end - start, 1);

/** Horizontal score: one bar per section, width = its length. */
export function SongScore({
  song,
  palette,
  className,
  gap = 2,
}: {
  song: SongAnatomy;
  palette: GearPalette;
  className?: string;
  gap?: number;
}) {
  return (
    <div
      role="img"
      aria-label={`${song.title}: ${song.segments.length} sections, from intro to final`}
      className={cn("flex w-full", className)}
      style={{ gap }}
    >
      {song.segments.map((segment) => (
        <span
          key={segment.id}
          className="block h-full min-w-[2px]"
          style={{
            flexGrow: sectionWeight(segment.startTimeSeconds, segment.endTimeSeconds),
            backgroundColor: palette[segment.danceGear],
          }}
        />
      ))}
    </div>
  );
}

/** Poster stripes: one horizontal band per section, height = its length, name inside. */
export function SongStripes({
  song,
  palette,
  inkOn,
  className,
}: {
  song: SongAnatomy;
  palette: GearPalette;
  /** Text colour for each gear's band (dark or light) */
  inkOn: (gear: SongAnatomy["segments"][number]["danceGear"]) => string;
  className?: string;
}) {
  return (
    <ol className={cn("flex flex-col", className)} aria-label={`${song.title} section by section`}>
      {song.segments.map((segment) => (
        <li
          key={segment.id}
          className="flex min-h-[28px] items-center justify-between gap-3 px-3"
          style={{
            flexGrow: sectionWeight(segment.startTimeSeconds, segment.endTimeSeconds),
            backgroundColor: palette[segment.danceGear],
            color: inkOn(segment.danceGear),
          }}
        >
          <span className="min-w-0 truncate">{segment.sectionName}</span>
          <span className="shrink-0 tabular-nums">{segment.formattedRange.split(" - ")[0]}</span>
        </li>
      ))}
    </ol>
  );
}
