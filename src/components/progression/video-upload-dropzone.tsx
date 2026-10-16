"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  UploadCloud,
  Film,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Lock,
  Sparkles,
  Check,
  Music,
} from "lucide-react";
import { DanceLevel } from "@prisma/client";
import {
  generateSignedUploadUrlAction,
  createVideoSubmissionAction,
} from "@/actions/submission.actions";
import {
  ALLOWED_VIDEO_MIME_TYPES,
  AllowedVideoMimeType,
  CUBAN_SALSA_SYLLABUS,
  getNextUnlockableLevel,
  MAX_VIDEO_SIZE_BYTES,
} from "@/lib/constants/submission";
import { LEVEL_WEIGHT } from "@/lib/constants/booking";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// ==========================================
// TYPES & CONSTANTS
// ==========================================

interface StudentVideoUploadDropzoneProps {
  currentLevel: DanceLevel;
}

const ALL_PROGRESSION_TIERS: Exclude<DanceLevel, "BEGINNER">[] = [
  DanceLevel.IMPROVER,
  DanceLevel.INTERMEDIATE,
  DanceLevel.ADVANCED,
];

const CASINO_FIGURE_QUICK_TAGS = [
  "Guapea & Basic Timing",
  "Dile Que No",
  "Enchufla Doble",
  "Vacilala",
  "Setenta (70)",
  "Setenta Complicado",
  "Sombrero",
  "Exhibela",
  "Kentucky",
] as const;

// ==========================================
// HELPER: XHR UPLOAD WITH PROGRESS TRACKING
// ==========================================

function uploadVideoToSupabaseSignedUrl(
  signedUrl: string,
  file: File,
  onProgress: (percentage: number) => void
): Promise<void> {
  if (signedUrl === "DEMO_DIRECT_BYPASS") {
    return new Promise((resolve) => {
      let pct = 20;
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
      }, 120);
    });
  }

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", signedUrl, true);
    xhr.setRequestHeader("Content-Type", file.type);

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        const percentage = Math.round((event.loaded / event.total) * 100);
        onProgress(percentage);
      }
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress(100);
        resolve();
      } else {
        reject(
          new Error(`Direct storage upload failed (HTTP ${xhr.status}).`)
        );
      }
    };

    xhr.onerror = () => {
      reject(
        new Error("Network interruption while uploading video to storage.")
      );
    };

    xhr.send(file);
  });
}

// ==========================================
// COMPONENT
// ==========================================

export function StudentVideoUploadDropzone({
  currentLevel,
}: StudentVideoUploadDropzoneProps) {
  const router = useRouter();
  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const nextUnlockableLevel = getNextUnlockableLevel(currentLevel);

  const [selectedTargetLevel, setSelectedTargetLevel] = React.useState<
    Exclude<DanceLevel, "BEGINNER">
  >(nextUnlockableLevel ?? DanceLevel.ADVANCED);

  const [videoFile, setVideoFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [studentNotes, setStudentNotes] = React.useState<string>("");
  const [isDragging, setIsDragging] = React.useState<boolean>(false);

  const [uploadPhase, setUploadPhase] = React.useState<
    "IDLE" | "SIGNING" | "UPLOADING" | "SAVING" | "SUCCESS"
  >("IDLE");
  const [uploadProgress, setUploadProgress] = React.useState<number>(0);
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null);

  React.useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!nextUnlockableLevel) {
    return null;
  }

  const syllabus = CUBAN_SALSA_SYLLABUS[selectedTargetLevel];
  const isBusy =
    uploadPhase === "SIGNING" ||
    uploadPhase === "UPLOADING" ||
    uploadPhase === "SAVING";

  const validateAndSelectFile = (file: File) => {
    setErrorMessage(null);

    if (!(file.type in ALLOWED_VIDEO_MIME_TYPES)) {
      setErrorMessage(
        "Unsupported video format. Please upload an MP4, MOV (QuickTime), or WebM file."
      );
      return;
    }

    if (file.size > MAX_VIDEO_SIZE_BYTES) {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      setErrorMessage(
        `Video file is ${sizeMb} MB, which exceeds the 100 MB maximum limit.`
      );
      return;
    }

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setVideoFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setUploadProgress(0);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndSelectFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (isBusy) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndSelectFile(file);
    }
  };

  const handleRemoveFile = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setVideoFile(null);
    setPreviewUrl(null);
    setUploadProgress(0);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleInsertFigureTag = (figureName: string) => {
    setStudentNotes((prev) => {
      const trimmed = prev.trim();
      if (trimmed.includes(figureName)) return prev;
      return trimmed.length === 0
        ? `Figures demonstrated: ${figureName}`
        : `${trimmed}, ${figureName}`;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!videoFile || !nextUnlockableLevel) return;

    setErrorMessage(null);

    try {
      setUploadPhase("SIGNING");
      const signedResult = await generateSignedUploadUrlAction({
        targetLevel: selectedTargetLevel,
        contentType: videoFile.type as AllowedVideoMimeType,
        fileSizeBytes: videoFile.size,
      });

      if (!signedResult.success) {
        setErrorMessage(signedResult.error.message);
        setUploadPhase("IDLE");
        return;
      }

      setUploadPhase("UPLOADING");
      setUploadProgress(0);
      await uploadVideoToSupabaseSignedUrl(
        signedResult.data.signedUrl,
        videoFile,
        setUploadProgress
      );

      setUploadPhase("SAVING");
      const submissionResult = await createVideoSubmissionAction({
        targetLevel: signedResult.data.targetLevel,
        videoPath: signedResult.data.videoPath,
        studentNotes,
      });

      if (!submissionResult.success) {
        setErrorMessage(submissionResult.error.message);
        setUploadPhase("IDLE");
        return;
      }

      setUploadPhase("SUCCESS");
      router.refresh();
    } catch (err) {
      const msg =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred during video upload.";
      setErrorMessage(msg);
      setUploadPhase("IDLE");
    }
  };

  return (
    <Card className="overflow-hidden border-border shadow-sm">
      <CardHeader className="border-b bg-muted/20 pb-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge
            variant="outline"
            className="border-amber-500/40 bg-amber-500/10 text-amber-700 dark:text-amber-300"
          >
            <Music className="mr-1.5 h-3.5 w-3.5" />
            Cuban Salsa (Casino & Rueda)
          </Badge>
          <span className="text-xs font-medium text-muted-foreground">
            Current Level:{" "}
            <strong className="text-foreground">{currentLevel}</strong>
          </span>
        </div>

        <CardTitle className="mt-2 text-xl">
          Level-Up Video Assessment
        </CardTitle>
        <CardDescription>
          Record a 45–90 second practice or social video showing your timing,
          partner frame, and required Casino combinations to unlock the next
          studio level.
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-6 pt-6">
          {/* 1. Target Level Selector */}
          <div className="space-y-2.5">
            <label className="text-sm font-semibold leading-none">
              1. Target Level to Unlock
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {ALL_PROGRESSION_TIERS.map((tier) => {
                const tierWeight = LEVEL_WEIGHT[tier];
                const currentWeight = LEVEL_WEIGHT[currentLevel];

                const isAlreadyUnlocked = tierWeight <= currentWeight;
                const isNextUnlockable = tier === nextUnlockableLevel;
                const isFutureLocked = tierWeight > currentWeight + 1;
                const isSelected = selectedTargetLevel === tier;

                return (
                  <button
                    key={tier}
                    type="button"
                    disabled={!isNextUnlockable || isBusy}
                    onClick={() => {
                      if (isNextUnlockable) setSelectedTargetLevel(tier);
                    }}
                    className={`flex items-center justify-between rounded-xl border p-3.5 text-left transition-all ${
                      isSelected && isNextUnlockable
                        ? "border-primary bg-primary/5 ring-2 ring-primary/30"
                        : isAlreadyUnlocked
                          ? "cursor-not-allowed border-emerald-500/30 bg-emerald-500/5 opacity-70"
                          : "cursor-not-allowed border-border bg-muted/30 opacity-50"
                    }`}
                  >
                    <div>
                      <p className="text-sm font-bold">{tier}</p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        {isAlreadyUnlocked
                          ? "Already Unlocked"
                          : isNextUnlockable
                            ? "Available to Unlock Next"
                            : `Requires ${
                                ALL_PROGRESSION_TIERS[
                                  ALL_PROGRESSION_TIERS.indexOf(tier) - 1
                                ]
                              } First`}
                      </p>
                    </div>

                    {isAlreadyUnlocked && (
                      <Check className="h-4 w-4 text-emerald-500" />
                    )}
                    {isNextUnlockable && (
                      <Sparkles className="h-4 w-4 text-amber-500" />
                    )}
                    {isFutureLocked && (
                      <Lock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>
                );
              })}
            </div>

            {/* Required Syllabus Checklist for Target Level */}
            <div className="rounded-xl border bg-muted/30 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                {syllabus.title} Requirements
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {syllabus.description}
              </p>
              <ul className="mt-2.5 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
                {syllabus.requiredFigures.map((figure) => (
                  <li
                    key={figure}
                    className="flex items-center gap-2 text-xs font-medium"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                    <span>{figure}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* 2. Drag & Drop Video Selector */}
          <div className="space-y-2.5">
            <label className="text-sm font-semibold leading-none">
              2. Assessment Video File
            </label>

            {!videoFile ? (
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  if (!isBusy) setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => !isBusy && fileInputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : "border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="video/mp4,video/quicktime,video/webm"
                  onChange={handleFileInputChange}
                  className="hidden"
                />
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <p className="mt-3 text-sm font-semibold">
                  Drag and drop your Cuban Salsa video here, or click to browse
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Supports MP4, MOV, or WebM (Max 100 MB). Ensure both your
                  footwork and upper-body frame are clearly visible.
                </p>
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border bg-card">
                {previewUrl && (
                  <div className="aspect-video w-full bg-black">
                    <video
                      src={previewUrl}
                      controls
                      playsInline
                      className="h-full w-full object-contain"
                    />
                  </div>
                )}
                <div className="flex items-center justify-between gap-4 p-3.5">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Film className="h-5 w-5" />
                    </div>
                    <div className="truncate">
                      <p className="truncate text-sm font-medium">
                        {videoFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(videoFile.size / (1024 * 1024)).toFixed(2)} MB •{" "}
                        {videoFile.type}
                      </p>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isBusy}
                    onClick={handleRemoveFile}
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="mr-1.5 h-4 w-4" />
                    Change Video
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* 3. Syllabus Combinations & Student Notes */}
          <div className="space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-1">
              <label
                htmlFor="syllabus-notes"
                className="text-sm font-semibold leading-none"
              >
                3. Syllabus Combinations & Notes for Instructor
              </label>
              <span className="text-xs text-muted-foreground">
                Click a Casino figure below to tag it in your notes
              </span>
            </div>

            <div className="flex flex-wrap gap-1.5">
              {CASINO_FIGURE_QUICK_TAGS.map((figure) => (
                <button
                  key={figure}
                  type="button"
                  disabled={isBusy}
                  onClick={() => handleInsertFigureTag(figure)}
                  className="rounded-full border bg-secondary/40 px-2.5 py-1 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary"
                >
                  + {figure}
                </button>
              ))}
            </div>

            <Textarea
              id="syllabus-notes"
              rows={3}
              disabled={isBusy}
              value={studentNotes}
              onChange={(e) => setStudentNotes(e.target.value)}
              placeholder="e.g., Dancing Lead in the white guayabera. Executing Dile Que No, Enchufla Doble, Setenta, and Vacilala to '537 C.U.B.A.'..."
            />
            <div className="flex justify-end text-xs text-muted-foreground">
              {studentNotes.trim().length} / 1000 characters
            </div>
          </div>

          {/* 4. Direct-to-Storage Upload Progress Bar */}
          {isBusy && (
            <div className="space-y-2.5 rounded-xl border bg-muted/30 p-4">
              <div className="flex items-center justify-between text-xs font-semibold">
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  {uploadPhase === "SIGNING" &&
                    "Verifying level eligibility & generating signed URL..."}
                  {uploadPhase === "UPLOADING" &&
                    "Uploading video directly to Supabase Storage..."}
                  {uploadPhase === "SAVING" &&
                    "Registering submission in instructor grading queue..."}
                </span>
                <span className="tabular-nums text-primary">
                  {uploadProgress}%
                </span>
              </div>

              <div className="h-2.5 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full bg-primary transition-all duration-150"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorMessage && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-xs font-medium text-destructive"
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-end border-t bg-muted/10 px-6 py-4">
          <Button
            type="submit"
            disabled={!videoFile || isBusy}
            className="w-full sm:w-auto"
          >
            {isBusy ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading ({uploadProgress}%)...
              </>
            ) : (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Submit Video to Unlock {selectedTargetLevel}
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
