"use client";

import { useState, useMemo, useSyncExternalStore } from "react";
import {
  Award,
  CheckCircle2,
  Flame,
  Search,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  BookOpen,
  Music,
  ChevronDown,
  ChevronUp,
  HelpCircle,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  CUBAN_CURRICULUM_DATA,
  CURRICULUM_REFERENCE_SONGS,
  CurriculumLevel,
  CurriculumPillar,
  CurriculumSkillItem,
  CurriculumReferenceSong,
  PILLAR_LABELS,
} from "@/lib/constants/cuban-curriculum-2027";

type SkillStatus = "NOT_STARTED" | "LEARNING" | "MASTERED";

interface CubanCurriculumSkillTreeProps {
  defaultLevel?: CurriculumLevel;
  studentName?: string;
  className?: string;
}

const STORAGE_KEY = "salsa_explosion_curriculum_progress_v1";

const LEVELS: CurriculumLevel[] = ["Beginner", "Improver", "Intermediate", "Advanced"];

const FIRST_NIGHT_IDS = new Set(["beg-solo-1", "beg-pw-1", "beg-pw-2"]);

function subscribeProgress(callback: () => void) {
  if (typeof window === "undefined") return () => {};
  window.addEventListener("storage", callback);
  window.addEventListener("curriculum_progress_change", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("curriculum_progress_change", callback);
  };
}

function getProgressSnapshot(): string {
  if (typeof window === "undefined") return "{}";
  try {
    return localStorage.getItem(STORAGE_KEY) ?? "{}";
  } catch {
    return "{}";
  }
}

function getServerProgressSnapshot(): string {
  return "{}";
}

export function CubanCurriculumSkillTree({
  defaultLevel = "Beginner",
  studentName,
  className = "",
}: CubanCurriculumSkillTreeProps) {
  const [selectedLevel, setSelectedLevel] = useState<CurriculumLevel>(defaultLevel);
  const [selectedPillar, setSelectedPillar] = useState<CurriculumPillar | "ALL">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [focusFirstNight, setFocusFirstNight] = useState(false);
  const [expandedSkillIds, setExpandedSkillIds] = useState<Set<string>>(new Set());
  const [expandAllTips, setExpandAllTips] = useState(false);
  const [songsExpanded, setSongsExpanded] = useState(false);

  const toggleSkillExpanded = (skillId: string) => {
    setExpandedSkillIds((prev) => {
      const next = new Set(prev);
      if (next.has(skillId)) {
        next.delete(skillId);
      } else {
        next.add(skillId);
      }
      return next;
    });
  };

  const rawProgress = useSyncExternalStore(
    subscribeProgress,
    getProgressSnapshot,
    getServerProgressSnapshot
  );

  const progressMap = useMemo(() => {
    try {
      return JSON.parse(rawProgress) as Record<string, SkillStatus>;
    } catch {
      return {};
    }
  }, [rawProgress]);

  const handleToggleStatus = (skillId: string) => {
    const current = progressMap[skillId] ?? "NOT_STARTED";
    let next: SkillStatus = "LEARNING";
    if (current === "NOT_STARTED") next = "LEARNING";
    else if (current === "LEARNING") next = "MASTERED";
    else next = "NOT_STARTED";

    const updated = { ...progressMap, [skillId]: next };
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new Event("curriculum_progress_change"));
    } catch (err) {
      console.error("Failed to persist curriculum progress to localStorage:", err);
    }
  };

  // Filter skills by level, pillar, search query, or first night focus mode
  const filteredSkills = useMemo(() => {
    if (focusFirstNight) {
      return CUBAN_CURRICULUM_DATA.filter((skill) => FIRST_NIGHT_IDS.has(skill.id));
    }
    const q = searchQuery.trim().toLowerCase();
    return CUBAN_CURRICULUM_DATA.filter((skill) => {
      const matchesLevel = skill.level === selectedLevel;
      const matchesPillar = selectedPillar === "ALL" || skill.pillar === selectedPillar;
      const matchesSearch =
        !q ||
        skill.name.toLowerCase().includes(q) ||
        skill.summary.toLowerCase().includes(q) ||
        skill.unConfuserTip.toLowerCase().includes(q) ||
        (skill.aliases && skill.aliases.some((a) => a.toLowerCase().includes(q)));

      return matchesLevel && matchesPillar && matchesSearch;
    });
  }, [selectedLevel, selectedPillar, searchQuery, focusFirstNight]);

  // Reference songs for the selected level
  const levelSongs = useMemo(() => {
    if (selectedPillar !== "ALL" && selectedPillar !== "reference_songs") return [];
    const q = searchQuery.trim().toLowerCase();
    return CURRICULUM_REFERENCE_SONGS.filter((song) => {
      const matchesLevel = song.level === selectedLevel;
      const matchesSearch =
        !q ||
        song.title.toLowerCase().includes(q) ||
        song.artist.toLowerCase().includes(q) ||
        song.whyThisSong.toLowerCase().includes(q);

      return matchesLevel && matchesSearch;
    });
  }, [selectedLevel, selectedPillar, searchQuery]);

  // Compute live progress stats for the selected level
  const levelAllSkills = useMemo(() => {
    return CUBAN_CURRICULUM_DATA.filter((s) => s.level === selectedLevel);
  }, [selectedLevel]);

  const masteredCount = useMemo(() => {
    return levelAllSkills.filter((s) => progressMap[s.id] === "MASTERED").length;
  }, [levelAllSkills, progressMap]);

  const learningCount = useMemo(() => {
    return levelAllSkills.filter((s) => progressMap[s.id] === "LEARNING").length;
  }, [levelAllSkills, progressMap]);

  const progressPercent = levelAllSkills.length > 0
    ? Math.round((masteredCount / levelAllSkills.length) * 100)
    : 0;

  return (
    <Card
      data-testid="curriculum-skill-tree"
      className={`border-2 border-primary-base/30 bg-gradient-to-br from-card via-background to-card shadow-sm ${className}`}
    >
      <CardHeader className="p-3.5 sm:p-6 pb-3 sm:pb-4 space-y-2.5 sm:space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge className="bg-primary-base text-white text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 px-2.5 sm:px-3 py-0.5 sm:py-1">
                <Sparkles className="h-3 w-3" />
                2027 Modern Cuban Syllabus
              </Badge>
              <Badge variant="outline" className="border-amber-500/40 text-amber-300 font-extrabold text-xs">
                4 Levels • 5 Pillars
              </Badge>
            </div>
            <CardTitle className="text-lg sm:text-2xl font-black tracking-tight text-foreground">
              Interactive Cuban Salsa Skill Tree & Checklist
            </CardTitle>
          </div>

          {/* Progress Overview Pill */}
          <div className="flex items-center gap-3 bg-muted/40 border p-2.5 rounded-2xl shrink-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/10 text-rose-300 font-black">
              <Award className="h-5 w-5" />
            </div>
            <div className="text-xs">
              <div className="font-extrabold text-foreground">
                {masteredCount} of {levelAllSkills.length} Mastered
              </div>
              <div className="text-[11px] text-muted-foreground font-semibold flex items-center gap-2">
                <span>{progressPercent}% Complete</span>
                {learningCount > 0 && (
                  <span className="text-amber-400 font-bold">
                    • {learningCount} In Practice
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <CardDescription className="text-xs text-foreground/90 font-medium leading-relaxed">
          {studentName
            ? `Welcome, ${studentName}! Track your path from first Guapea to advanced Rueda and Timba contrapunto.`
            : "Explore every figure, isolation, musical gear, and reference track taught at Salsa Explosion UK. Tap any skill to mark it as Learning or Mastered."}
        </CardDescription>

        {/* Progress Bar */}
        <div className="pt-1">
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-600 to-rose-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3.5 sm:p-6 pt-0 sm:pt-0 space-y-4 sm:space-y-6">
        {/* Reassurance Banner from Maestro Enrique */}
        <div
          data-testid="curriculum-reassurance-banner"
          className="rounded-2xl border-2 border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-background to-orange-500/10 p-3.5 sm:p-6 space-y-3 sm:space-y-4"
        >
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="space-y-1.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-amber-800 text-white font-black text-[11px] tracking-wide uppercase px-2.5 py-0.5">
                  Maestro Enrique&apos;s Guidance
                </Badge>
                <span className="text-xs font-bold text-amber-300">
                  Relax &amp; Breathe • Zero Exam Pressure
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-foreground">
                Don&apos;t feel overwhelmed! Cuban Salsa is a social conversation, not a school exam.
              </h3>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                You do <strong>not</strong> need to learn everything on this page from day one. In your first classes at BOH Studios, our teachers only focus on 3 natural movements. The rest of this syllabus is a long-term curiosity library that unfolds over months and years of social dancing!
              </p>
            </div>

            {/* Quick Toggle Button */}
            <Button
              type="button"
              variant={focusFirstNight ? "default" : "outline"}
              size="sm"
              onClick={() => {
                const next = !focusFirstNight;
                setFocusFirstNight(next);
                if (next) {
                  setSelectedLevel("Beginner");
                  setSelectedPillar("ALL");
                }
              }}
              className={`shrink-0 font-extrabold text-xs transition-all ${
                focusFirstNight
                  ? "bg-amber-800 text-white hover:bg-amber-900 shadow-sm"
                  : "border-amber-500/50 bg-background text-foreground hover:bg-amber-500/10"
              }`}
            >
              {focusFirstNight ? "✓ Focus Mode Active (3 Moves)" : "Focus Mode: Show Only My First-Night Essentials (3 Moves)"}
            </Button>
          </div>

          {/* First-Night 3 Essentials Spotlight Cards */}
          <div className="pt-2 border-t border-amber-500/20">
            <span className="text-[11px] font-black uppercase tracking-wider text-amber-200 block mb-2">
              Your First Night at BOH Studios (The Only 3 Things You Need):
            </span>
            <div tabIndex={0} role="region" aria-label="First night essentials spotlight" className="flex overflow-x-auto no-scrollbar gap-2 sm:grid sm:grid-cols-3 text-xs pb-1 sm:pb-0 focus:outline-none rounded-xl">
              <div className="rounded-xl border border-amber-500/20 bg-card/80 p-2.5 sm:p-3 space-y-1 min-w-[210px] sm:min-w-0 shrink-0 sm:shrink">
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-[10px] font-black text-amber-200">
                    1
                  </span>
                  <span>Paso Básico</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Stepping relaxed on beats 1-2-3, 5-6-7. Just feeling the rhythm in your feet.
                </p>
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-card/80 p-2.5 sm:p-3 space-y-1 min-w-[210px] sm:min-w-0 shrink-0 sm:shrink">
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-[10px] font-black text-amber-200">
                    2
                  </span>
                  <span>Guapea</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  The friendly open-position push &amp; pull. Connecting palm-to-palm with your partner.
                </p>
              </div>

              <div className="rounded-xl border border-amber-500/20 bg-card/80 p-2.5 sm:p-3 space-y-1 min-w-[210px] sm:min-w-0 shrink-0 sm:shrink">
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500/20 text-[10px] font-black text-amber-200">
                    3
                  </span>
                  <span>Dile Que No</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  Rotating smoothly as a couple to reset the circle. That is literally all you need to start!
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 1. Level Navigation Tabs */}
        <div className="space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground block">
            Select Syllabus Level:
          </span>
          <div role="tablist" aria-label="Curriculum Levels" className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {LEVELS.map((lvl) => {
              const isSelected = selectedLevel === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => {
                    setSelectedLevel(lvl);
                    setFocusFirstNight(false);
                  }}
                  className={`rounded-xl sm:rounded-2xl border p-2 sm:p-3 text-left transition-all min-h-[50px] sm:min-h-[58px] flex flex-col justify-between ${
                    isSelected
                      ? "border-primary-base bg-primary-base/10 shadow-xs ring-2 ring-primary-base/30 text-foreground"
                      : "border-border bg-card/70 hover:bg-muted/50 text-muted-foreground"
                  }`}
                >
                  <span className="text-[9px] sm:text-[10px] font-mono font-extrabold uppercase tracking-wider">
                    {lvl === "Beginner" ? "Lvl 1" : lvl === "Improver" ? "Lvl 2" : lvl === "Intermediate" ? "Lvl 3" : "Lvl 4"}
                  </span>
                  <div className="font-black text-xs sm:text-sm text-foreground flex items-center justify-between">
                    <span className="truncate">{lvl}</span>
                    {lvl === "Beginner" && (
                      <span className="text-[8px] sm:text-[9px] bg-amber-500/20 text-amber-200 px-1 py-0.2 sm:px-1.5 sm:py-0.5 rounded font-bold uppercase hidden sm:inline">
                        Start
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. Filter Toolbar & Search */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              aria-label="Search skills, figures, or un-confuser tips"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${selectedLevel} skills (e.g. Enchufla, Dile Que No, Setenta)...`}
              className="w-full rounded-xl border bg-background pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary-base"
            />
          </div>

          {/* Pillar Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
            <Button
              type="button"
              size="sm"
              variant={selectedPillar === "ALL" ? "default" : "outline"}
              onClick={() => setSelectedPillar("ALL")}
              className={`text-xs font-bold h-8 shrink-0 ${
                selectedPillar === "ALL" ? "bg-primary-base text-white" : "bg-card text-foreground"
              }`}
            >
              All Pillars
            </Button>
            {(Object.keys(PILLAR_LABELS) as CurriculumPillar[]).map((pil) => (
              <Button
                key={pil}
                type="button"
                size="sm"
                variant={selectedPillar === pil ? "default" : "outline"}
                onClick={() => setSelectedPillar(pil)}
                className={`text-xs font-bold h-8 shrink-0 ${
                  selectedPillar === pil ? "bg-primary-base text-white" : "bg-card text-foreground"
                }`}
              >
                {PILLAR_LABELS[pil].split(" ")[0]}
              </Button>
            ))}
          </div>
        </div>

        {/* 3. Skill Cards Grid */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-bold text-muted-foreground border-b pb-2">
            <span>
              Showing {filteredSkills.length} Curriculum Skills in {selectedLevel}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                data-testid="toggle-all-maestro-tips"
                onClick={() => setExpandAllTips(!expandAllTips)}
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-amber-300 hover:underline"
              >
                <HelpCircle className="h-3.5 w-3.5" />
                <span>{expandAllTips ? "Collapse All Maestro Tips" : "Expand All Maestro Tips"}</span>
              </button>
            </div>
          </div>

          {filteredSkills.length === 0 ? (
            <div className="rounded-2xl border border-dashed p-8 text-center text-xs text-muted-foreground space-y-2">
              <p>No skills match your search filter in this category.</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  setSelectedPillar("ALL");
                }}
                className="text-xs"
              >
                Reset Search Filters
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {filteredSkills.map((skill: CurriculumSkillItem) => {
                const status = progressMap[skill.id] ?? "NOT_STARTED";
                const isMastered = status === "MASTERED";
                const isLearning = status === "LEARNING";
                const isExpanded = expandAllTips || expandedSkillIds.has(skill.id);

                return (
                  <div
                    key={skill.id}
                    className={`rounded-2xl border-2 p-3 sm:p-4 transition-all flex flex-col justify-between space-y-2.5 sm:space-y-3.5 ${
                      isMastered
                        ? "border-emerald-500/40 bg-emerald-500/[0.04]"
                        : isLearning
                          ? "border-amber-500/50 bg-amber-500/[0.05] ring-1 ring-amber-500/20"
                          : "border-border bg-card/60"
                    }`}
                  >
                    <div className="space-y-2">
                      {/* Top Bar: Pillar & Status Toggle Button */}
                      <div className="flex items-center justify-between gap-2">
                        <Badge
                          variant="outline"
                          className="text-[10px] font-bold border-muted-foreground/30 text-muted-foreground uppercase tracking-wider"
                        >
                          {PILLAR_LABELS[skill.pillar]}
                        </Badge>

                        <button
                          type="button"
                          onClick={() => handleToggleStatus(skill.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black transition-all ${
                            isMastered
                              ? "bg-emerald-600 text-white shadow-xs"
                              : isLearning
                                ? "bg-amber-700 text-white shadow-xs"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                          }`}
                        >
                          {isMastered ? (
                            <>
                              <CheckCircle2 className="h-3 w-3" />
                              Mastered
                            </>
                          ) : isLearning ? (
                            <>
                              <Flame className="h-3 w-3" />
                              Practicing Now
                            </>
                          ) : (
                            <>
                              <BookOpen className="h-3 w-3" />
                              Not Started
                            </>
                          )}
                        </button>
                      </div>

                      {/* Title & Phonetics */}
                      <div>
                        <h4 className="text-base font-black text-foreground">
                          {skill.name}
                        </h4>
                        {skill.phonetic && (
                          <span className="text-[11px] text-muted-foreground font-mono italic">
                            [{skill.phonetic}]
                          </span>
                        )}
                        {skill.aliases && skill.aliases.length > 0 && (
                          <span className="text-[11px] text-muted-foreground block font-medium">
                            Aliases: {skill.aliases.join(", ")}
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-foreground/90 font-medium leading-relaxed">
                        {skill.summary}
                      </p>
                    </div>

                    {/* Collapsible Details & Maestro Un-Confuser Diagnostic */}
                    <div className="pt-2 border-t space-y-2">
                      <button
                        type="button"
                        data-testid="toggle-skill-details"
                        aria-expanded={isExpanded}
                        onClick={() => toggleSkillExpanded(skill.id)}
                        className="w-full flex items-center justify-between text-left text-xs font-bold text-amber-300 hover:text-foreground transition-all rounded-lg p-1.5 hover:bg-muted/40"
                      >
                        <span className="flex items-center gap-1.5">
                          <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
                          <span>
                            {isExpanded
                              ? "Hide Maestro Tip & Mechanics"
                              : "Feeling stuck? View Maestro Tip & Handhold Mechanics"}
                          </span>
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="h-4 w-4 text-muted-foreground" />
                        )}
                      </button>

                      {isExpanded && (
                        <div className="space-y-2.5 pt-1">
                          {/* Geometry & Handhold (for partnerwork) */}
                          {(skill.entryExitGeometry || skill.handholdType) && (
                            <div className="rounded-xl border bg-muted/30 p-2.5 text-[11px] space-y-1 text-muted-foreground">
                              {skill.entryExitGeometry && (
                                <div>
                                  <strong className="text-foreground">Geometry:</strong> {skill.entryExitGeometry}
                                </div>
                              )}
                              {skill.handholdType && (
                                <div>
                                  <strong className="text-foreground">Handhold:</strong> {skill.handholdType}
                                </div>
                              )}
                              {skill.claveSync && (
                                <div>
                                  <strong className="text-foreground">Clave Timing:</strong> {skill.claveSync}
                                </div>
                              )}
                            </div>
                          )}

                          {/* Un-Confuser Diagnostic Badge */}
                          <div className="rounded-xl border-2 border-rose-500/40 bg-rose-500/5 p-3 space-y-1">
                            <div className="flex items-center gap-1.5 text-rose-300 font-black text-[11px] uppercase tracking-wider">
                              <ShieldAlert className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                              <span>Un-Confuser Diagnostic:</span>
                            </div>
                            <p className="text-xs text-foreground font-semibold leading-snug">
                              {skill.unConfuserTip}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 4. Curriculum Reference Songs (Collapsible Tray) */}
        {levelSongs.length > 0 && (
          <div className="space-y-3 pt-4 border-t">
            <button
              type="button"
              data-testid="toggle-reference-songs"
              onClick={() => setSongsExpanded(!songsExpanded)}
              className="w-full flex items-center justify-between p-3 rounded-2xl border bg-muted/30 hover:bg-muted/50 transition-all text-left"
            >
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4 text-amber-500" />
                <span className="text-sm font-black text-foreground">
                  Listen to Level Reference Songs ({levelSongs.length} Tracks)
                </span>
                <Badge variant="outline" className="text-[10px] font-bold border-amber-500/40 text-amber-300">
                  Optional Listening
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
                <span className="hidden sm:inline">
                  {songsExpanded ? "Hide Reference Tracks" : "Show Benchmark Tracks"}
                </span>
                {songsExpanded ? (
                  <ChevronUp className="h-4 w-4" />
                ) : (
                  <ChevronDown className="h-4 w-4" />
                )}
              </div>
            </button>

            {songsExpanded && (
              <div className="grid gap-3 sm:grid-cols-2 pt-1">
                {levelSongs.map((song: CurriculumReferenceSong) => (
                  <div
                    key={song.id}
                    className="rounded-2xl border bg-card p-4 space-y-2.5 text-xs shadow-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-black text-sm text-foreground">
                          {song.title}
                        </h4>
                        <p className="text-muted-foreground font-semibold">
                          {song.artist} • <span className="font-mono">{song.bpm} BPM</span>
                        </p>
                      </div>
                      <Badge variant="outline" className="text-[10px] font-bold border-amber-500/40 text-amber-300">
                        {song.subGenre}
                      </Badge>
                    </div>

                    <p className="text-foreground/90 font-medium leading-relaxed">
                      <strong className="text-foreground">Why this song?</strong> {song.whyThisSong}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {song.gearShiftsObserved.map((gear) => (
                        <span
                          key={gear}
                          className="inline-flex items-center rounded-md border bg-muted px-2 py-0.5 text-[10px] font-bold text-foreground"
                        >
                          {gear}
                        </span>
                      ))}
                    </div>

                    <div className="pt-1 border-t flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground">
                        Listen: {song.instrumentsToListenFor.join(", ")}
                      </span>
                      <a
                        href={song.spotifySearchUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-extrabold text-rose-300 hover:underline text-[11px]"
                      >
                        Spotify <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
