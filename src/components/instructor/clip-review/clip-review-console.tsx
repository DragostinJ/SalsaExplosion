"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  XCircle,
  Play,
  Copy,
  Check,
  ExternalLink,
  Film,
  Music,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  parseClipBreakdownInput,
  parseClipTimestamp,
  type ClipBreakdown,
  type ClipReviewReport,
} from "@/lib/moves/pro-clips";
import {
  TYPE,
  KICKER,
  POSTER_BUTTON,
  POSTER_BUTTON_COLORS,
} from "@/components/poster/poster-kit";

interface AvailableMove {
  id: string;
  name: string;
}

interface ClipReviewConsoleProps {
  currentUserName: string;
  availableMoves: AvailableMove[];
}

interface RowReviewState {
  decision: "confirmed" | "unsure" | "rejected" | null;
  moveIdsInput: string;
  note: string;
}

export function ClipReviewConsole({
  currentUserName,
  availableMoves,
}: ClipReviewConsoleProps) {
  const [rawInput, setRawInput] = useState<string>("");
  const [clip, setClip] = useState<ClipBreakdown | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [reviewedBy, setReviewedBy] = useState<string>(currentUserName);
  const [activePlayback, setActivePlayback] = useState<{
    start: number;
    end: number;
  } | null>(null);
  const [playerKey, setPlayerKey] = useState<number>(0);
  const [rowStates, setRowStates] = useState<Record<number, RowReviewState>>({});
  const [copied, setCopied] = useState<boolean>(false);

  // Map of known moves for fast name lookups
  const movesMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const m of availableMoves) {
      map.set(m.id, m.name);
    }
    return map;
  }, [availableMoves]);

  const validMoveIdsSet = useMemo(() => {
    return new Set(availableMoves.map((m) => m.id));
  }, [availableMoves]);

  const handleValidate = () => {
    setParseErrors([]);
    const result = parseClipBreakdownInput(rawInput);
    if (!result.ok || !result.clip) {
      setParseErrors(result.errors || ["Failed to parse breakdown input."]);
      setClip(null);
      return;
    }

    setClip(result.clip);
    setParseErrors([]);
    setActivePlayback(null);
    setPlayerKey(0);

    // Initialise review states for each row
    const initialStates: Record<number, RowReviewState> = {};
    result.clip.rows.forEach((row, idx) => {
      initialStates[idx] = {
        decision: null,
        moveIdsInput: row.moveIds.join(", "),
        note: "",
      };
    });
    setRowStates(initialStates);
  };

  const handlePlayRow = (index: number) => {
    if (!clip || !clip.rows[index]) return;
    const row = clip.rows[index];
    const startParse = parseClipTimestamp(row.start);
    const endParse = parseClipTimestamp(row.end);

    if (startParse.ok && endParse.ok) {
      const start = Math.floor(startParse.seconds);
      const end = Math.ceil(endParse.seconds);
      setActivePlayback({ start, end });
      setPlayerKey((k) => k + 1);
    }
  };

  const handleSetDecision = (
    index: number,
    decision: "confirmed" | "unsure" | "rejected"
  ) => {
    setRowStates((prev) => {
      const current = prev[index] || {
        decision: null,
        moveIdsInput: clip?.rows[index]?.moveIds.join(", ") ?? "",
        note: "",
      };
      return {
        ...prev,
        [index]: {
          ...current,
          decision: current.decision === decision ? null : decision,
        },
      };
    });
  };

  const handleMoveIdsChange = (index: number, value: string) => {
    setRowStates((prev) => {
      const current = prev[index] || {
        decision: null,
        moveIdsInput: "",
        note: "",
      };
      return {
        ...prev,
        [index]: {
          ...current,
          moveIdsInput: value,
        },
      };
    });
  };

  const handleNoteChange = (index: number, value: string) => {
    setRowStates((prev) => {
      const current = prev[index] || {
        decision: null,
        moveIdsInput: clip?.rows[index]?.moveIds.join(", ") ?? "",
        note: "",
      };
      return {
        ...prev,
        [index]: {
          ...current,
          note: value,
        },
      };
    });
  };

  const totalRows = clip?.rows.length ?? 0;
  const decisionsCount = useMemo(() => {
    let count = 0;
    for (let i = 0; i < totalRows; i++) {
      if (rowStates[i]?.decision) count++;
    }
    return count;
  }, [totalRows, rowStates]);

  const allRowsDecided = totalRows > 0 && decisionsCount === totalRows;

  const handleCopyReport = async () => {
    if (!clip || !allRowsDecided) return;

    const report: ClipReviewReport = {
      kind: "ritmoflow-clip-review",
      version: 1,
      reviewedBy: reviewedBy.trim() || currentUserName,
      reviewedAt: new Date().toISOString(),
      clip: {
        ...clip,
        rows: clip.rows.map((row, idx) => {
          const rawIds = rowStates[idx]?.moveIdsInput ?? "";
          const cleanedIds = rawIds
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
          return {
            ...row,
            moveIds: cleanedIds,
          };
        }),
      },
      decisions: clip.rows.map((_, idx) => {
        const state = rowStates[idx];
        const rawIds = state?.moveIdsInput ?? "";
        const cleanedIds = rawIds
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        const decision = state?.decision ?? "unsure";
        const note = state?.note?.trim();

        return {
          row: idx,
          decision,
          moveIds: cleanedIds,
          ...(note ? { note } : {}),
        };
      }),
    };

    try {
      await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      alert("Failed to copy report to clipboard. Check browser permissions.");
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Input & Validation Card */}
      <Card className="border-4 border-ink bg-paper p-6 text-ink shadow-[6px_6px_0_0_#161311] space-y-4">
        <div className="flex items-center gap-2 border-b-2 border-ink pb-3">
          <Film className="h-5 w-5 text-poster-red" />
          <h2 className={`font-display ${TYPE.card} uppercase text-ink`}>
            Paste AI Studio Move Mapper Breakdown
          </h2>
        </div>
        <p className="text-xs font-medium text-ink/80 leading-relaxed">
          Paste the raw JSON breakdown generated by Google AI Studio Move Mapper.
          The format accepts raw JSON or markdown code fences (```json ... ```).
          Every row must be verified by a teacher before figures are linked in the library.
        </p>

        <div className="space-y-1.5">
          <label htmlFor="breakdown-input" className="text-xs font-bold uppercase tracking-wider text-ink">
            Breakdown JSON Payload
          </label>
          <textarea
            id="breakdown-input"
            rows={8}
            value={rawInput}
            onChange={(e) => setRawInput(e.target.value)}
            placeholder='{"kind": "ritmoflow-clip-breakdown", "version": 1, ...}'
            className="w-full border-2 border-ink bg-paper p-3 font-mono text-xs text-ink placeholder:text-ink/40 focus:outline-hidden focus:ring-2 focus:ring-poster-red"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Button
            type="button"
            onClick={handleValidate}
            disabled={!rawInput.trim()}
            className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} min-h-[40px] px-5 text-xs`}
          >
            <Sparkles className="h-4 w-4 mr-1.5" />
            Validate Breakdown Payload
          </Button>

          {clip && (
            <Badge className="border-2 border-ink bg-poster-teal/20 text-ink text-xs font-bold px-3 py-1">
              ✓ Payload Validated: {clip.rows.length} Rows Ready for Review
            </Badge>
          )}
        </div>

        {parseErrors.length > 0 && (
          <div
            role="alert"
            className="border-2 border-poster-red bg-poster-red/15 p-4 space-y-2 text-ink"
          >
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-poster-red">
              <AlertTriangle className="h-4 w-4 text-poster-red shrink-0" />
              <span>Validation Errors ({parseErrors.length})</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-xs font-medium">
              {parseErrors.map((err, i) => (
                <li key={i} className="leading-snug">{err}</li>
              ))}
            </ul>
          </div>
        )}
      </Card>

      {/* 2. Review Workspace */}
      {clip && (
        <div className="space-y-6">
          {/* Clip Metadata & Reviewer Card */}
          <div className="border-4 border-ink bg-paper p-6 text-ink shadow-[6px_6px_0_0_#161311] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-ink pb-3">
              <div>
                <span className={KICKER}>Clip Breakdown Desk</span>
                <h3 className={`font-display ${TYPE.section} leading-none text-ink`}>
                  {clip.title}
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase text-ink/70">
                  Channel: <strong className="text-ink">{clip.channelTitle}</strong>
                </span>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-poster-teal" />
                <span>Dancers: <strong>{clip.dancers.join(", ")}</strong></span>
              </div>
              {clip.songId && (
                <div className="flex items-center gap-2">
                  <Music className="h-4 w-4 text-poster-mustard" />
                  <span>Song Track: <strong>{clip.songId}</strong></span>
                </div>
              )}
              <div className="flex items-center gap-2">
                <Film className="h-4 w-4 text-poster-red" />
                <span>YouTube ID: <code>{clip.youtubeVideoId}</code></span>
              </div>
            </div>

            {/* Teacher Attribution Input */}
            <div className="border-t-2 border-ink pt-4 max-w-md space-y-1">
              <label
                htmlFor="reviewed-by-input"
                className="text-xs font-bold uppercase tracking-wider text-ink block"
              >
                Reviewed By (Teacher Display Name)
              </label>
              <input
                id="reviewed-by-input"
                type="text"
                value={reviewedBy}
                onChange={(e) => setReviewedBy(e.target.value)}
                className="w-full border-2 border-ink bg-paper px-3 py-2 text-xs font-bold text-ink focus:outline-hidden focus:ring-2 focus:ring-poster-red"
              />
            </div>
          </div>

          {/* YouTube Nocookie Player Embed (compliant >= 200x200, strictly unobscured) */}
          <div className="border-4 border-ink bg-black p-2 shadow-[6px_6px_0_0_#161311]">
            <div className="relative w-full aspect-video min-w-[200px] min-h-[200px] bg-black overflow-hidden select-none">
              <iframe
                key={playerKey}
                src={`https://www.youtube-nocookie.com/embed/${clip.youtubeVideoId}${
                  activePlayback
                    ? `?start=${activePlayback.start}&end=${activePlayback.end}&autoplay=1`
                    : ""
                }`}
                title={clip.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 w-full h-full border-0"
              />
            </div>
            {activePlayback && (
              <div className="p-2 bg-ink text-paper text-xs flex items-center justify-between font-mono">
                <span>
                  Looping range: {activePlayback.start}s → {activePlayback.end}s
                </span>
                <span className="text-poster-mustard font-bold uppercase text-[10px]">
                  Autoplay triggered by row click
                </span>
              </div>
            )}
          </div>

          {/* List of Breakdown Rows */}
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b-4 border-ink pb-2">
              <h4 className={`font-display ${TYPE.card} uppercase text-ink`}>
                Breakdown Timeline ({clip.rows.length} Sections)
              </h4>
              <span className="text-xs font-bold uppercase tracking-wider text-ink/80">
                Progress: {decisionsCount} / {totalRows} Decided
              </span>
            </div>

            {clip.rows.map((row, idx) => {
              const state = rowStates[idx] || {
                decision: null,
                moveIdsInput: row.moveIds.join(", "),
                note: "",
              };

              const rawEnteredIds = state.moveIdsInput
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean);

              const invalidEnteredIds = rawEnteredIds.filter(
                (id) => !validMoveIdsSet.has(id)
              );

              const isConfirmed = state.decision === "confirmed";
              const isUnsure = state.decision === "unsure";
              const isRejected = state.decision === "rejected";

              return (
                <article
                  key={idx}
                  className={`border-4 border-ink bg-paper p-5 transition-colors shadow-[4px_4px_0_0_#161311] ${
                    isConfirmed
                      ? "border-l-8 border-l-emerald-600"
                      : isRejected
                      ? "border-l-8 border-l-poster-red"
                      : isUnsure
                      ? "border-l-8 border-l-poster-mustard"
                      : ""
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-ink pb-2">
                    <div className="flex items-center gap-2">
                      <span className="border border-ink bg-poster-mustard px-2 py-0.5 font-mono text-xs font-bold text-ink">
                        Row {idx + 1}
                      </span>
                      <span className="font-mono text-xs font-bold text-ink">
                        {row.start} → {row.end}
                      </span>
                      <Badge className="border border-ink bg-paper uppercase text-[10px] font-bold text-ink">
                        {row.type}
                      </Badge>
                      <Badge className="border border-ink bg-paper text-[10px] font-medium text-ink">
                        Match: {row.match} ({row.confidence} confidence)
                      </Badge>
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handlePlayRow(idx)}
                      className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} min-h-[40px] px-3 text-xs gap-1`}
                      aria-label={`Play row ${idx + 1} from ${row.start} to ${row.end}`}
                    >
                      <Play className="h-3.5 w-3.5 fill-current" />
                      Play this row
                    </Button>
                  </div>

                  <div className="py-3 space-y-2">
                    <p className="text-xs font-medium text-ink leading-relaxed">
                      <strong className="text-ink font-bold uppercase text-[11px] block">
                        Mechanics &amp; Figure Dynamics:
                      </strong>
                      {row.mechanics}
                    </p>

                    {row.musicalMoment && (
                      <p className="text-xs text-ink/80 italic bg-poster-teal/10 p-2 border-l-2 border-ink">
                        <strong className="not-italic font-bold">Musical Accent:</strong>{" "}
                        {row.musicalMoment}
                      </p>
                    )}

                    {row.newMove && (
                      <div className="text-xs bg-poster-mustard/20 p-2 border-2 border-ink space-y-1">
                        <span className="font-bold uppercase text-[10px] text-accent-red block">
                          Suggested New Library Move:
                        </span>
                        <div>
                          <strong>{row.newMove.name}</strong> ({row.newMove.category} · {row.newMove.level})
                        </div>
                      </div>
                    )}

                    {/* Matched Moves Links */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-ink/70">
                        Library Links:
                      </span>
                      {rawEnteredIds.length === 0 ? (
                        <span className="text-xs italic text-ink/50">None specified</span>
                      ) : (
                        rawEnteredIds.map((id) => {
                          const moveName = movesMap.get(id);
                          if (!moveName) {
                            return (
                              <span
                                key={id}
                                className="border border-poster-red bg-poster-red/20 text-poster-red px-1.5 py-0.5 text-xs font-bold"
                              >
                                {id} (Not in Library)
                              </span>
                            );
                          }
                          return (
                            <Link
                              key={id}
                              href={`/moves/${id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 border border-ink bg-paper px-2 py-0.5 text-xs font-bold text-ink hover:bg-poster-mustard transition-colors"
                            >
                              <span>{moveName}</span>
                              <ExternalLink className="h-3 w-3 text-ink/60" />
                            </Link>
                          );
                        })
                      )}
                    </div>
                  </div>

                  {/* Teacher Decision & Editing Controls */}
                  <div className="border-t-2 border-ink pt-3 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      {/* Move IDs Editor */}
                      <div className="space-y-1">
                        <label
                          htmlFor={`move-ids-${idx}`}
                          className="text-[11px] font-bold uppercase tracking-wider text-ink block"
                        >
                          Matched Move IDs (comma-separated)
                        </label>
                        <input
                          id={`move-ids-${idx}`}
                          type="text"
                          value={state.moveIdsInput}
                          onChange={(e) => handleMoveIdsChange(idx, e.target.value)}
                          placeholder="e.g. guapea, dile-que-no"
                          className="w-full border-2 border-ink bg-paper px-2.5 py-1.5 font-mono text-xs text-ink focus:outline-hidden focus:ring-2 focus:ring-poster-red"
                        />
                        {invalidEnteredIds.length > 0 && (
                          <p className="text-[11px] text-poster-red font-bold">
                            Unknown move ID(s): {invalidEnteredIds.join(", ")}
                          </p>
                        )}
                      </div>

                      {/* Optional Note */}
                      <div className="space-y-1">
                        <label
                          htmlFor={`note-${idx}`}
                          className="text-[11px] font-bold uppercase tracking-wider text-ink block"
                        >
                          Teacher Note (optional)
                        </label>
                        <input
                          id={`note-${idx}`}
                          type="text"
                          value={state.note}
                          onChange={(e) => handleNoteChange(idx, e.target.value)}
                          placeholder="e.g. Follower styling flourish on count 5"
                          className="w-full border-2 border-ink bg-paper px-2.5 py-1.5 text-xs text-ink focus:outline-hidden focus:ring-2 focus:ring-poster-red"
                        />
                      </div>
                    </div>

                    {/* Decision Button Group */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Button
                          type="button"
                          size="sm"
                          aria-pressed={isConfirmed}
                          onClick={() => handleSetDecision(idx, "confirmed")}
                          className={`min-h-[40px] px-3.5 text-xs font-bold gap-1.5 border-2 border-ink transition-colors ${
                            isConfirmed
                              ? "bg-emerald-600 text-white shadow-[2px_2px_0_0_#161311]"
                              : "bg-paper text-ink hover:bg-emerald-600/10"
                          }`}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                          <span>{isConfirmed ? "Confirmed ✓" : "Confirm"}</span>
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          aria-pressed={isUnsure}
                          onClick={() => handleSetDecision(idx, "unsure")}
                          className={`min-h-[40px] px-3.5 text-xs font-bold gap-1.5 border-2 border-ink transition-colors ${
                            isUnsure
                              ? "bg-poster-mustard text-ink shadow-[2px_2px_0_0_#161311]"
                              : "bg-paper text-ink hover:bg-poster-mustard/20"
                          }`}
                        >
                          <HelpCircle className="h-4 w-4" />
                          <span>{isUnsure ? "Unsure ?" : "Unsure"}</span>
                        </Button>

                        <Button
                          type="button"
                          size="sm"
                          aria-pressed={isRejected}
                          onClick={() => handleSetDecision(idx, "rejected")}
                          className={`min-h-[40px] px-3.5 text-xs font-bold gap-1.5 border-2 border-ink transition-colors ${
                            isRejected
                              ? "bg-poster-red text-white shadow-[2px_2px_0_0_#161311]"
                              : "bg-paper text-ink hover:bg-poster-red/20"
                          }`}
                        >
                          <XCircle className="h-4 w-4" />
                          <span>{isRejected ? "Rejected ✗" : "Reject"}</span>
                        </Button>
                      </div>

                      <div className="text-xs font-bold">
                        {isConfirmed && <span className="text-emerald-700">✓ Added to verified curriculum data</span>}
                        {isUnsure && <span className="text-amber-700">? Marked for senior instructor audit</span>}
                        {isRejected && <span className="text-poster-red">✗ Excluded from student curriculum</span>}
                        {!state.decision && <span className="text-ink/60">Awaiting teacher decision</span>}
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          {/* Sticky Bottom Review Summary Bar */}
          <div className="sticky bottom-4 z-20 border-4 border-ink bg-paper p-4 text-ink shadow-[8px_8px_0_0_#161311] flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-ink">
                Review Progress: {decisionsCount} / {totalRows} Rows Decided
              </div>
              <p className="text-[11px] text-ink/70">
                {allRowsDecided
                  ? "All rows evaluated. Ready to copy review report payload."
                  : "Every row must be marked as Confirmed, Unsure, or Rejected to copy report."}
              </p>
            </div>

            <Button
              type="button"
              disabled={!allRowsDecided}
              onClick={handleCopyReport}
              className={`${POSTER_BUTTON} ${
                allRowsDecided ? POSTER_BUTTON_COLORS.mustard : POSTER_BUTTON_COLORS.ink
              } min-h-[40px] px-6 text-xs font-bold gap-2`}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-emerald-400" />
                  <span>Report Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Clip Review Report</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
