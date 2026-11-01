"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Copy,
  Check,
  Filter,
  PlusCircle,
  ExternalLink,
  Video,
  Music,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  type Move,
  type MoveCategory,
  MOVE_CATEGORIES,
} from "@/lib/moves/move-schema";
import { type CurriculumLevel } from "@/lib/constants/cuban-curriculum-2027";
import { type MoveReviewState } from "@/lib/moves/move-library";
import { type MoveReview, type MoveReviewReport } from "@/lib/moves/move-review";

interface MoveReviewListConsoleProps {
  moves: Move[];
  reviewStates: Record<string, MoveReviewState>;
  songSectionsCounts: Record<string, number>;
}

export function MoveReviewListConsole({
  moves,
  reviewStates,
  songSectionsCounts,
}: MoveReviewListConsoleProps) {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [levelFilter, setLevelFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const [localReviews, setLocalReviews] = useState<Record<string, MoveReview>>({});
  const [copied, setCopied] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [exportJson, setExportJson] = useState<string>("");

  // Scan localStorage for in-flight reviews
  useEffect(() => {
    try {
      const stored: Record<string, MoveReview> = {};
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("ritmoflow:move-review:")) {
          const moveId = key.replace("ritmoflow:move-review:", "");
          const raw = localStorage.getItem(key);
          if (raw) {
            try {
              stored[moveId] = JSON.parse(raw);
            } catch {
              // ignore corrupted entries
            }
          }
        }
      }
      setLocalReviews(stored);
    } catch {
      // localStorage unavailable or restricted
    }
  }, []);

  // Compute status counts
  const counts = {
    total: moves.length,
    approved: 0,
    needsWork: 0,
    rejected: 0,
    draft: 0,
  };

  for (const move of moves) {
    const local = localReviews[move.id];
    const status = local ? local.decision : reviewStates[move.id]?.status ?? "draft";
    if (status === "approved") counts.approved++;
    else if (status === "needs-work") counts.needsWork++;
    else if (status === "rejected") counts.rejected++;
    else counts.draft++;
  }

  // Filter moves
  const filteredMoves = moves.filter((move) => {
    const local = localReviews[move.id];
    const status = local ? local.decision : reviewStates[move.id]?.status ?? "draft";

    if (statusFilter !== "all" && status !== statusFilter) return false;
    if (categoryFilter !== "all" && move.category !== categoryFilter) return false;
    if (levelFilter !== "all" && move.level !== levelFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const matchName = move.name.toLowerCase().includes(q);
      const matchSpanish = move.spanishName?.toLowerCase().includes(q);
      const matchId = move.id.toLowerCase().includes(q);
      if (!matchName && !matchSpanish && !matchId) return false;
    }

    return true;
  });

  const localReviewsCount = Object.keys(localReviews).length;

  const handleCopyReport = () => {
    // Collect local drafts if any
    let localDrafts: Move[] = [];
    try {
      const rawDrafts = localStorage.getItem("ritmoflow:move-drafts");
      if (rawDrafts) {
        localDrafts = JSON.parse(rawDrafts);
      }
    } catch {
      // ignore
    }

    const report: MoveReviewReport = {
      kind: "ritmoflow-move-review",
      version: 1,
      reviews: Object.values(localReviews),
      drafts: localDrafts,
    };

    const formatted = JSON.stringify(report, null, 2);
    setExportJson(formatted);

    if (navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(formatted)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 3000);
        })
        .catch(() => {
          setShowExportModal(true);
        });
    } else {
      setShowExportModal(true);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border bg-card text-card-foreground shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold">Curriculum Review Desk</h2>
            {localReviewsCount > 0 && (
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30">
                {localReviewsCount} Pending In Browser
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Dancers only see moves approved by a teacher with verified music counts.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link href="/instructor/moves/import">
            <Button
              variant="outline"
              size="sm"
              className="min-h-[40px] text-xs font-semibold gap-1.5"
            >
              <PlusCircle className="h-4 w-4 text-emerald-400" />
              Import AI Drafts
            </Button>
          </Link>

          <Button
            onClick={handleCopyReport}
            disabled={localReviewsCount === 0}
            size="sm"
            className="min-h-[40px] text-xs font-semibold gap-1.5 bg-amber-600 hover:bg-amber-500 text-white"
          >
            {copied ? (
              <>
                <Check className="h-4 w-4" />
                Report Copied!
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Copy Review Report ({localReviewsCount})
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Metrics Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setStatusFilter("draft")}
          className={`p-3 rounded-xl border text-left transition-all min-h-[40px] ${
            statusFilter === "draft"
              ? "border-amber-500/40 bg-amber-500/10"
              : "bg-muted/30 hover:bg-muted/50"
          }`}
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Drafts</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold mt-1 text-foreground">{counts.draft}</p>
        </button>

        <button
          onClick={() => setStatusFilter("approved")}
          className={`p-3 rounded-xl border text-left transition-all min-h-[40px] ${
            statusFilter === "approved"
              ? "border-emerald-500/40 bg-emerald-500/10"
              : "bg-muted/30 hover:bg-muted/50"
          }`}
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Approved</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold mt-1 text-foreground">{counts.approved}</p>
        </button>

        <button
          onClick={() => setStatusFilter("needs-work")}
          className={`p-3 rounded-xl border text-left transition-all min-h-[40px] ${
            statusFilter === "needs-work"
              ? "border-yellow-500/40 bg-yellow-500/10"
              : "bg-muted/30 hover:bg-muted/50"
          }`}
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Needs Work</span>
            <AlertTriangle className="h-4 w-4 text-yellow-400" />
          </div>
          <p className="text-2xl font-bold mt-1 text-foreground">{counts.needsWork}</p>
        </button>

        <button
          onClick={() => setStatusFilter("rejected")}
          className={`p-3 rounded-xl border text-left transition-all min-h-[40px] ${
            statusFilter === "rejected"
              ? "border-red-500/40 bg-red-500/10"
              : "bg-muted/30 hover:bg-muted/50"
          }`}
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-medium">Rejected</span>
            <XCircle className="h-4 w-4 text-red-400" />
          </div>
          <p className="text-2xl font-bold mt-1 text-foreground">{counts.rejected}</p>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search move by name, Spanish phrase, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full min-h-[40px] rounded-xl border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="min-h-[40px] rounded-xl border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
          >
            <option value="all">All Statuses ({counts.total})</option>
            <option value="draft">Drafts Only</option>
            <option value="approved">Approved Only</option>
            <option value="needs-work">Needs Work</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="min-h-[40px] rounded-xl border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
          >
            <option value="all">All Categories</option>
            {MOVE_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="min-h-[40px] rounded-xl border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-amber-500/30"
          >
            <option value="all">All Levels</option>
            <option value="Beginner">Beginner</option>
            <option value="Improver">Improver</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          {(statusFilter !== "all" ||
            categoryFilter !== "all" ||
            levelFilter !== "all" ||
            searchQuery.trim() !== "") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStatusFilter("all");
                setCategoryFilter("all");
                setLevelFilter("all");
                setSearchQuery("");
              }}
              className="min-h-[40px] text-xs text-muted-foreground hover:text-foreground"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Move Cards List (Phone First) */}
      <div className="space-y-3">
        {filteredMoves.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed text-muted-foreground text-sm">
            No moves found matching the selected filters.
          </div>
        ) : (
          filteredMoves.map((move) => {
            const local = localReviews[move.id];
            const state = reviewStates[move.id];
            const currentStatus = local
              ? local.decision
              : state?.status ?? "draft";
            const songCount = songSectionsCounts[move.id] ?? 0;
            const hasUnverified = move.tags.includes("counts-unverified");

            return (
              <Link
                key={move.id}
                href={`/instructor/moves/${move.id}`}
                className="block group"
              >
                <Card className="p-4 rounded-xl border hover:border-amber-500/40 transition-all bg-card/60 hover:bg-card">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-base text-foreground group-hover:text-amber-400 transition-colors">
                          {move.name}
                        </span>
                        {move.spanishName && move.spanishName !== move.name && (
                          <span className="text-xs text-muted-foreground italic">
                            ({move.spanishName})
                          </span>
                        )}
                        {local && (
                          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-[10px]">
                            Modified Locally
                          </Badge>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <Badge variant="outline" className="text-xs">
                          {move.category}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {move.level}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {move.eightCounts} × 8-count
                        </Badge>

                        {hasUnverified && currentStatus !== "approved" && (
                          <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">
                            Counts Unverified
                          </Badge>
                        )}

                        <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
                          <Video className="h-3.5 w-3.5" />
                          {local ? local.videos.length : move.videos.length}
                        </span>

                        <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
                          <Music className="h-3.5 w-3.5" />
                          {songCount} section{songCount === 1 ? "" : "s"}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0">
                      {currentStatus === "approved" ? (
                        <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 gap-1 px-2.5 py-1 text-xs">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Approved
                        </Badge>
                      ) : currentStatus === "needs-work" ? (
                        <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 gap-1 px-2.5 py-1 text-xs">
                          <AlertTriangle className="h-3.5 w-3.5" />
                          Needs Work
                        </Badge>
                      ) : currentStatus === "rejected" ? (
                        <Badge className="bg-red-500/20 text-red-300 border-red-500/30 gap-1 px-2.5 py-1 text-xs">
                          <XCircle className="h-3.5 w-3.5" />
                          Rejected
                        </Badge>
                      ) : (
                        <Badge className="bg-amber-500/10 text-amber-300 border-amber-500/20 gap-1 px-2.5 py-1 text-xs">
                          <Clock className="h-3.5 w-3.5" />
                          Draft (Unreviewed)
                        </Badge>
                      )}

                      <span className="text-xs text-muted-foreground group-hover:text-amber-400 font-semibold inline-flex items-center gap-1">
                        Review <ExternalLink className="h-3.5 w-3.5" />
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })
        )}
      </div>

      {/* Fallback Export Modal for Clipboard Permission Restrictions */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-xl rounded-2xl border bg-card p-6 text-card-foreground shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold">Copy Move Review Report</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowExportModal(false)}
                className="text-xs"
              >
                Close
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Select all and copy this report JSON to send to Claude or apply with{" "}
              <code className="text-amber-300">scripts/apply-move-review.ts</code>:
            </p>
            <textarea
              readOnly
              value={exportJson}
              onClick={(e) => (e.target as HTMLTextAreaElement).select()}
              rows={12}
              className="w-full rounded-xl border bg-muted/40 p-3 font-mono text-xs text-foreground focus:outline-hidden"
            />
            <div className="flex justify-end gap-2">
              <Button
                size="sm"
                onClick={() => {
                  if (navigator?.clipboard?.writeText) {
                    navigator.clipboard.writeText(exportJson);
                    setCopied(true);
                  }
                  setShowExportModal(false);
                }}
                className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold"
              >
                Copy & Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
