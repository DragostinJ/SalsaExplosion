import {
  Flame,
  Zap,
  Users,
  Award,
  Lock,
  CheckCircle2,
  Sparkles,
} from "lucide-react";
import { DanceLevel } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AttendanceMilestonesCardProps {
  attendedCount: number;
  streakWeeks: number;
  currentLevel: DanceLevel;
  hasCongressPass: boolean;
}

interface MilestoneBadge {
  id: string;
  title: string;
  description: string;
  icon: typeof Flame;
  isUnlocked: boolean;
  progressText: string;
  progressPercent: number;
  colorScheme: {
    unlockedBg: string;
    unlockedBorder: string;
    iconColor: string;
    badgeColor: string;
  };
}

export function AttendanceMilestonesCard({
  attendedCount,
  streakWeeks,
  currentLevel,
  hasCongressPass,
}: AttendanceMilestonesCardProps) {
  const isImproverOrAbove =
    currentLevel === DanceLevel.IMPROVER ||
    currentLevel === DanceLevel.INTERMEDIATE ||
    currentLevel === DanceLevel.ADVANCED;

  const milestones: MilestoneBadge[] = [
    {
      id: "clave-starter",
      title: "Clave Starter",
      description: "Step onto the BOH Studios dance floor and complete your first Cuban Salsa class.",
      icon: Flame,
      isUnlocked: attendedCount >= 1,
      progressText: attendedCount >= 1 ? "Completed 1st Class" : "0 / 1 Class Attended",
      progressPercent: attendedCount >= 1 ? 100 : 0,
      colorScheme: {
        unlockedBg: "bg-amber-500/10",
        unlockedBorder: "border-amber-500/40",
        iconColor: "text-amber-400",
        badgeColor: "bg-amber-500 text-stone-950",
      },
    },
    {
      id: "consistent-casinero",
      title: "Consistent Casinero",
      description: "Build dance floor muscle memory with a 4-week active attendance streak.",
      icon: Zap,
      isUnlocked: streakWeeks >= 4,
      progressText: `${Math.min(streakWeeks, 4)} / 4 Weeks Streak`,
      progressPercent: Math.min(100, Math.round((streakWeeks / 4) * 100)),
      colorScheme: {
        unlockedBg: "bg-gold/10",
        unlockedBorder: "border-gold/40",
        iconColor: "text-gold",
        badgeColor: "bg-gold text-stone-950",
      },
    },
    {
      id: "rueda-ready",
      title: "Rueda Ready",
      description: "Advance from Beginner to Improver syllabus and master fundamental Casino partner figures.",
      icon: Users,
      isUnlocked: isImproverOrAbove,
      progressText: isImproverOrAbove ? "Improver Syllabus Unlocked" : "Requires Improver Level",
      progressPercent: isImproverOrAbove ? 100 : 35,
      colorScheme: {
        unlockedBg: "bg-success-soft",
        unlockedBorder: "border-success-line",
        iconColor: "text-success",
        badgeColor: "bg-success text-white",
      },
    },
    {
      id: "congress-veteran",
      title: "Congress Veteran",
      description: "Register for the Bournemouth Summer Cuban Salsa Congress or a visiting maestro intensive.",
      icon: Award,
      isUnlocked: hasCongressPass,
      progressText: hasCongressPass ? "Congress Pass Verified" : "0 / 1 Festival Pass",
      progressPercent: hasCongressPass ? 100 : 0,
      colorScheme: {
        unlockedBg: "bg-surface-3",
        unlockedBorder: "border-gold/30",
        iconColor: "text-gold",
        badgeColor: "bg-surface-2 text-ivory border border-gold/30",
      },
    },
  ];

  const unlockedCount = milestones.filter((m) => m.isUnlocked).length;
  const overallCompletion = Math.round((unlockedCount / milestones.length) * 100);

  return (
    <Card className="border shadow-xs overflow-hidden">
      <CardHeader className="pb-4 bg-muted/20 border-b">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-amber-500" />
                Dancer Attendance Milestones & Streaks
              </CardTitle>
              <Badge className="bg-amber-600 text-white font-bold text-xs">
                {unlockedCount} / {milestones.length} Unlocked
              </Badge>
            </div>
            <CardDescription className="text-xs mt-1">
              Earn official Salsa Explosion badges as you practice your Cuban Casino figures at BOH Studios.
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">Milestone Progress:</span>
            <div className="h-2 w-28 bg-muted rounded-full overflow-hidden border">
              <div
                className="h-full bg-gold transition-all duration-500 rounded-full"
                style={{ width: `${overallCompletion}%` }}
              />
            </div>
            <span className="text-xs font-mono font-bold text-foreground">
              {overallCompletion}%
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-3.5 sm:p-6">
        <div className="grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
          {milestones.map((m) => {
            const Icon = m.icon;
            return (
              <div
                key={m.id}
                className={`rounded-2xl border p-4 flex flex-col justify-between space-y-3 transition-all ${
                  m.isUnlocked
                    ? `${m.colorScheme.unlockedBg} ${m.colorScheme.unlockedBorder} shadow-xs`
                    : "bg-muted/10 border-dashed border-border opacity-70"
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-xl shadow-xs ${
                        m.isUnlocked
                          ? `${m.colorScheme.unlockedBg} border ${m.colorScheme.unlockedBorder}`
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          m.isUnlocked ? m.colorScheme.iconColor : "text-muted-foreground"
                        }`}
                      />
                    </div>
                    {m.isUnlocked ? (
                      <Badge className={`text-[10px] font-bold ${m.colorScheme.badgeColor}`}>
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Unlocked
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-muted-foreground">
                        <Lock className="mr-1 h-3 w-3" />
                        Locked
                      </Badge>
                    )}
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-foreground">
                      {m.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                      {m.description}
                    </p>
                  </div>
                </div>

                {/* Micro Progress Bar */}
                <div className="space-y-1.5 pt-2 border-t border-border/40">
                  <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground">
                    <span>{m.progressText}</span>
                    <span>{m.progressPercent}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        m.isUnlocked
                          ? "bg-gold"
                          : "bg-muted-foreground/30"
                      }`}
                      style={{ width: `${m.progressPercent}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
