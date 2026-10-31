"use client";

import React from "react";
import { Gauge, Video, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TeacherAvatar } from "@/components/ui/teacher-avatar";
import { ClassSongLinks } from "@/components/music/class-song-links";
import { getSafeVideoEmbed, type AttendedRecapItem } from "./recap-types";

interface RecapVideoPlayerProps {
  selectedRecap: AttendedRecapItem | null;
  playbackSpeed: number;
  handleSpeedChange: (speed: number) => void;
}

export function RecapVideoPlayer({
  selectedRecap,
  playbackSpeed,
  handleSpeedChange,
}: RecapVideoPlayerProps) {
  if (!selectedRecap) {
    return (
      <Card className="py-12 text-center border">
        <CardContent>
          <Video className="mx-auto h-12 w-12 text-muted-foreground/30" />
          <h3 className="mt-3 text-base font-bold">No Recap Selected</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Select a class from the list to watch the end-of-class recap video.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
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
          <Gauge className="h-3.5 w-3.5 text-amber-400" />
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
                  ? "bg-amber-500 text-stone-950 shadow-xs"
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
          <Badge className="bg-amber-500 text-stone-950 font-bold text-xs">
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
                <Sparkles className="mr-1 h-3 w-3 text-amber-400" />
                {fig}
              </Badge>
            ))}
          </div>
        </div>

        <ClassSongLinks songs={selectedRecap.practiceSongs ?? []} heading="Songs from this class" />

        {/* Maestro Notes */}
        {selectedRecap.recapNotes && (
          <div className="rounded-xl border bg-muted/20 p-3.5 space-y-1 text-xs">
            <span className="font-bold text-amber-300">
              Maestro Coaching Notes:
            </span>
            <p className="text-muted-foreground leading-relaxed">
              {selectedRecap.recapNotes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
