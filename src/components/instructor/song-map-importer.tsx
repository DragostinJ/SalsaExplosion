"use client";

import { useState } from "react";
import { CircleCheck, ClipboardCopy, Play, TriangleAlert } from "lucide-react";
import type { SongAnatomy } from "@/lib/constants/timba-song-anatomy";
import { buildArgusPrompt, parseSongMapInput, toSongDataEntry, type SongMapImportResult } from "@/lib/music/song-map-import";
import { DANCE_GEAR_LEGEND } from "@/lib/music/dance-gear-legend";
import { formatSongTime } from "@/lib/music/song-timing";
import { cn } from "@/lib/utils";
import { SongPlayerScreen } from "@/components/music/song-player/song-player-screen";

type CopyTarget = "prompt" | "entry";

/**
 * Argus → app workflow:
 * 1. Copy the Argus prompt and run it in Gemini/Argus with the song.
 * 2. Paste the JSON here and validate (schema, timeline, moves).
 * 3. Preview it in the real player (add ?calibrate=1 style checks by ear).
 * 4. Copy the data entry and add it to timba-song-anatomy.ts (or send it to Claude).
 */
export function SongMapImporter() {
  const [raw, setRaw] = useState("");
  const [result, setResult] = useState<SongMapImportResult | null>(null);
  const [previewSong, setPreviewSong] = useState<SongAnatomy | null>(null);
  const [copied, setCopied] = useState<CopyTarget | null>(null);

  const copy = async (target: CopyTarget, text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(target);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      setCopied(null);
    }
  };

  if (previewSong) {
    return (
      <div className="fixed inset-0 z-[70] bg-canvas">
        <SongPlayerScreen song={previewSong} onExit={() => setPreviewSong(null)} />
      </div>
    );
  }

  const song = result?.song ?? null;

  return (
    <div className="space-y-6" data-testid="song-map-importer">
      <section className="rounded-2xl border border-line bg-surface-2 p-4 sm:p-6">
        <h2 className="text-lg font-bold">1. Ask Argus for the timing</h2>
        <p className="mt-1 text-sm text-ivory-muted">
          This prompt tells Argus the exact JSON shape, allowed gears and move ids, and the timing rules the player
          depends on.
        </p>
        <button
          type="button"
          onClick={() => copy("prompt", buildArgusPrompt())}
          className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-gold px-4 text-sm font-bold text-gold"
        >
          <ClipboardCopy className="h-4 w-4" />
          {copied === "prompt" ? "Prompt copied" : "Copy Argus prompt"}
        </button>
      </section>

      <section className="rounded-2xl border border-line bg-surface-2 p-4 sm:p-6">
        <h2 className="text-lg font-bold">2. Paste Argus output</h2>
        <label htmlFor="song-map-json" className="sr-only">
          Argus JSON output
        </label>
        <textarea
          id="song-map-json"
          value={raw}
          onChange={(event) => {
            setRaw(event.target.value);
            setResult(null);
          }}
          rows={12}
          spellCheck={false}
          placeholder='{ "id": "my-song", "title": "...", "segments": [ ... ] }'
          className="mt-3 w-full rounded-xl border border-line bg-canvas p-3 font-mono text-xs text-ivory"
        />
        <button
          type="button"
          onClick={() => setResult(parseSongMapInput(raw))}
          className="mt-3 inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-gold px-4 text-sm font-bold text-canvas"
        >
          Validate
        </button>

        {result && (
          <div className="mt-4 space-y-3 text-sm">
            {result.errors.length > 0 ? (
              <div className="rounded-xl border border-danger-line bg-danger-soft p-3">
                <p className="flex items-center gap-2 font-bold text-danger">
                  <TriangleAlert className="h-4 w-4" /> {result.errors.length} problem(s) to fix in Argus
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 font-mono text-xs">
                  {result.errors.map((error) => (
                    <li key={error}>{error}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="flex items-center gap-2 font-bold text-success">
                <CircleCheck className="h-4 w-4" /> Valid song map
              </p>
            )}
            {result.warnings.length > 0 && (
              <div className="rounded-xl border border-warning-line bg-warning-soft p-3">
                <p className="font-bold text-warning">Warnings</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 font-mono text-xs">
                  {result.warnings.map((warning) => (
                    <li key={warning}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </section>

      {song && (
        <section className="rounded-2xl border border-line bg-surface-2 p-4 sm:p-6">
          <h2 className="text-lg font-bold">3. Check it, then publish</h2>
          <p className="mt-1 text-sm text-ivory-muted">
            {song.title} · {song.artist} · {song.bpm} BPM · {formatSongTime(song.durationSeconds)} ·{" "}
            {song.segments.length} sections
          </p>
          <div className="mt-3 flex h-3 gap-px overflow-hidden rounded-full" aria-hidden="true">
            {song.segments.map((segment) => (
              <span
                key={segment.id}
                className={cn("h-full", DANCE_GEAR_LEGEND[segment.danceGear].fillClass)}
                style={{
                  width: `${((segment.endTimeSeconds - segment.startTimeSeconds) / song.durationSeconds) * 100}%`,
                }}
              />
            ))}
          </div>
          <ol className="mt-3 space-y-1 text-xs">
            {song.segments.map((segment) => (
              <li key={segment.id} className="flex gap-3">
                <span className="w-24 shrink-0 font-mono text-ivory-muted">{segment.formattedRange}</span>
                <span className={cn("w-24 shrink-0 font-bold", DANCE_GEAR_LEGEND[segment.danceGear].textClass)}>
                  {DANCE_GEAR_LEGEND[segment.danceGear].shortLabel}
                </span>
                <span className="min-w-0 truncate">{segment.sectionName}</span>
              </li>
            ))}
          </ol>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setPreviewSong(song)}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl bg-gold px-4 text-sm font-bold text-canvas"
            >
              <Play className="h-4 w-4" /> Preview in the player
            </button>
            <button
              type="button"
              onClick={() => copy("entry", toSongDataEntry(song))}
              className="inline-flex min-h-[44px] items-center gap-2 rounded-xl border border-gold px-4 text-sm font-bold text-gold"
            >
              <ClipboardCopy className="h-4 w-4" />
              {copied === "entry" ? "Entry copied" : "Copy data entry"}
            </button>
          </div>
          <p className="mt-3 text-xs text-ivory-muted">
            Publishing: paste the copied entry into <code>src/lib/constants/timba-song-anatomy.ts</code> (or send it to
            Claude). Tests check every timeline before deploy.
          </p>
        </section>
      )}
    </div>
  );
}
