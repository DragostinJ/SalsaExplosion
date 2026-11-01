"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  AlertTriangle,
  XCircle,
  Plus,
  ArrowRight,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { parseMoveInput, type MoveImportResult } from "@/lib/moves/move-import";
import { type Move } from "@/lib/moves/move-schema";

export function MoveImportConsole() {
  const [rawInput, setRawInput] = useState<string>("");
  const [result, setResult] = useState<MoveImportResult | null>(null);
  const [addedCount, setAddedCount] = useState<number | null>(null);

  const handleValidate = () => {
    setAddedCount(null);
    const parsed = parseMoveInput(rawInput);
    setResult(parsed);
  };

  const handleAddToReportDrafts = () => {
    if (!result || result.moves.length === 0) return;

    try {
      let existingDrafts: Move[] = [];
      const raw = localStorage.getItem("ritmoflow:move-drafts");
      if (raw) {
        existingDrafts = JSON.parse(raw);
      }

      // Merge new drafts by id
      const draftsMap = new Map<string, Move>();
      for (const d of existingDrafts) draftsMap.set(d.id, d);
      for (const d of result.moves) {
        // Enforce draft status: reviewedBy must be undefined
        draftsMap.set(d.id, { ...d, reviewedBy: undefined, videos: [] });
      }

      const updated = Array.from(draftsMap.values());
      localStorage.setItem("ritmoflow:move-drafts", JSON.stringify(updated));
      setAddedCount(result.moves.length);
    } catch {
      alert("Could not save drafts to browser storage. Check storage permissions.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Instructions Card */}
      <Card className="p-5 rounded-2xl border bg-card text-card-foreground space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-amber-400" />
          <h2 className="text-base font-bold">Import AI Studio &quot;Move Maker&quot; Drafts</h2>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Paste JSON output directly from Google AI Studio. Output can be a single move object, an array of moves, or fenced markdown (```json ... ```). Every imported move enters the queue as an unapproved draft requiring teacher verification.
        </p>

        <textarea
          rows={10}
          value={rawInput}
          onChange={(e) => setRawInput(e.target.value)}
          placeholder="Paste AI Studio JSON output here..."
          className="w-full rounded-xl border bg-muted/30 p-3 font-mono text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
        />

        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <Button
            size="sm"
            onClick={handleValidate}
            disabled={!rawInput.trim()}
            className="min-h-[40px] text-xs font-semibold px-4 bg-amber-600 hover:bg-amber-500 text-white"
          >
            Validate Move JSON
          </Button>

          {result && result.moves.length > 0 && result.errors.length === 0 && (
            <Button
              size="sm"
              onClick={handleAddToReportDrafts}
              className="min-h-[40px] text-xs font-semibold gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              {addedCount !== null ? (
                <>
                  <Check className="h-4 w-4" /> Added {addedCount} Draft(s) to Report Queue
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" /> Add {result.moves.length} Draft(s) to Review Report
                </>
              )}
            </Button>
          )}
        </div>
      </Card>

      {/* Validation Feedback */}
      {result && (
        <div className="space-y-4">
          {result.errors.length > 0 && (
            <Card className="p-4 rounded-xl border border-red-500/30 bg-red-500/10 text-red-300 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <XCircle className="h-4 w-4 shrink-0" />
                Validation Errors ({result.errors.length}):
              </div>
              <ul className="list-disc list-inside text-xs space-y-1">
                {result.errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </Card>
          )}

          {result.warnings.length > 0 && (
            <Card className="p-4 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-300 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-xs">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Validation Warnings ({result.warnings.length}):
              </div>
              <ul className="list-disc list-inside text-xs space-y-1">
                {result.warnings.map((warn, i) => (
                  <li key={i}>{warn}</li>
                ))}
              </ul>
            </Card>
          )}

          {/* Valid Moves Preview */}
          {result.moves.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">
                  Parsed Move Candidates ({result.moves.length})
                </h3>
                {addedCount !== null && (
                  <Link href="/instructor/moves">
                    <Button
                      variant="outline"
                      size="sm"
                      className="min-h-[40px] text-xs gap-1.5 text-amber-400 border-amber-500/30"
                    >
                      Go to Review Desk <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>

              <div className="space-y-4">
                {result.moves.map((move, idx) => (
                  <Card key={idx} className="p-5 rounded-2xl border bg-card/80 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2">
                      <div>
                        <span className="font-bold text-base text-foreground">{move.name}</span>
                        {move.spanishName && move.spanishName !== move.name && (
                          <span className="text-xs text-muted-foreground ml-2 italic">
                            ({move.spanishName})
                          </span>
                        )}
                        <span className="text-xs text-muted-foreground ml-2 font-mono">
                          ID: {move.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="text-xs">
                          {move.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {move.level}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {move.eightCounts} × 8-count
                        </Badge>
                      </div>
                    </div>

                    <p className="text-xs text-foreground leading-relaxed">{move.summary}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="p-3 rounded-xl bg-muted/30 text-xs space-y-1.5">
                        <span className="font-bold text-amber-400">Leader Breakdown:</span>
                        {move.leaderSteps.map((s, i) => (
                          <div key={i} className="text-[11px]">
                            <span className="font-mono text-amber-300 font-semibold">
                              {s.counts}:
                            </span>{" "}
                            {s.text}
                          </div>
                        ))}
                      </div>

                      <div className="p-3 rounded-xl bg-muted/30 text-xs space-y-1.5">
                        <span className="font-bold text-emerald-400">Follower Breakdown:</span>
                        {move.followerSteps.map((s, i) => (
                          <div key={i} className="text-[11px]">
                            <span className="font-mono text-emerald-300 font-semibold">
                              {s.counts}:
                            </span>{" "}
                            {s.text}
                          </div>
                        ))}
                      </div>
                    </div>

                    {move.commonMistakes.length > 0 && (
                      <div className="text-xs pt-1">
                        <span className="font-semibold text-red-400">Common Mistakes:</span>
                        <ul className="list-disc list-inside text-muted-foreground text-[11px] mt-0.5">
                          {move.commonMistakes.map((m, i) => (
                            <li key={i}>{m}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
