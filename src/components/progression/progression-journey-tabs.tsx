"use client";

import { useState, ReactNode } from "react";
import {
  BookOpen,
  Award,
  Video,
  HeartHandshake,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProgressionJourneyTabsProps {
  currentLevel: string;
  syllabusTabContent: ReactNode;
  milestonesTabContent: ReactNode;
  videoFeedbackTabContent: ReactNode;
  submissionCount: number;
}

type TabKey = "syllabus" | "milestones" | "video";

export function ProgressionJourneyTabs({
  currentLevel,
  syllabusTabContent,
  milestonesTabContent,
  videoFeedbackTabContent,
  submissionCount,
}: ProgressionJourneyTabsProps) {
  const [activeTab, setActiveTab] = useState<TabKey>("syllabus");

  return (
    <div
      data-testid="progression-journey-tabs"
      className="space-y-6"
    >
      {/* 3-Tab Journey Switcher */}
      <div
        role="tablist"
        aria-label="Student Journey Navigation"
        className="flex items-center gap-2 border-b pb-3 overflow-x-auto no-scrollbar"
      >
        <button
          type="button"
          role="tab"
          id="tab-syllabus"
          aria-selected={activeTab === "syllabus"}
          aria-controls="panel-syllabus"
          onClick={() => setActiveTab("syllabus")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all min-h-10 shrink-0 ${
            activeTab === "syllabus"
              ? "bg-amber-600 text-white shadow-xs"
              : "border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <BookOpen className="h-4 w-4" />
          <span>My Syllabus &amp; Checklist</span>
          <Badge className="bg-white/20 text-white font-mono text-[10px] px-1.5 py-0">
            {currentLevel}
          </Badge>
        </button>

        <button
          type="button"
          role="tab"
          id="tab-milestones"
          aria-selected={activeTab === "milestones"}
          aria-controls="panel-milestones"
          onClick={() => setActiveTab("milestones")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all min-h-10 shrink-0 ${
            activeTab === "milestones"
              ? "bg-amber-600 text-white shadow-xs"
              : "border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Award className="h-4 w-4" />
          <span>Badges &amp; Class Streaks</span>
        </button>

        <button
          type="button"
          role="tab"
          id="tab-video"
          aria-selected={activeTab === "video"}
          aria-controls="panel-video"
          onClick={() => setActiveTab("video")}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all min-h-10 shrink-0 ${
            activeTab === "video"
              ? "bg-amber-600 text-white shadow-xs"
              : "border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
          }`}
        >
          <Video className="h-4 w-4" />
          <span>Video Feedback (Optional)</span>
          {submissionCount > 0 && (
            <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0">
              {submissionCount}
            </Badge>
          )}
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "syllabus" && (
        <div
          id="panel-syllabus"
          role="tabpanel"
          aria-labelledby="tab-syllabus"
          className="space-y-6"
        >
          {syllabusTabContent}
        </div>
      )}

      {activeTab === "milestones" && (
        <div
          id="panel-milestones"
          role="tabpanel"
          aria-labelledby="tab-milestones"
          className="space-y-6"
        >
          {milestonesTabContent}
        </div>
      )}

      {activeTab === "video" && (
        <div
          id="panel-video"
          role="tabpanel"
          aria-labelledby="tab-video"
          className="space-y-6"
        >
          {/* Reassurance Callout for Video Feedback */}
          <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4 sm:p-5 flex items-start gap-3">
            <HeartHandshake className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="space-y-1 text-xs leading-relaxed">
              <span className="font-bold text-foreground block">
                Video Submissions are 100% Optional
              </span>
              <p className="text-muted-foreground">
                Over 95% of student promotions at Salsa Explosion happen naturally during weekly classes at BOH Studios when Maestro Enrique and our instructors see your partner connection and timing. This video check-in is purely an extra convenience if you practice at home and want personal feedback from our faculty!
              </p>
            </div>
          </div>

          {videoFeedbackTabContent}
        </div>
      )}
    </div>
  );
}
