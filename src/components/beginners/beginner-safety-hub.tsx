"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Footprints,
  RotateCw,
  HelpCircle,
  Video,
  Users,
  Heart,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DigitalEtiquetteModal } from "@/components/beginners/digital-etiquette-modal";
import { VisualDressCodeModal } from "@/components/beginners/visual-dress-code-modal";
import { FirstClassPrepModal } from "@/components/beginners/first-class-prep-modal";
import { RotationMechanicsCard } from "@/components/beginners/rotation-mechanics-card";
import { FloorAmbassadorsCard } from "@/components/beginners/floor-ambassadors-card";
import { AnonymousQuestionBox } from "@/components/beginners/anonymous-question-box";

export function BeginnerSafetyHub() {
  const [isHubExpanded, setIsHubExpanded] = useState(false);
  const [isEtiquetteOpen, setIsEtiquetteOpen] = useState(false);
  const [isDressCodeOpen, setIsDressCodeOpen] = useState(false);
  const [isPrepVideoOpen, setIsPrepVideoOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"NONE" | "ROTATION" | "AMBASSADORS" | "QUESTIONS">("NONE");

  return (
    <div className="space-y-4">
      {/* Beginner Psychological Safety Banner */}
      <div className="rounded-2xl border border-line bg-surface-1 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold text-[10px]">
                <Heart className="mr-1 h-3 w-3 fill-emerald-300" />
                First-Timer &amp; Beginner Zone
              </Badge>
              <span className="text-xs font-semibold text-emerald-400">
                100% Judgment-Free Studio
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-extrabold tracking-tight text-foreground">
              New to Cuban Salsa or BOH Studios? You Are Safe Here!
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
              No partner required, no special shoes needed, and mistakes are celebrated.
            </p>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsHubExpanded((prev) => !prev)}
            className="h-8 text-xs font-bold border-secondary-base/40 text-secondary-base hover:bg-secondary-light/40 shrink-0"
          >
            {isHubExpanded ? "Hide Comfort Hub ▲" : "Beginner Comfort Guides & FAQ ▼"}
          </Button>
        </div>

        {/* Collapsible Content */}
        {isHubExpanded && (
          <div className="pt-4 border-t border-border/60 mt-3 space-y-3 animate-in fade-in duration-200">
            <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPrepVideoOpen(true)}
              className="h-8 text-xs font-bold border-secondary-base/40 text-secondary-base hover:bg-secondary-light/40"
            >
              <Video className="mr-1.5 h-3.5 w-3.5 text-secondary-base" />
              1-Min Video Prep
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsDressCodeOpen(true)}
              className="h-8 text-xs font-bold border-secondary-base/40 text-secondary-base hover:bg-secondary-light/40"
            >
              <Footprints className="mr-1.5 h-3.5 w-3.5 text-secondary-base" />
              What to Wear
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsEtiquetteOpen(true)}
              className="h-8 text-xs font-bold border-secondary-base/40 text-secondary-base hover:bg-secondary-light/40"
            >
              <ShieldCheck className="mr-1.5 h-3.5 w-3.5 text-secondary-base" />
              Studio Etiquette
            </Button>
          </div>

        {/* 3 Quick-Toggle Tabs */}
        <div className="mt-4 pt-3 border-t border-border/60 flex flex-wrap gap-2 text-xs">
          <button
            type="button"
            onClick={() => setActiveTab(activeTab === "ROTATION" ? "NONE" : "ROTATION")}
            className={`rounded-lg px-3 py-1.5 font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "ROTATION"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <RotateCw className="h-3.5 w-3.5" />
            <span>How Partner Rotation Works</span>
            {activeTab === "ROTATION" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab(activeTab === "AMBASSADORS" ? "NONE" : "AMBASSADORS")}
            className={`rounded-lg px-3 py-1.5 font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "AMBASSADORS"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Meet Floor Ambassadors</span>
            {activeTab === "AMBASSADORS" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab(activeTab === "QUESTIONS" ? "NONE" : "QUESTIONS")}
            className={`rounded-lg px-3 py-1.5 font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "QUESTIONS"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <HelpCircle className="h-3.5 w-3.5" />
            <span>Ask Anonymously</span>
            {activeTab === "QUESTIONS" ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
        </div>

        {/* Dynamic Expandable Content */}
        {activeTab === "ROTATION" && (
          <div className="mt-4 pt-1 animate-in fade-in duration-200">
            <RotationMechanicsCard />
          </div>
        )}

        {activeTab === "AMBASSADORS" && (
          <div className="mt-4 pt-1 animate-in fade-in duration-200">
            <FloorAmbassadorsCard />
          </div>
        )}

        {activeTab === "QUESTIONS" && (
          <div className="mt-4 pt-1 animate-in fade-in duration-200">
            <AnonymousQuestionBox />
          </div>
        )}
          </div>
        )}
      </div>

      {/* Modals */}
      <DigitalEtiquetteModal
        isOpen={isEtiquetteOpen}
        onClose={() => setIsEtiquetteOpen(false)}
        onAgree={() => {}}
      />
      <VisualDressCodeModal
        isOpen={isDressCodeOpen}
        onClose={() => setIsDressCodeOpen(false)}
      />
      <FirstClassPrepModal
        isOpen={isPrepVideoOpen}
        onClose={() => setIsPrepVideoOpen(false)}
      />
    </div>
  );
}
