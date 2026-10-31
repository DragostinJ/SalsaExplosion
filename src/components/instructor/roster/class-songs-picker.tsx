"use client";

import { useState, useTransition } from "react";
import { Check, Music2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { setClassPracticeSongsAction } from "@/actions/class-songs.actions";
import { MAX_CLASS_PRACTICE_SONGS, type ClassSongSummary } from "@/lib/music/class-songs";
import { cn } from "@/lib/utils";

interface ClassSongsPickerProps {
  classSessionId: string;
  initialSongIds: string[];
  songOptions: ClassSongSummary[];
  onSaved: (songIds: string[]) => void;
}

/**
 * "Tonight's songs": the teacher picks up to 3 practice-player songs used in
 * class. Students see them on the door check-in page and with the recap.
 */
export function ClassSongsPicker({ classSessionId, initialSongIds, songOptions, onSaved }: ClassSongsPickerProps) {
  const [selected, setSelected] = useState<string[]>(initialSongIds);
  const [saved, setSaved] = useState<string[]>(initialSongIds);
  const [message, setMessage] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const isDirty = selected.join("|") !== saved.join("|");

  const toggle = (songId: string) => {
    setMessage(null);
    setSelected((current) =>
      current.includes(songId)
        ? current.filter((id) => id !== songId)
        : current.length >= MAX_CLASS_PRACTICE_SONGS
          ? current
          : [...current, songId]
    );
  };

  const save = () => {
    startTransition(async () => {
      const result = await setClassPracticeSongsAction({ classSessionId, songIds: selected });
      if (result.success) {
        setSaved(result.data.songIds);
        onSaved(result.data.songIds);
        setMessage(result.data.songIds.length ? "Saved. Students see these when they check in." : "Songs cleared.");
      } else {
        setMessage(result.error.message);
      }
    });
  };

  return (
    <section className="space-y-2 rounded-xl border bg-muted/20 p-3" aria-label="Tonight's songs" data-testid="class-songs-picker">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          <Music2 className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
          Tonight&apos;s songs · {selected.length}/{MAX_CLASS_PRACTICE_SONGS}
        </p>
        <Button type="button" size="sm" onClick={save} disabled={!isDirty || isPending} className="min-h-10 text-xs font-semibold">
          {isPending ? "Saving…" : "Save songs"}
        </Button>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {songOptions.map((song) => {
          const isSelected = selected.includes(song.id);
          const isFull = !isSelected && selected.length >= MAX_CLASS_PRACTICE_SONGS;
          return (
            <button
              key={song.id}
              type="button"
              aria-pressed={isSelected}
              disabled={isFull}
              onClick={() => toggle(song.id)}
              className={cn(
                "flex min-h-10 items-center gap-1 rounded-full border px-3 text-xs font-semibold transition-colors disabled:opacity-40",
                isSelected ? "border-amber-400 bg-amber-400/15 text-amber-300" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isSelected && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
              {song.title}
            </button>
          );
        })}
      </div>
      {message && <p className="text-xs text-muted-foreground">{message}</p>}
    </section>
  );
}
