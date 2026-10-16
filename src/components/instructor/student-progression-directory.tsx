"use client";

import { useState, useTransition, useMemo } from "react";
import { DanceLevel, DanceRole } from "@prisma/client";
import {
  Search,
  Award,
  Users,
  PlusCircle,
  MinusCircle,
  Clock,
  Sparkles,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import {
  adjustStudentCreditsAction,
  updateStudentProgressionAction,
} from "@/actions/management.actions";
import { StudentProgressionRow } from "@/lib/constants/management";
import { TeacherAvatar } from "@/components/ui/teacher-avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const LEVEL_ORDER: DanceLevel[] = [
  DanceLevel.BEGINNER,
  DanceLevel.IMPROVER,
  DanceLevel.INTERMEDIATE,
  DanceLevel.ADVANCED,
];

interface StudentProgressionDirectoryProps {
  initialStudents: StudentProgressionRow[];
}

export function StudentProgressionDirectory({
  initialStudents,
}: StudentProgressionDirectoryProps) {
  const [students, setStudents] = useState<StudentProgressionRow[]>(initialStudents);
  const [searchQuery, setSearchQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState<string>("ALL");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");
  const [feedbackBanner, setFeedbackBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
      const matchesSearch =
        !searchQuery.trim() ||
        fullName.includes(searchQuery.toLowerCase()) ||
        s.email.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesLevel =
        levelFilter === "ALL" || s.currentLevel === levelFilter;
      const matchesRole =
        roleFilter === "ALL" || s.preferredRole === roleFilter;

      return matchesSearch && matchesLevel && matchesRole;
    });
  }, [students, searchQuery, levelFilter, roleFilter]);

  const handleUpdateProgression = (
    studentId: string,
    newLevel: DanceLevel,
    preferredRole: DanceRole
  ) => {
    setFeedbackBanner(null);
    startTransition(async () => {
      const res = await updateStudentProgressionAction({
        studentId,
        newLevel,
        preferredRole,
      });

      if (res.success) {
        setStudents((prev) =>
          prev.map((st) =>
            st.id === studentId
              ? {
                  ...st,
                  currentLevel: res.data.currentLevel,
                  preferredRole: res.data.preferredRole,
                }
              : st
          )
        );
        setFeedbackBanner({ type: "success", text: res.message });
      } else {
        setFeedbackBanner({ type: "error", text: res.error.message });
      }
    });
  };

  const handleAdjustCredits = (
    studentId: string,
    delta: number,
    reason: string
  ) => {
    setFeedbackBanner(null);
    startTransition(async () => {
      const res = await adjustStudentCreditsAction({
        studentId,
        delta,
        reason,
      });

      if (res.success) {
        setStudents((prev) =>
          prev.map((st) =>
            st.id === studentId
              ? { ...st, classCredits: res.data.classCredits }
              : st
          )
        );
        setFeedbackBanner({ type: "success", text: res.message });
      } else {
        setFeedbackBanner({ type: "error", text: res.error.message });
      }
    });
  };

  const levelCounts = useMemo(() => {
    return {
      BEGINNER: students.filter((s) => s.currentLevel === DanceLevel.BEGINNER).length,
      IMPROVER: students.filter((s) => s.currentLevel === DanceLevel.IMPROVER).length,
      INTERMEDIATE: students.filter((s) => s.currentLevel === DanceLevel.INTERMEDIATE).length,
      ADVANCED: students.filter((s) => s.currentLevel === DanceLevel.ADVANCED).length,
    };
  }, [students]);

  return (
    <div className="space-y-6">
      {/* Level Summary Strip */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {LEVEL_ORDER.map((lvl, idx) => {
          const count = levelCounts[lvl];
          const colors = [
            "border-emerald-500/30 bg-emerald-500/5 text-emerald-700 dark:text-emerald-300",
            "border-blue-500/30 bg-blue-500/5 text-blue-700 dark:text-blue-300",
            "border-amber-500/30 bg-amber-500/5 text-amber-700 dark:text-amber-300",
            "border-purple-500/30 bg-purple-500/5 text-purple-700 dark:text-purple-300",
          ];
          return (
            <Card key={lvl} className={`border ${colors[idx]}`}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider">
                    Tier {idx + 1}: {lvl}
                  </span>
                  <Award className="h-4 w-4 opacity-80" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-extrabold">{count} dancers</div>
                <p className="text-[11px] opacity-80 mt-0.5">
                  Cuban Salsa & Rueda syllabus
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Status Toast Banner */}
      {feedbackBanner && (
        <div
          className={`flex items-center justify-between rounded-xl border px-4 py-3 text-xs font-semibold ${
            feedbackBanner.type === "success"
              ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border-destructive/40 bg-destructive/10 text-destructive"
          }`}
        >
          <span>{feedbackBanner.text}</span>
          <button
            type="button"
            onClick={() => setFeedbackBanner(null)}
            className="underline ml-4 opacity-75 hover:opacity-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex flex-col gap-3 rounded-2xl border bg-card p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            aria-label="Search dancer by name or email"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search dancer by name or email..."
            className="w-full rounded-xl border bg-background pl-9 pr-4 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Filter dancers by syllabus level"
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
            className="rounded-xl border bg-background px-3 py-2 text-xs font-semibold"
          >
            <option value="ALL">All Levels</option>
            <option value="BEGINNER">Beginner</option>
            <option value="IMPROVER">Improver</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>

          <select
            aria-label="Filter dancers by dance role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border bg-background px-3 py-2 text-xs font-semibold"
          >
            <option value="ALL">All Roles (Lead & Follow)</option>
            <option value="LEAD">Leads Only</option>
            <option value="FOLLOW">Follows Only</option>
          </select>
        </div>
      </div>

      {/* Student Progression Cards */}
      <div className="space-y-4">
        <h2 className="sr-only">Dancer Progression Directory</h2>
        {filteredStudents.length === 0 ? (
          <Card className="py-12 text-center">
            <CardContent>
              <Users className="mx-auto h-10 w-10 text-muted-foreground/40" />
              <p className="mt-3 text-sm font-semibold">
                No dancers match your current filter.
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredStudents.map((student) => {
            const currentStepIndex = LEVEL_ORDER.indexOf(student.currentLevel);

            return (
              <Card
                key={student.id}
                className="border shadow-xs transition-all hover:border-amber-500/40"
              >
                <CardContent className="p-5">
                  <div className="grid gap-6 lg:grid-cols-12 lg:items-center">
                    {/* Col 1-4: Student Identity & Role */}
                    <div className="lg:col-span-4 space-y-2">
                      <div className="flex items-center gap-3">
                        <TeacherAvatar
                          name={`${student.firstName} ${student.lastName}`}
                          avatarUrl={student.avatarUrl}
                          size="md"
                          showBadge={student.role === "INSTRUCTOR" || student.role === "ADMIN"}
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-bold truncate">
                              {student.firstName} {student.lastName}
                            </h3>
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0"
                            >
                              {student.role}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">
                            {student.email}
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                        <Badge
                          className={
                            student.preferredRole === DanceRole.LEAD
                              ? "bg-blue-700 text-white"
                              : "bg-rose-700 text-white"
                          }
                        >
                          {student.preferredRole}
                        </Badge>
                        <span className="text-muted-foreground">
                          • {student.attendedClassesCount} attended /{" "}
                          {student.totalBookingsCount} booked
                        </span>
                        {student.pendingSubmissionsCount > 0 && (
                          <Badge
                            variant="outline"
                            className="border-amber-600 text-amber-800 dark:text-amber-300 flex items-center gap-1"
                          >
                            <Clock className="h-3 w-3" />
                            {student.pendingSubmissionsCount} Video Pending
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Col 5-8: Visual 4-Tier Cuban Salsa Syllabus Progression */}
                    <div className="lg:col-span-4 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-muted-foreground">
                          Syllabus Tier:
                        </span>
                        <span className="font-extrabold text-amber-800 dark:text-amber-300 flex items-center gap-1">
                          <Sparkles className="h-3.5 w-3.5" />
                          {student.currentLevel}
                        </span>
                      </div>

                      {/* 4-Step Bar */}
                      <div className="grid grid-cols-4 gap-1.5">
                        {LEVEL_ORDER.map((lvl, idx) => {
                          const isUnlocked = idx <= currentStepIndex;
                          return (
                            <div key={lvl} className="space-y-1">
                              <div
                                className={`h-2.5 rounded-full transition-all ${
                                  isUnlocked
                                    ? "bg-gradient-to-r from-amber-500 to-orange-500"
                                    : "bg-muted"
                                }`}
                              />
                              <span
                                className={`block text-[10px] text-center font-semibold uppercase ${
                                  idx === currentStepIndex
                                    ? "text-foreground font-bold"
                                    : "text-muted-foreground"
                                }`}
                              >
                                {lvl.slice(0, 4)}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Quick Level Promotion Buttons */}
                      <div className="flex flex-wrap items-center gap-1.5 pt-1">
                        {LEVEL_ORDER.map((targetLvl) => {
                          const isCurrent = student.currentLevel === targetLvl;
                          return (
                            <button
                              key={targetLvl}
                              type="button"
                              disabled={isPending || isCurrent}
                              onClick={() =>
                                handleUpdateProgression(
                                  student.id,
                                  targetLvl,
                                  student.preferredRole
                                )
                              }
                              className={`rounded-md px-2 py-1 text-[10px] font-bold transition-all ${
                                isCurrent
                                  ? "bg-amber-500 text-zinc-950 shadow-xs cursor-default"
                                  : "border bg-background text-muted-foreground hover:border-amber-500 hover:text-foreground"
                              }`}
                            >
                              {targetLvl}
                            </button>
                          );
                        })}

                        <button
                          type="button"
                          disabled={isPending}
                          onClick={() =>
                            handleUpdateProgression(
                              student.id,
                              student.currentLevel,
                              student.preferredRole === DanceRole.LEAD
                                ? DanceRole.FOLLOW
                                : DanceRole.LEAD
                            )
                          }
                          className="ml-auto rounded-md border bg-muted/40 px-2 py-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground"
                          title="Switch Preferred Dance Role"
                        >
                          Switch to{" "}
                          {student.preferredRole === DanceRole.LEAD
                            ? "FOLLOW"
                            : "LEAD"}
                        </button>
                      </div>
                    </div>

                    {/* Col 9-12: Wallet Credits & Instant Adjustments */}
                    <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col justify-between gap-2 rounded-xl border bg-muted/30 p-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-semibold">
                          <CreditCard className="h-3.5 w-3.5 text-primary" />
                          <span>Class Credits:</span>
                        </div>
                        {student.hasActiveSubscription ? (
                          <Badge className="bg-emerald-700 text-white text-[10px]">
                            <ShieldCheck className="mr-1 h-3 w-3" />
                            Unlimited Member
                          </Badge>
                        ) : (
                          <span className="text-base font-extrabold">
                            {student.classCredits} credits
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 pt-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isPending}
                          onClick={() =>
                            handleAdjustCredits(
                              student.id,
                              1,
                              "Door Drop-In Pass (+1)"
                            )
                          }
                          className="h-7 flex-1 text-[11px] font-semibold"
                        >
                          <PlusCircle className="mr-1 h-3 w-3 text-emerald-600" />
                          +1 Pass
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={isPending}
                          onClick={() =>
                            handleAdjustCredits(
                              student.id,
                              5,
                              "5-Class Rhythm Pack (+5)"
                            )
                          }
                          className="h-7 flex-1 text-[11px] font-semibold"
                        >
                          <PlusCircle className="mr-1 h-3 w-3 text-amber-600" />
                          +5 Pack
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          aria-label={`Deduct 1 class credit from ${student.firstName} ${student.lastName}`}
                          title="Deduct 1 Class Credit (-1)"
                          disabled={isPending || student.classCredits <= 0}
                          onClick={() =>
                            handleAdjustCredits(
                              student.id,
                              -1,
                              "Manual Class Deduction (-1)"
                            )
                          }
                          className="h-7 px-2 text-[11px] font-semibold"
                        >
                          <MinusCircle className="h-3 w-3 text-rose-600" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
