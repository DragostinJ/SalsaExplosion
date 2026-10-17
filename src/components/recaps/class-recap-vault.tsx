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
  UploadCloud,
  Film,
  Trash2,
  Loader2,
  Link2,
  Check,
} from "lucide-react";
import { DanceLevel, Role } from "@prisma/client";
import {
  AttendedRecapItem,
  attachClassRecapAction,
  generateRecapUploadUrlAction,
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

const POPULAR_CUBAN_FIGURES = [
  "Guapea",
  "Dile Que No",
  "Enchufla",
  "Enchufla Doble",
  "Vacilala",
  "Setenta",
  "Sombrero",
  "Exhibela",
  "Prima con la Hermana",
  "Kentucky",
  "Evelyn",
  "Paseala",
] as const;

function uploadFileToSignedUrl(
  signedUrl: string,
  file: File,
  onProgress: (pct: number) => void
): Promise<void> {
  if (signedUrl === "DEMO_DIRECT_BYPASS") {
    return new Promise((resolve) => {
      let pct = 15;
      onProgress(pct);
      const timer = setInterval(() => {
        pct += 25;
        if (pct >= 100) {
          clearInterval(timer);
          onProgress(100);
          resolve();
        } else {
          onProgress(pct);
        }
      }, 100);
    });
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signedUrl, true);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable) {
        const pct = Math.round((evt.loaded / evt.total) * 100);
        onProgress(pct);
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during video upload."));
    xhr.send(file);
  });
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
  const [videoSourceMode, setVideoSourceMode] = useState<"FILE" | "URL">("FILE");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isDragging, setIsDragging] = useState(false);
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

  const handleToggleFigureTag = (figure: string) => {
    const current = attachFiguresCsv
      .split(",")
      .map((f) => f.trim())
      .filter(Boolean);
    if (current.includes(figure)) {
      setAttachFiguresCsv(current.filter((f) => f !== figure).join(", "));
    } else {
      setAttachFiguresCsv([...current, figure].join(", "));
    }
  };

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
      try {
        let finalVideoUrl = attachVideoUrl.trim();

        if (videoSourceMode === "FILE") {
          if (!selectedFile) {
            setAttachFeedback({
              type: "error",
              text: "Please select or record a video file from your device.",
            });
            return;
          }

          const fileType = selectedFile.type as "video/mp4" | "video/quicktime" | "video/webm";
          if (!["video/mp4", "video/quicktime", "video/webm"].includes(fileType)) {
            setAttachFeedback({
              type: "error",
              text: "Only MP4, MOV, and WebM video formats are supported.",
            });
            return;
          }

          setUploadProgress(10);
          const uploadInit = await generateRecapUploadUrlAction({
            classSessionId: attachSessionId,
            contentType: fileType,
            fileSizeBytes: selectedFile.size,
          });

          if (!uploadInit.success) {
            setAttachFeedback({
              type: "error",
              text: uploadInit.error.message,
            });
            setUploadProgress(0);
            return;
          }

          await uploadFileToSignedUrl(
            uploadInit.data.signedUrl,
            selectedFile,
            (pct) => setUploadProgress(pct)
          );

          finalVideoUrl = uploadInit.data.publicUrl;
        }

        if (!finalVideoUrl) {
          setAttachFeedback({
            type: "error",
            text: "Video source is required.",
          });
          return;
        }

        const res = await attachClassRecapAction({
          classSessionId: attachSessionId,
          recapVideoUrl: finalVideoUrl,
          recapNotes: attachNotes,
          recapFigures: figures.length > 0 ? figures : ["Casino Partnerwork Basics"],
          recapPublished: true,
        });

        if (res.success) {
          setAttachFeedback({ type: "success", text: res.message });
          setAttachVideoUrl("");
          setSelectedFile(null);
          setUploadProgress(0);
          setTimeout(() => setShowAttachModal(false), 2000);
        } else {
          setAttachFeedback({ type: "error", text: res.error.message });
          setUploadProgress(0);
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Failed to upload recap video.";
        setAttachFeedback({ type: "error", text: msg });
        setUploadProgress(0);
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

              {/* Video Source Switcher */}
              <div className="space-y-2">
                <div className="flex rounded-xl bg-muted/60 p-1 text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setVideoSourceMode("FILE")}
                    className={`flex-1 rounded-lg py-1.5 transition-all flex items-center justify-center gap-1.5 ${
                      videoSourceMode === "FILE"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Film className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Upload Video File (Phone / PC)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoSourceMode("URL")}
                    className={`flex-1 rounded-lg py-1.5 transition-all flex items-center justify-center gap-1.5 ${
                      videoSourceMode === "URL"
                        ? "bg-background text-foreground shadow-xs"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Link2 className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400" />
                    <span>Paste Video Link (YouTube / URL)</span>
                  </button>
                </div>

                {videoSourceMode === "FILE" ? (
                  <div className="space-y-2">
                    {!selectedFile ? (
                      <label
                        onDragOver={(e) => {
                          e.preventDefault();
                          setIsDragging(true);
                        }}
                        onDragLeave={() => setIsDragging(false)}
                        onDrop={(e) => {
                          e.preventDefault();
                          setIsDragging(false);
                          const f = e.dataTransfer.files?.[0];
                          if (f) setSelectedFile(f);
                        }}
                        className={`flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-6 cursor-pointer transition-all ${
                          isDragging
                            ? "border-amber-500 bg-amber-500/10"
                            : "border-muted-foreground/30 hover:border-amber-500/60 hover:bg-muted/30"
                        }`}
                      >
                        <UploadCloud className="h-7 w-7 text-amber-600 dark:text-amber-400 mb-1.5" />
                        <span className="font-bold text-xs text-foreground text-center">
                          Tap to choose or record recap video
                        </span>
                        <span className="text-[10px] text-muted-foreground mt-0.5">
                          Direct from camera roll or files (MP4, MOV up to 100MB)
                        </span>
                        <input
                          type="file"
                          accept="video/mp4,video/quicktime,video/webm"
                          capture="environment"
                          className="sr-only"
                          onChange={(e) => {
                            const f = e.target.files?.[0];
                            if (f) setSelectedFile(f);
                          }}
                        />
                      </label>
                    ) : (
                      <div className="flex items-center justify-between rounded-xl border bg-muted/40 p-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <Film className="h-4 w-4 text-amber-600 dark:text-amber-400 shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate">{selectedFile.name}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB • Ready to upload
                            </p>
                          </div>
                        </div>
                        {!isPending && (
                          <button
                            type="button"
                            onClick={() => setSelectedFile(null)}
                            className="rounded p-1 text-muted-foreground hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    )}

                    {isPending && uploadProgress > 0 && (
                      <div className="space-y-1 rounded-xl border bg-muted/20 p-2.5">
                        <div className="flex justify-between text-[11px] font-semibold text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Loader2 className="h-3 w-3 animate-spin text-amber-600" />
                            Uploading to studio storage...
                          </span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                          <div
                            className="h-full bg-amber-500 transition-all duration-200"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-1">
                    <input
                      type="url"
                      placeholder="https://... (YouTube, Vimeo, or direct MP4 link)"
                      value={attachVideoUrl}
                      onChange={(e) => setAttachVideoUrl(e.target.value)}
                      className="w-full rounded-xl border bg-background px-3 py-2 font-medium"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Paste a public YouTube watch link, Vimeo link, or HTTPS video URL.
                    </p>
                  </div>
                )}
              </div>

              {/* Figures Practiced & Quick Chips */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-semibold">Cuban Figures Practiced</label>
                  <span className="text-[10px] text-muted-foreground">Tap chips to toggle</span>
                </div>

                <div className="flex flex-wrap gap-1 mb-1.5">
                  {POPULAR_CUBAN_FIGURES.map((figure) => {
                    const active = attachFiguresCsv
                      .split(",")
                      .map((f) => f.trim().toLowerCase())
                      .includes(figure.toLowerCase());
                    return (
                      <button
                        key={figure}
                        type="button"
                        onClick={() => handleToggleFigureTag(figure)}
                        className={`rounded-lg px-2 py-0.5 text-[10px] font-semibold transition-all ${
                          active
                            ? "bg-amber-500 text-zinc-950 shadow-xs"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                      >
                        {active && <Check className="inline h-2.5 w-2.5 mr-1" />}
                        {figure}
                      </button>
                    );
                  })}
                </div>

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
