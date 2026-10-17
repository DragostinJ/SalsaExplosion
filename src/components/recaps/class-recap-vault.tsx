"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import {
  Video,
  Play,
  Sparkles,
  Calendar,
  Search,
  PlusCircle,
  X,
  Gauge,
  Filter,
} from "lucide-react";
import { DanceLevel, Role } from "@prisma/client";
import {
  AttendedRecapItem,
  attachClassRecapAction,
} from "@/actions/recap.actions";
import { TeacherAvatar } from "@/components/ui/teacher-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ClassRecapVaultProps {
  initialRecaps: AttendedRecapItem[];
  allStudioRecaps?: AttendedRecapItem[];
  userRole?: Role | null;
  activeClassesForStaff?: Array<{ id: string; title: string; minLevel: DanceLevel }>;
}

function getSafeVideoEmbed(rawUrl: string): { type: "youtube" | "html5" | "invalid"; safeUrl: string } {
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== "https:" && url.protocol !== "http:") {
      return { type: "invalid", safeUrl: "" };
    }

    const host = url.hostname.toLowerCase();
    // Validate YouTube
    if (host === "www.youtube.com" || host === "youtube.com" || host === "m.youtube.com") {
      const v = url.searchParams.get("v");
      if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) {
        return { type: "youtube", safeUrl: `https://www.youtube-nocookie.com/embed/${v}` };
      }
      const match = url.pathname.match(/^\/embed\/([a-zA-Z0-9_-]{11})/);
      if (match) {
        return { type: "youtube", safeUrl: `https://www.youtube-nocookie.com/embed/${match[1]}` };
      }
    } else if (host === "youtu.be") {
      const id = url.pathname.slice(1).split("/")[0]?.split("?")[0];
      if (id && /^[a-zA-Z0-9_-]{11}$/.test(id)) {
        return { type: "youtube", safeUrl: `https://www.youtube-nocookie.com/embed/${id}` };
      }
    }

    // Direct video stream (mp4, webm, etc.) - must be HTTPS
    if (url.protocol === "https:") {
      return { type: "html5", safeUrl: url.toString() };
    }

    return { type: "invalid", safeUrl: "" };
  } catch {
    return { type: "invalid", safeUrl: "" };
  }
}

export function ClassRecapVault({
  initialRecaps,
  allStudioRecaps = [],
  userRole,
  activeClassesForStaff = [],
}: ClassRecapVaultProps) {
  const isStaff = userRole === "INSTRUCTOR" || userRole === "ADMIN";
  const [activeTab, setActiveTab] = useState<"MY_RECAPS" | "STUDIO_ARCHIVE">(
    initialRecaps.length > 0 ? "MY_RECAPS" : "STUDIO_ARCHIVE"
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [selectedRecap, setSelectedRecap] = useState<AttendedRecapItem | null>(
    initialRecaps[0] ?? allStudioRecaps[0] ?? null
  );
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);

  // Attach Recap Modal state for Instructors / Admins
  const [showAttachModal, setShowAttachModal] = useState(false);
  const [attachSessionId, setAttachSessionId] = useState(
    activeClassesForStaff[0]?.id ?? ""
  );
  const [attachVideoUrl, setAttachVideoUrl] = useState("");
  const [attachFiguresCsv, setAttachFiguresCsv] = useState(
    "Guapea, Dile Que No, Enchufla con Mambo, Vacilala"
  );
  const [attachNotes, setAttachNotes] = useState(
    "Remember to keep your left frame relaxed and prep the circular turn on count 1. Fantastic energy tonight!"
  );
  const [attachFeedback, setAttachFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const currentRecapList = activeTab === "MY_RECAPS" ? initialRecaps : allStudioRecaps;

  const filteredRecaps = useMemo(() => {
    return currentRecapList.filter((r) => {
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        r.title.toLowerCase().includes(q) ||
        r.instructorName.toLowerCase().includes(q) ||
        r.recapFigures.some((fig) => fig.toLowerCase().includes(q)) ||
        r.recapNotes.toLowerCase().includes(q);

      const matchesLevel = levelFilter === "ALL" || r.minLevel === levelFilter;

      return matchesSearch && matchesLevel;
    });
  }, [currentRecapList, searchQuery, levelFilter]);

  const handleAttachSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAttachFeedback(null);

    const figures = attachFiguresCsv
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);

    startTransition(async () => {
      const res = await attachClassRecapAction({
        classSessionId: attachSessionId,
        recapVideoUrl: attachVideoUrl,
        recapNotes: attachNotes,
        recapFigures: figures.length > 0 ? figures : ["Casino Partnerwork Basics"],
        recapPublished: true,
      });

      if (res.success) {
        setAttachFeedback({ type: "success", text: res.message });
        setAttachVideoUrl("");
        setTimeout(() => setShowAttachModal(false), 2000);
      } else {
        setAttachFeedback({ type: "error", text: res.error.message });
      }
    });
  };

  const handleSpeedChange = (speed: number) => {
    setPlaybackSpeed(speed);
    const videoEl = document.getElementById("recap-video-player") as HTMLVideoElement | null;
    if (videoEl) {
      videoEl.playbackRate = speed;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Tabs & Staff Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Toggle between My Attended Classes & Full Studio Archive */}
        <div className="inline-flex rounded-xl border bg-muted/40 p-1 text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab("MY_RECAPS");
              if (initialRecaps[0]) setSelectedRecap(initialRecaps[0]);
            }}
            className={`rounded-lg px-3.5 py-1.5 font-bold transition-all ${
              activeTab === "MY_RECAPS"
                ? "bg-amber-500 text-zinc-950 shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My Attended Recaps ({initialRecaps.length})
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab("STUDIO_ARCHIVE");
              if (allStudioRecaps[0]) setSelectedRecap(allStudioRecaps[0]);
            }}
            className={`rounded-lg px-3.5 py-1.5 font-bold transition-all ${
              activeTab === "STUDIO_ARCHIVE"
                ? "bg-amber-500 text-zinc-950 shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Studio Video Vault ({allStudioRecaps.length})
          </button>
        </div>

        {isStaff && (
          <Button
            type="button"
            size="sm"
            onClick={() => setShowAttachModal(true)}
            className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs"
          >
            <PlusCircle className="mr-1.5 h-3.5 w-3.5" />
            Attach Recap Video
          </Button>
        )}
      </div>

      {/* Main Grid: Player on Top / Left, List on Right */}
      <div className="grid gap-6 lg:grid-cols-12 items-start">
        {/* Left Column (7 Cols): Active Recap Video & Details */}
        <div className="lg:col-span-7 space-y-4">
          {selectedRecap ? (
            <Card className="border shadow-md overflow-hidden">
              {/* Responsive Video Container */}
              <div className="relative aspect-video w-full bg-black">
                {(() => {
                  const embed = getSafeVideoEmbed(selectedRecap.recapVideoUrl);
                  if (embed.type === "youtube") {
                    return (
                      <iframe
                        src={embed.safeUrl}
                        title={selectedRecap.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="h-full w-full border-0"
                      />
                    );
                  }
                  if (embed.type === "html5") {
                    return (
                      <video
                        id="recap-video-player"
                        key={embed.safeUrl}
                        controls
                        playsInline
                        className="h-full w-full object-contain"
                        src={embed.safeUrl}
                      />
                    );
                  }
                  return (
                    <div className="flex h-full w-full items-center justify-center p-6 text-center text-sm text-muted-foreground">
                      <span>Video format not supported or invalid URL.</span>
                    </div>
                  );
                })()}
              </div>

              {/* Video Playback Speed Toolbar */}
              <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-2 text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                  <Gauge className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                  <span>Playback Speed:</span>
                </span>
                <div className="flex items-center gap-1">
                  {[0.75, 1.0, 1.25].map((speed) => (
                    <button
                      key={speed}
                      type="button"
                      onClick={() => handleSpeedChange(speed)}
                      className={`rounded px-2 py-0.5 text-[11px] font-bold transition-all ${
                        playbackSpeed === speed
                          ? "bg-amber-500 text-zinc-950 shadow-xs"
                          : "text-muted-foreground hover:bg-muted"
                      }`}
                    >
                      {speed === 0.75 ? "0.75x (Slow-Mo)" : `${speed}x`}
                    </button>
                  ))}
                </div>
              </div>

              <CardHeader className="space-y-3 pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Badge className="bg-amber-500 text-zinc-950 font-bold text-xs">
                    {selectedRecap.minLevel}
                  </Badge>
                  {selectedRecap.danceRole && (
                    <Badge
                      className={
                        selectedRecap.danceRole === "LEAD"
                          ? "bg-blue-700 text-white text-xs"
                          : "bg-rose-700 text-white text-xs"
                      }
                    >
                      You Danced as {selectedRecap.danceRole}
                    </Badge>
                  )}
                </div>

                <div className="flex items-start gap-3">
                  <TeacherAvatar
                    name={selectedRecap.instructorName}
                    avatarUrl={selectedRecap.instructorAvatarUrl}
                    size="md"
                    className="mt-1"
                  />
                  <div>
                    <CardTitle className="text-lg sm:text-xl font-extrabold leading-snug">
                      {selectedRecap.title}
                    </CardTitle>
                    <CardDescription className="text-xs text-muted-foreground mt-0.5">
                      Taught by Maestro {selectedRecap.instructorName} • {selectedRecap.room}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-4 pt-0">
                {/* Figures Practiced Badges */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Cuban Figures & Calls Practiced:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedRecap.recapFigures.map((fig) => (
                      <Badge
                        key={fig}
                        variant="secondary"
                        className="px-2.5 py-1 text-xs font-semibold border"
                      >
                        <Sparkles className="mr-1 h-3 w-3 text-amber-600 dark:text-amber-400" />
                        {fig}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Maestro Notes */}
                {selectedRecap.recapNotes && (
                  <div className="rounded-xl border bg-muted/20 p-3.5 space-y-1 text-xs">
                    <span className="font-bold text-amber-800 dark:text-amber-300">
                      Maestro Coaching Notes:
                    </span>
                    <p className="text-muted-foreground leading-relaxed">
                      {selectedRecap.recapNotes}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="py-12 text-center border">
              <CardContent>
                <Video className="mx-auto h-12 w-12 text-muted-foreground/30" />
                <h3 className="mt-3 text-base font-bold">No Recap Selected</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Select a class from the list to watch the end-of-class recap video.
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column (5 Cols): Search & List of Attended Classes */}
        <div className="lg:col-span-5 space-y-3">
          {/* Search & Filter Bar */}
          <div className="space-y-2 rounded-2xl border bg-card p-3 shadow-xs">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                aria-label="Search recaps by figure, title, or instructor"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search figure (e.g. Enchufla, Vacilala)..."
                className="w-full rounded-xl border bg-background pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <select
                aria-label="Filter recaps by level"
                value={levelFilter}
                onChange={(e) => setLevelFilter(e.target.value)}
                className="w-full rounded-lg border bg-background px-2.5 py-1 text-xs font-semibold"
              >
                <option value="ALL">All Syllabus Levels</option>
                <option value="BEGINNER">Beginner</option>
                <option value="IMPROVER">Improver</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
              </select>
            </div>
          </div>

          {/* List of Recaps */}
          <div className="space-y-2 max-h-[70vh] overflow-y-auto pr-1">
            {filteredRecaps.length === 0 ? (
              <Card className="py-8 text-center border">
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    {activeTab === "MY_RECAPS"
                      ? "You haven't attended any classes with recaps yet. Book a session on the Schedule to unlock your class recap videos!"
                      : "No studio recaps match your search query."}
                  </p>
                  {activeTab === "MY_RECAPS" && (
                    <Button
                      size="sm"
                      variant="outline"
                      asChild
                      className="mt-3 text-xs font-bold"
                    >
                      <Link href="/dashboard/schedule">View Schedule</Link>
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredRecaps.map((recap) => {
                const isSelected = selectedRecap?.id === recap.id;
                const dateFormatted = new Intl.DateTimeFormat("en-GB", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                }).format(new Date(recap.startTime));

                return (
                  <button
                    key={recap.id}
                    type="button"
                    onClick={() => setSelectedRecap(recap)}
                    className={`w-full text-left rounded-2xl border p-3.5 transition-all ${
                      isSelected
                        ? "border-amber-500 bg-amber-500/[0.08] shadow-sm ring-1 ring-amber-500/40"
                        : "bg-card hover:border-border/80 hover:bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <Badge variant="secondary" className="text-[10px] font-bold">
                        {recap.minLevel}
                      </Badge>
                      <span className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {dateFormatted}
                      </span>
                    </div>

                    <h4 className="text-xs sm:text-sm font-bold line-clamp-1">
                      {recap.title}
                    </h4>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span className="flex items-center gap-1.5">
                        <TeacherAvatar
                          name={recap.instructorName}
                          avatarUrl={recap.instructorAvatarUrl}
                          size="xs"
                          showBadge={false}
                        />
                        <span>{recap.instructorName}</span>
                      </span>
                      <span className="font-semibold text-amber-700 dark:text-amber-400 flex items-center gap-1">
                        <Play className="h-2.5 w-2.5 fill-current" />
                        Watch Video
                      </span>
                    </div>

                    {/* Figure preview tags */}
                    <div className="mt-2 flex flex-wrap gap-1">
                      {recap.recapFigures.slice(0, 3).map((fig) => (
                        <span
                          key={fig}
                          className="rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground"
                        >
                          {fig}
                        </span>
                      ))}
                      {recap.recapFigures.length > 3 && (
                        <span className="text-[9px] text-muted-foreground">
                          +{recap.recapFigures.length - 3} more
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Staff Modal: Attach End-of-Class Recap Video */}
      {showAttachModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs"
        >
          <div className="relative w-full max-w-lg rounded-3xl border border-amber-500/30 bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Video className="h-5 w-5 text-amber-600" />
                <h3 className="text-base font-extrabold">Attach End-of-Class Recap Video</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAttachModal(false)}
                className="rounded-full p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {attachFeedback && (
              <div
                className={`rounded-xl border p-3 text-xs font-semibold ${
                  attachFeedback.type === "success"
                    ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300"
                    : "border-destructive/40 bg-destructive/10 text-destructive"
                }`}
              >
                {attachFeedback.text}
              </div>
            )}

            <form onSubmit={handleAttachSubmit} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-semibold">Class Session</label>
                <select
                  aria-label="Select class session"
                  value={attachSessionId}
                  onChange={(e) => setAttachSessionId(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2 font-semibold"
                >
                  {activeClassesForStaff.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      [{cls.minLevel}] {cls.title}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-semibold">Video URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://... (YouTube, Vimeo, MP4 file)"
                  value={attachVideoUrl}
                  onChange={(e) => setAttachVideoUrl(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2"
                />
                <p className="text-[10px] text-muted-foreground">
                  Paste a direct MP4 link, Supabase Storage video, or YouTube URL.
                </p>
              </div>

              <div className="space-y-1">
                <label className="font-semibold">Cuban Figures Practiced (comma-separated)</label>
                <input
                  type="text"
                  required
                  placeholder="Guapea, Dile Que No, Enchufla Doble, Vacilala"
                  value={attachFiguresCsv}
                  onChange={(e) => setAttachFiguresCsv(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2"
                />
              </div>

              <div className="space-y-1">
                <label className="font-semibold">Maestro Coaching Notes & Tips</label>
                <textarea
                  rows={3}
                  value={attachNotes}
                  onChange={(e) => setAttachNotes(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAttachModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isPending}
                  className="bg-amber-500 text-zinc-950 font-bold hover:bg-amber-400"
                >
                  {isPending ? "Publishing Recap..." : "Publish Recap to Students"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
