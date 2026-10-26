"use client";

import { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import {
  Play,
  Calendar,
  Search,
  PlusCircle,
  X,
} from "lucide-react";
import {
  attachClassRecapAction,
  generateRecapUploadUrlAction,
} from "@/actions/recap.actions";
import { TeacherAvatar } from "@/components/ui/teacher-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

import {
  type AttendedRecapItem,
  type ClassRecapVaultProps,
  uploadFileToSignedUrl,
  POPULAR_CUBAN_FIGURES,
} from "./vault/recap-types";
import { RecapVideoPlayer } from "./vault/recap-video-player";
import { RecapStaffModal } from "./vault/recap-staff-modal";

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
        <div className="grid grid-cols-2 sm:inline-flex rounded-xl border bg-muted/40 p-1 text-xs w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              setActiveTab("MY_RECAPS");
              if (initialRecaps[0]) setSelectedRecap(initialRecaps[0]);
            }}
            className={`rounded-lg px-3.5 py-1.5 font-bold transition-all ${
              activeTab === "MY_RECAPS"
                ? "bg-amber-500 text-stone-950 shadow-xs"
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
                ? "bg-amber-500 text-stone-950 shadow-xs"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Studio Class Recaps ({allStudioRecaps.length})
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
          <RecapVideoPlayer
            selectedRecap={selectedRecap}
            playbackSpeed={playbackSpeed}
            handleSpeedChange={handleSpeedChange}
          />
        </div>

        {/* Right Column (5 Cols): Search & List of Attended Classes */}
        <div className="lg:col-span-5 space-y-3">
          {/* Enhanced Search & Figure Filter Bar */}
          <div className="space-y-3 rounded-2xl border bg-card p-3.5 shadow-xs">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                aria-label="Search recaps by figure, title, or instructor"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search figure (e.g. Guapea, Vacilala, Setenta, Sombrero)..."
                className="w-full rounded-xl border bg-background pl-8 pr-8 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              {searchQuery && (
                <button
                  type="button"
                  aria-label="Clear search"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>

            {/* Syllabus Tier Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              {[
                { label: "All Levels", value: "ALL" },
                { label: "Beginner", value: "BEGINNER" },
                { label: "Improver", value: "IMPROVER" },
                { label: "Intermediate", value: "INTERMEDIATE" },
                { label: "Advanced", value: "ADVANCED" },
              ].map((tier) => (
                <button
                  key={tier.value}
                  type="button"
                  onClick={() => setLevelFilter(tier.value)}
                  className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition-all ${
                    levelFilter === tier.value
                      ? "bg-amber-600 text-white shadow-xs"
                      : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>

            {/* Quick Cuban Figure Filter Chips */}
            <div className="space-y-1.5 pt-1.5 border-t">
              <div className="flex items-center justify-between text-[10px] text-muted-foreground font-semibold">
                <span>Popular Cuban Figures:</span>
                {(searchQuery || levelFilter !== "ALL") && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setLevelFilter("ALL");
                    }}
                    className="text-amber-400 hover:underline"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-1">
                {POPULAR_CUBAN_FIGURES.slice(0, 8).map((fig) => {
                  const isActive = searchQuery.toLowerCase().includes(fig.toLowerCase());
                  return (
                    <button
                      key={fig}
                      type="button"
                      onClick={() => setSearchQuery(isActive ? "" : fig)}
                      className={`rounded-full px-2 py-0.5 text-[10px] font-medium transition-all ${
                        isActive
                          ? "bg-amber-500 text-stone-950 font-bold shadow-xs"
                          : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                      }`}
                    >
                      {fig}
                    </button>
                  );
                })}
              </div>
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
                      <span className="font-semibold text-amber-400 flex items-center gap-1">
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
      <RecapStaffModal
        showAttachModal={showAttachModal}
        setShowAttachModal={setShowAttachModal}
        attachFeedback={attachFeedback}
        handleAttachSubmit={handleAttachSubmit}
        attachSessionId={attachSessionId}
        setAttachSessionId={setAttachSessionId}
        activeClassesForStaff={activeClassesForStaff}
        videoSourceMode={videoSourceMode}
        setVideoSourceMode={setVideoSourceMode}
        selectedFile={selectedFile}
        setSelectedFile={setSelectedFile}
        isDragging={isDragging}
        setIsDragging={setIsDragging}
        isPending={isPending}
        uploadProgress={uploadProgress}
        attachVideoUrl={attachVideoUrl}
        setAttachVideoUrl={setAttachVideoUrl}
        attachFiguresCsv={attachFiguresCsv}
        setAttachFiguresCsv={setAttachFiguresCsv}
        handleToggleFigureTag={handleToggleFigureTag}
        attachNotes={attachNotes}
        setAttachNotes={setAttachNotes}
      />
    </div>
  );
}
