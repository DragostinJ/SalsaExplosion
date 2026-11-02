import Link from "next/link";
import type { SongAnatomy } from "@/lib/constants/timba-song-anatomy";
import { cn } from "@/lib/utils";
import { MOCKUP_DIRECTIONS, type GearPalette, type MockupSlug } from "./mockup-data";

export { ClaveMark, HeroPicture, SongScore, SongStripes } from "@/components/poster/poster-art";

/** Sticky bar to hop between the three art directions and their pages; deliberately neutral. */
export function MockupSwitcher({ current, page = "home" }: { current: MockupSlug | "compare"; page?: "home" | "music" }) {
  return (
    <nav
      aria-label="Art-direction mock-ups"
      className="sticky top-0 z-50 flex flex-wrap items-center gap-1 bg-black/90 px-2 py-1 font-sans text-xs text-white backdrop-blur"
    >
      <span className="hidden shrink-0 px-2 font-semibold uppercase tracking-wider text-white/60 sm:inline">Mock-up</span>
      {MOCKUP_DIRECTIONS.map((direction) => (
        <Link
          key={direction.slug}
          href={`/mockups/${direction.slug}${page === "music" ? "/music" : ""}`}
          aria-current={current === direction.slug ? "true" : undefined}
          className={cn(
            "flex min-h-[40px] shrink-0 items-center rounded-md px-3",
            current === direction.slug ? "bg-white text-black" : "hover:bg-white/15"
          )}
        >
          {direction.name}
        </Link>
      ))}
      {current !== "compare" && (
        <span className="ml-2 flex shrink-0 items-center gap-1 border-l border-white/20 pl-2">
          {(["home", "music"] as const).map((target) => (
            <Link
              key={target}
              href={`/mockups/${current}${target === "music" ? "/music" : ""}`}
              aria-current={page === target ? "page" : undefined}
              className={cn(
                "flex min-h-[40px] shrink-0 items-center rounded-md px-3",
                page === target ? "bg-white/25" : "hover:bg-white/15"
              )}
            >
              {target === "home" ? "Home" : "Songs"}
            </Link>
          ))}
        </span>
      )}
      <Link
        href="/mockups"
        aria-current={current === "compare" ? "page" : undefined}
        className={cn(
          "ml-auto flex min-h-[40px] shrink-0 items-center rounded-md px-3",
          current === "compare" ? "bg-white text-black" : "hover:bg-white/15"
        )}
      >
        Compare
      </Link>
    </nav>
  );
}

/**
 * The song as a mediopunto (Havana stained-glass fan window): each section is a
 * pane whose angle is its share of the song, read left to right.
 */
export function SongFan({
  song,
  palette,
  lead,
  className,
}: {
  song: SongAnatomy;
  palette: GearPalette;
  /** Colour of the "lead came" lines between panes */
  lead: string;
  className?: string;
}) {
  const cx = 200;
  const cy = 200;
  const outer = 190;
  const inner = 62;
  const hub = 46;
  const total = song.durationSeconds;
  const point = (radius: number, fraction: number) => {
    const angle = Math.PI + fraction * Math.PI;
    return `${(cx + radius * Math.cos(angle)).toFixed(2)} ${(cy + radius * Math.sin(angle)).toFixed(2)}`;
  };
  return (
    <svg viewBox="0 0 400 210" className={className} role="img" aria-label={`${song.title} drawn as a stained-glass fan`}>
      {song.segments.map((segment) => {
        const a = segment.startTimeSeconds / total;
        const b = segment.endTimeSeconds / total;
        const large = b - a > 0.5 ? 1 : 0;
        const d = [
          `M ${point(inner, a)}`,
          `L ${point(outer, a)}`,
          `A ${outer} ${outer} 0 ${large} 1 ${point(outer, b)}`,
          `L ${point(inner, b)}`,
          `A ${inner} ${inner} 0 ${large} 0 ${point(inner, a)}`,
          "Z",
        ].join(" ");
        return <path key={segment.id} d={d} fill={palette[segment.danceGear]} stroke={lead} strokeWidth={3} />;
      })}
      {/* second ring of small panes, like the glass border of a real mediopunto */}
      {Array.from({ length: 18 }, (_, i) => {
        const a = i / 18;
        const b = (i + 1) / 18;
        return (
          <path
            key={`ring-${i}`}
            d={`M ${point(hub, a)} L ${point(inner, a)} A ${inner} ${inner} 0 0 1 ${point(inner, b)} L ${point(hub, b)} A ${hub} ${hub} 0 0 0 ${point(hub, a)} Z`}
            fill={i % 2 ? lead : "transparent"}
            opacity={0.35}
            stroke={lead}
            strokeWidth={2}
          />
        );
      })}
      <path d={`M ${cx - hub} ${cy} A ${hub} ${hub} 0 0 1 ${cx + hub} ${cy} Z`} fill={lead} />
      <line x1={cx - outer - 6} y1={cy + 1} x2={cx + outer + 6} y2={cy + 1} stroke={lead} strokeWidth={6} />
    </svg>
  );
}

/** Decorative mediopunto (no data): concentric fan of glass panes. */
export function DecorativeFan({ colors, lead, className }: { colors: string[]; lead: string; className?: string }) {
  const cx = 200;
  const cy = 200;
  const rings = [
    { from: 60, to: 120, panes: 7 },
    { from: 120, to: 190, panes: 11 },
  ];
  const point = (radius: number, fraction: number) => {
    const angle = Math.PI + fraction * Math.PI;
    return `${(cx + radius * Math.cos(angle)).toFixed(2)} ${(cy + radius * Math.sin(angle)).toFixed(2)}`;
  };
  return (
    <svg viewBox="0 0 400 205" className={className} aria-hidden="true">
      {rings.flatMap((ring, r) =>
        Array.from({ length: ring.panes }, (_, i) => {
          const a = i / ring.panes;
          const b = (i + 1) / ring.panes;
          return (
            <path
              key={`${r}-${i}`}
              d={`M ${point(ring.from, a)} L ${point(ring.to, a)} A ${ring.to} ${ring.to} 0 0 1 ${point(ring.to, b)} L ${point(ring.from, b)} A ${ring.from} ${ring.from} 0 0 0 ${point(ring.from, a)} Z`}
              fill={colors[(i + r * 2) % colors.length]}
              stroke={lead}
              strokeWidth={4}
            />
          );
        })
      )}
      <path d={`M ${cx - 60} ${cy} A 60 60 0 0 1 ${cx + 60} ${cy} Z`} fill={colors[0]} stroke={lead} strokeWidth={4} />
      <line x1={4} y1={cy} x2={396} y2={cy} stroke={lead} strokeWidth={8} />
    </svg>
  );
}
