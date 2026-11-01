"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  Plus,
  Trash2,
  ChevronUp,
  ChevronDown,
  Video,
  Music,
  Save,
  RotateCcw,
  Search,
  Check,
  ChevronRight,
  ShieldAlert,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  type Move,
  type MoveStep,
  type MoveVideo,
} from "@/lib/moves/move-schema";
import {
  type MoveReviewState,
  type MoveSongSectionLink,
} from "@/lib/moves/move-library";
import {
  type MoveReview,
  type MoveReviewDecision,
  moveFingerprint,
} from "@/lib/moves/move-review";
import {
  parseYouTubeVideoId,
  parseTimeStringToSeconds,
} from "@/lib/moves/youtube-url-parser";
import { checkMoveVideoOembedAction } from "@/actions/move-review.actions";

interface MoveReviewDetailConsoleProps {
  move: Move;
  reviewState: MoveReviewState;
  sections: MoveSongSectionLink[];
  currentUserName: string;
}

export function MoveReviewDetailConsole({
  move,
  reviewState,
  sections,
  currentUserName,
}: MoveReviewDetailConsoleProps) {
  const router = useRouter();

  // Local editable draft state (mirroring edits)
  const [name, setName] = useState<string>(move.name);
  const [spanishName, setSpanishName] = useState<string>(move.spanishName ?? "");
  const [level, setLevel] = useState<string>(move.level);
  const [eightCounts, setEightCounts] = useState<number>(move.eightCounts);
  const [summary, setSummary] = useState<string>(move.summary);
  const [leaderSteps, setLeaderSteps] = useState<MoveStep[]>(move.leaderSteps);
  const [followerSteps, setFollowerSteps] = useState<MoveStep[]>(move.followerSteps);
  const [commonMistakes, setCommonMistakes] = useState<string[]>(move.commonMistakes);
  const [variations, setVariations] = useState<string[]>(move.variations);
  const [prerequisites, setPrerequisites] = useState<string[]>(move.prerequisites);
  const [videos, setVideos] = useState<MoveVideo[]>(move.videos);

  // Review decision controls
  const [reviewedBy, setReviewedBy] = useState<string>(
    reviewState.review?.reviewedBy || currentUserName || "Maestro Enrique"
  );
  const [decision, setDecision] = useState<MoveReviewDecision>(
    reviewState.review?.decision || "approved"
  );
  const [countsVerified, setCountsVerified] = useState<boolean>(
    reviewState.review?.countsVerified ?? false
  );
  const [notes, setNotes] = useState<string>(reviewState.review?.notes ?? "");

  // Video attacher states
  const [youtubeInput, setYoutubeInput] = useState<string>("");
  const [startTimeInput, setStartTimeInput] = useState<string>("");
  const [endTimeInput, setEndTimeInput] = useState<string>("");
  const [isCheckingVideo, setIsCheckingVideo] = useState<boolean>(false);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [videoSuccess, setVideoSuccess] = useState<string | null>(null);
  const [showYoutubeRules, setShowYoutubeRules] = useState<boolean>(false);

  // UI status helpers
  const [savedLocally, setSavedLocally] = useState<boolean>(false);
  const [hasLocalEdits, setHasLocalEdits] = useState<boolean>(false);

  const storageKey = `ritmoflow:move-review:${move.id}`;
  const baseFingerprint = reviewState.fingerprint || moveFingerprint(move);

  // Load from localStorage on mount if present
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const stored: MoveReview = JSON.parse(raw);
        setHasLocalEdits(true);
        setDecision(stored.decision);
        setCountsVerified(stored.countsVerified);
        if (stored.reviewedBy) setReviewedBy(stored.reviewedBy);
        if (stored.notes) setNotes(stored.notes);
        if (stored.videos) setVideos(stored.videos);

        if (stored.edits) {
          if (stored.edits.name) setName(stored.edits.name);
          if (stored.edits.spanishName !== undefined) setSpanishName(stored.edits.spanishName);
          if (stored.edits.level) setLevel(stored.edits.level);
          if (stored.edits.eightCounts) setEightCounts(stored.edits.eightCounts);
          if (stored.edits.summary) setSummary(stored.edits.summary);
          if (stored.edits.leaderSteps) setLeaderSteps(stored.edits.leaderSteps);
          if (stored.edits.followerSteps) setFollowerSteps(stored.edits.followerSteps);
          if (stored.edits.commonMistakes) setCommonMistakes(stored.edits.commonMistakes);
          if (stored.edits.variations) setVariations(stored.edits.variations);
          if (stored.edits.prerequisites) setPrerequisites(stored.edits.prerequisites);
        }
      }
    } catch {
      // localStorage unavailable or restricted
    }
  }, [storageKey]);

  // Step manipulation helpers
  const updateStep = (
    listType: "leader" | "follower",
    index: number,
    field: "counts" | "text",
    val: string
  ) => {
    const list = listType === "leader" ? [...leaderSteps] : [...followerSteps];
    list[index] = { ...list[index], [field]: val };
    if (listType === "leader") setLeaderSteps(list);
    else setFollowerSteps(list);
  };

  const addStep = (listType: "leader" | "follower") => {
    const list = listType === "leader" ? [...leaderSteps] : [...followerSteps];
    list.push({ counts: "1-3", text: "" });
    if (listType === "leader") setLeaderSteps(list);
    else setFollowerSteps(list);
  };

  const removeStep = (listType: "leader" | "follower", index: number) => {
    const list = listType === "leader" ? [...leaderSteps] : [...followerSteps];
    if (list.length <= 1) return;
    list.splice(index, 1);
    if (listType === "leader") setLeaderSteps(list);
    else setFollowerSteps(list);
  };

  const moveStep = (
    listType: "leader" | "follower",
    index: number,
    direction: "up" | "down"
  ) => {
    const list = listType === "leader" ? [...leaderSteps] : [...followerSteps];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;
    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;
    if (listType === "leader") setLeaderSteps(list);
    else setFollowerSteps(list);
  };

  // Video verification via server action
  const handleAttachVideo = async () => {
    setVideoError(null);
    setVideoSuccess(null);

    const videoId = parseYouTubeVideoId(youtubeInput);
    if (!videoId) {
      setVideoError("Could not extract a valid 11-character YouTube video ID from the input.");
      return;
    }

    const startSec = parseTimeStringToSeconds(startTimeInput) ?? undefined;
    const endSec = parseTimeStringToSeconds(endTimeInput) ?? undefined;

    if (startSec !== undefined && endSec !== undefined && endSec <= startSec) {
      setVideoError("End time must be greater than start time.");
      return;
    }

    setIsCheckingVideo(true);
    try {
      const result = await checkMoveVideoOembedAction({ videoId });
      if (!result.success || result.availability !== "ok" || !result.title || !result.channelTitle) {
        setVideoError(result.error || `Video is not embeddable (${result.availability})`);
        return;
      }

      const newVideo: MoveVideo = {
        youtubeVideoId: videoId,
        title: result.title,
        channelTitle: result.channelTitle,
        startSeconds: startSec,
        endSeconds: endSec,
        embeddable: true,
        checkedAt: result.checkedAt || new Date().toISOString(),
      };

      setVideos([...videos, newVideo]);
      setYoutubeInput("");
      setStartTimeInput("");
      setEndTimeInput("");
      setVideoSuccess(`Successfully verified and attached: "${result.title}"`);
      setTimeout(() => setVideoSuccess(null), 4000);
    } catch (err) {
      setVideoError(`Validation failed: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsCheckingVideo(false);
    }
  };

  const removeVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  // Save review to localStorage
  const handleSaveReview = () => {
    const reviewData: MoveReview = {
      moveId: move.id,
      reviewedBy: reviewedBy.trim() || currentUserName,
      reviewedAt: new Date().toISOString(),
      basedOn: baseFingerprint,
      decision,
      countsVerified,
      notes: notes.trim() || undefined,
      videos,
      edits: {
        name: name !== move.name ? name : undefined,
        spanishName: spanishName !== (move.spanishName ?? "") ? spanishName : undefined,
        level: level !== move.level ? (level as Move["level"]) : undefined,
        eightCounts: eightCounts !== move.eightCounts ? eightCounts : undefined,
        summary: summary !== move.summary ? summary : undefined,
        leaderSteps,
        followerSteps,
        commonMistakes,
        variations,
        prerequisites,
      },
    };

    try {
      localStorage.setItem(storageKey, JSON.stringify(reviewData));
      setHasLocalEdits(true);
      setSavedLocally(true);
      setTimeout(() => setSavedLocally(false), 3000);
    } catch {
      alert("Could not save to browser localStorage. Please ensure storage permissions are enabled.");
    }
  };

  const handleDiscardChanges = () => {
    if (!confirm("Discard all unpersisted changes for this move?")) return;
    try {
      localStorage.removeItem(storageKey);
      setHasLocalEdits(false);
      // Reset state to base move
      setName(move.name);
      setSpanishName(move.spanishName ?? "");
      setLevel(move.level);
      setEightCounts(move.eightCounts);
      setSummary(move.summary);
      setLeaderSteps(move.leaderSteps);
      setFollowerSteps(move.followerSteps);
      setCommonMistakes(move.commonMistakes);
      setVariations(move.variations);
      setPrerequisites(move.prerequisites);
      setVideos(move.videos);
      setDecision(reviewState.review?.decision || "approved");
      setCountsVerified(reviewState.review?.countsVerified ?? false);
      setNotes(reviewState.review?.notes ?? "");
    } catch {
      // ignore
    }
  };

  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(
    `${spanishName || name} casino salsa tutorial`
  )}`;

  return (
    <div className="space-y-8">
      {/* Top Header & Breadcrumb */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl border bg-card text-card-foreground">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/instructor/moves"
              className="text-xs text-muted-foreground hover:text-foreground font-semibold inline-flex items-center gap-1"
            >
              ← Back to Move Library
            </Link>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mt-1 text-foreground flex items-center gap-2">
            {name}
            {hasLocalEdits && (
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 text-xs font-normal">
                Local Edits Active
              </Badge>
            )}
          </h1>
          <p className="text-xs text-muted-foreground">
            Category: <span className="font-semibold">{move.category}</span> | Level:{" "}
            <span className="font-semibold">{move.level}</span> | Fingerprint:{" "}
            <code className="text-amber-300">{baseFingerprint}</code>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {hasLocalEdits && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleDiscardChanges}
              className="min-h-[40px] text-xs text-red-400 border-red-500/30 hover:bg-red-500/10 gap-1.5"
            >
              <RotateCcw className="h-4 w-4" />
              Discard Edits
            </Button>
          )}

          <Button
            size="sm"
            onClick={handleSaveReview}
            disabled={decision === "approved" && !countsVerified}
            className="min-h-[40px] text-xs font-semibold gap-1.5 bg-amber-600 hover:bg-amber-500 text-white"
          >
            {savedLocally ? (
              <>
                <Check className="h-4 w-4" />
                Saved to Report Queue!
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Review
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Grid: Left Column (Dancer Preview + Songs) & Right Column (Review Form) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Dancer View Preview & Musical Links (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <Card className="p-5 rounded-2xl border bg-card/80 space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground">
                Dancer-Facing Preview
              </h2>
              <Badge variant="outline" className="text-xs">
                {eightCounts} × 8-counts
              </Badge>
            </div>

            <div>
              <p className="text-sm text-foreground leading-relaxed">{summary}</p>
            </div>

            {/* Leader Steps */}
            <div className="space-y-2 pt-2 border-t">
              <h3 className="text-xs font-bold text-amber-400">Leader Steps</h3>
              <div className="space-y-1.5">
                {leaderSteps.map((s, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-muted/40 text-xs space-y-1">
                    <span className="font-mono font-bold text-amber-300">Counts {s.counts}:</span>
                    <p className="text-foreground">{s.text || "—"}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Follower Steps */}
            <div className="space-y-2 pt-2 border-t">
              <h3 className="text-xs font-bold text-emerald-400">Follower Steps</h3>
              <div className="space-y-1.5">
                {followerSteps.map((s, idx) => (
                  <div key={idx} className="p-2.5 rounded-lg bg-muted/40 text-xs space-y-1">
                    <span className="font-mono font-bold text-emerald-300">Counts {s.counts}:</span>
                    <p className="text-foreground">{s.text || "—"}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Common Mistakes */}
            {commonMistakes.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t">
                <h3 className="text-xs font-bold text-red-400">Common Mistakes</h3>
                <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1">
                  {commonMistakes.map((m, i) => (
                    <li key={i}>{m}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Prerequisites */}
            {prerequisites.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t">
                <h3 className="text-xs font-bold text-muted-foreground">Prerequisites</h3>
                <div className="flex flex-wrap gap-1.5">
                  {prerequisites.map((p, i) => (
                    <Link key={i} href={`/instructor/moves/${p}`}>
                      <Badge variant="outline" className="text-xs hover:border-amber-400">
                        {p} ↗
                      </Badge>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Used in These Songs (Section Links with Deep Links) */}
          <Card className="p-5 rounded-2xl border bg-card/80 space-y-3">
            <div className="flex items-center justify-between border-b pb-2">
              <h2 className="text-sm font-bold flex items-center gap-1.5">
                <Music className="h-4 w-4 text-amber-400" />
                Practise It in These Songs ({sections.length})
              </h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Click a section to open the practice player at that exact cue in a new tab so you can count the figure on the music:
            </p>

            {sections.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">
                This move is not currently linked to any benchmark song sections.
              </p>
            ) : (
              <div className="space-y-2">
                {sections.map((sec, idx) => (
                  <a
                    key={idx}
                    href={`/music/${sec.songId}?section=${sec.sectionId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2.5 rounded-xl border bg-muted/30 hover:bg-muted/60 transition-colors group text-xs min-h-[40px]"
                  >
                    <div>
                      <span className="font-semibold text-foreground group-hover:text-amber-400">
                        {sec.sectionName}
                      </span>
                      <p className="text-[10px] text-muted-foreground">
                        Track: <span className="font-mono">{sec.songId}</span> · Starts at {sec.startTimeSeconds}s
                      </p>
                    </div>
                    <ExternalLink className="h-3.5 w-3.5 text-muted-foreground group-hover:text-amber-400 shrink-0" />
                  </a>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Teacher Review & Edit Console (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <Card className="p-5 rounded-2xl border bg-card text-card-foreground space-y-6">
            <div className="border-b pb-3">
              <h2 className="text-base font-bold text-foreground">Teacher Review & Verification</h2>
              <p className="text-xs text-muted-foreground">
                Edit text, test rhythm on the music, verify counts, and attach official YouTube tutorial videos.
              </p>
            </div>

            {/* Basic Info Edits */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Move Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="min-h-[40px] text-xs bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Spanish Name / Rueda Term
                </label>
                <Input
                  value={spanishName}
                  onChange={(e) => setSpanishName(e.target.value)}
                  className="min-h-[40px] text-xs bg-background"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Curriculum Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full min-h-[40px] rounded-xl border bg-background px-3 py-2 text-xs text-foreground focus:outline-hidden"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Improver">Improver</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Number of 8-Counts (Music Timing)
                </label>
                <Input
                  type="number"
                  min={1}
                  value={eightCounts}
                  onChange={(e) => setEightCounts(Math.max(1, parseInt(e.target.value, 10) || 1))}
                  className="min-h-[40px] text-xs bg-background"
                />
              </div>
            </div>

            {/* Summary */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground">Summary & Trajectory</label>
              <Textarea
                rows={3}
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="text-xs bg-background"
              />
            </div>

            {/* Leader Steps Editor */}
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-amber-400">Edit Leader Steps</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addStep("leader")}
                  className="min-h-[32px] text-xs gap-1"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Step
                </Button>
              </div>

              <div className="space-y-2">
                {leaderSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2.5 rounded-xl border bg-muted/20">
                    <Input
                      value={step.counts}
                      onChange={(e) => updateStep("leader", idx, "counts", e.target.value)}
                      placeholder="1-3"
                      className="w-20 min-h-[36px] text-xs font-mono shrink-0 bg-background"
                    />
                    <Input
                      value={step.text}
                      onChange={(e) => updateStep("leader", idx, "text", e.target.value)}
                      placeholder="Describe leader footwork and frame..."
                      className="flex-1 min-h-[36px] text-xs bg-background"
                    />
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={idx === 0}
                        onClick={() => moveStep("leader", idx, "up")}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={idx === leaderSteps.length - 1}
                        onClick={() => moveStep("leader", idx, "down")}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={leaderSteps.length <= 1}
                        onClick={() => removeStep("leader", idx)}
                        className="h-8 w-8 p-0 text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Follower Steps Editor */}
            <div className="space-y-3 pt-2 border-t">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-emerald-400">Edit Follower Steps</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addStep("follower")}
                  className="min-h-[32px] text-xs gap-1"
                >
                  <Plus className="h-3.5 w-3.5" /> Add Step
                </Button>
              </div>

              <div className="space-y-2">
                {followerSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-2 p-2.5 rounded-xl border bg-muted/20">
                    <Input
                      value={step.counts}
                      onChange={(e) => updateStep("follower", idx, "counts", e.target.value)}
                      placeholder="1-3"
                      className="w-20 min-h-[36px] text-xs font-mono shrink-0 bg-background"
                    />
                    <Input
                      value={step.text}
                      onChange={(e) => updateStep("follower", idx, "text", e.target.value)}
                      placeholder="Describe follower turn and footwork..."
                      className="flex-1 min-h-[36px] text-xs bg-background"
                    />
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={idx === 0}
                        onClick={() => moveStep("follower", idx, "up")}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronUp className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={idx === followerSteps.length - 1}
                        onClick={() => moveStep("follower", idx, "down")}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronDown className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={followerSteps.length <= 1}
                        onClick={() => removeStep("follower", idx)}
                        className="h-8 w-8 p-0 text-red-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* YouTube Video Attach Section */}
            <div className="space-y-3 pt-3 border-t">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Video className="h-4 w-4 text-amber-400" />
                  Attach YouTube Demonstration Videos ({videos.length})
                </h3>
                <a
                  href={searchUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-amber-400 hover:underline inline-flex items-center gap-1"
                >
                  <Search className="h-3.5 w-3.5" /> Search YouTube ↗
                </a>
              </div>

              {/* YouTube Rules Accordion Note */}
              <div className="rounded-xl border bg-muted/20 p-2.5 text-xs space-y-1">
                <button
                  type="button"
                  onClick={() => setShowYoutubeRules(!showYoutubeRules)}
                  className="flex items-center justify-between w-full font-semibold text-muted-foreground hover:text-foreground text-left"
                >
                  <span>YouTube Platform Compliance Rules</span>
                  <ChevronRight
                    className={`h-3.5 w-3.5 transition-transform ${
                      showYoutubeRules ? "rotate-90" : ""
                    }`}
                  />
                </button>
                {showYoutubeRules && (
                  <div className="pt-2 text-[11px] text-muted-foreground space-y-1 border-t mt-2">
                    <p>• Official embedded IFrame player only at ≥ 200×200 px.</p>
                    <p>• Start and end cues permitted; no downloading or local re-hosting.</p>
                    <p>• Zero overlays covering video controls. Creator credited automatically.</p>
                  </div>
                )}
              </div>

              {/* Video Input Form */}
              <div className="p-3 rounded-xl border bg-background space-y-2.5">
                <Input
                  value={youtubeInput}
                  onChange={(e) => setYoutubeInput(e.target.value)}
                  placeholder="Paste YouTube URL (watch, youtu.be, shorts, embed, or 11-char ID)..."
                  className="min-h-[40px] text-xs bg-muted/30"
                />

                <div className="flex flex-wrap items-center gap-2">
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-muted-foreground">Start:</span>
                    <Input
                      value={startTimeInput}
                      onChange={(e) => setStartTimeInput(e.target.value)}
                      placeholder="m:ss or sec"
                      className="w-24 min-h-[36px] text-xs bg-muted/30"
                    />
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[11px] text-muted-foreground">End:</span>
                    <Input
                      value={endTimeInput}
                      onChange={(e) => setEndTimeInput(e.target.value)}
                      placeholder="m:ss or sec"
                      className="w-24 min-h-[36px] text-xs bg-muted/30"
                    />
                  </div>
                  <Button
                    size="sm"
                    disabled={isCheckingVideo || !youtubeInput.trim()}
                    onClick={handleAttachVideo}
                    className="min-h-[36px] text-xs font-semibold ml-auto bg-amber-600 hover:bg-amber-500 text-white"
                  >
                    {isCheckingVideo ? "Checking oEmbed..." : "Verify & Attach Video"}
                  </Button>
                </div>

                {videoError && (
                  <p className="text-xs text-red-400 flex items-center gap-1">
                    <ShieldAlert className="h-3.5 w-3.5" /> {videoError}
                  </p>
                )}
                {videoSuccess && (
                  <p className="text-xs text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" /> {videoSuccess}
                  </p>
                )}
              </div>

              {/* List of Attached Videos with Embed Preview */}
              {videos.length > 0 && (
                <div className="space-y-3 pt-2">
                  {videos.map((vid, idx) => {
                    const embedUrl = `https://www.youtube-nocookie.com/embed/${vid.youtubeVideoId}${
                      vid.startSeconds !== undefined ? `?start=${vid.startSeconds}` : ""
                    }${vid.endSeconds !== undefined ? `&end=${vid.endSeconds}` : ""}`;

                    return (
                      <div key={idx} className="p-3 rounded-xl border bg-muted/20 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-foreground">{vid.title}</span>
                            <p className="text-[11px] text-muted-foreground">
                              Channel: {vid.channelTitle} · Cues:{" "}
                              {vid.startSeconds !== undefined ? `${vid.startSeconds}s` : "0s"} →{" "}
                              {vid.endSeconds !== undefined ? `${vid.endSeconds}s` : "end"}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeVideo(idx)}
                            className="text-red-400 h-8 w-8 p-0"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Player Preview (16:9, min 200x200, strictly compliant) */}
                        <div className="relative w-full aspect-video min-w-[200px] min-h-[200px] rounded-lg overflow-hidden border bg-black">
                          <iframe
                            src={embedUrl}
                            title={vid.title}
                            allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="absolute inset-0 w-full h-full border-0"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Decision & Verification Checkbox */}
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Teacher Name</label>
                <Input
                  value={reviewedBy}
                  onChange={(e) => setReviewedBy(e.target.value)}
                  className="min-h-[40px] text-xs bg-background"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-muted-foreground">Review Decision</label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    type="button"
                    variant={decision === "approved" ? "default" : "outline"}
                    onClick={() => setDecision("approved")}
                    className={`min-h-[40px] text-xs font-semibold ${
                      decision === "approved"
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                        : ""
                    }`}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve
                  </Button>
                  <Button
                    type="button"
                    variant={decision === "needs-work" ? "default" : "outline"}
                    onClick={() => setDecision("needs-work")}
                    className={`min-h-[40px] text-xs font-semibold ${
                      decision === "needs-work"
                        ? "bg-yellow-600 hover:bg-yellow-500 text-white"
                        : ""
                    }`}
                  >
                    <AlertTriangle className="h-4 w-4 mr-1.5" /> Needs Work
                  </Button>
                  <Button
                    type="button"
                    variant={decision === "rejected" ? "default" : "outline"}
                    onClick={() => setDecision("rejected")}
                    className={`min-h-[40px] text-xs font-semibold ${
                      decision === "rejected" ? "bg-red-600 hover:bg-red-500 text-white" : ""
                    }`}
                  >
                    <XCircle className="h-4 w-4 mr-1.5" /> Reject
                  </Button>
                </div>
              </div>

              {/* Mandatory Count Verification Checkbox */}
              <div className="p-3 rounded-xl border bg-amber-500/10 border-amber-500/30">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={countsVerified}
                    onChange={(e) => setCountsVerified(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-amber-500 text-amber-500 focus:ring-amber-500/30"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-foreground">
                      I counted this on the music: the counts are right
                    </span>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Required before approval. Never publish dance counts nobody checked against the timing of the song.
                    </p>
                  </div>
                </label>
              </div>

              {/* Teacher Notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">
                  Teacher Notes / Feedback
                </label>
                <Textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notes on arm positions, follower resistance, safety advice..."
                  className="text-xs bg-background"
                />
              </div>

              {/* Final Save Action */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
                <Button
                  size="default"
                  onClick={handleSaveReview}
                  disabled={decision === "approved" && !countsVerified}
                  className="w-full sm:w-auto min-h-[44px] px-6 text-sm font-semibold bg-amber-600 hover:bg-amber-500 text-white"
                >
                  {savedLocally ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Review Saved Locally!
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save Review Decision
                    </>
                  )}
                </Button>

                {decision === "approved" && !countsVerified && (
                  <span className="text-[11px] text-amber-400">
                    * Tick the music verification checkbox to enable Approve.
                  </span>
                )}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
