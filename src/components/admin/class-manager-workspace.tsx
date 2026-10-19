"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DanceLevel } from "@prisma/client";
import {
  CalendarPlus,
  Calendar,
  MapPin,
  QrCode,
  Sparkles,
  CheckCircle2,
} from "lucide-react";
import { createClassSessionAction } from "@/actions/management.actions";
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

interface ManagedClassItem {
  id: string;
  title: string;
  description: string | null;
  minLevel: DanceLevel;
  startTimeIso: string;
  room: string;
  maxCapacity: number;
  maxLeads: number | null;
  maxFollows: number | null;
  leadsBooked: number;
  followsBooked: number;
  instructorName: string;
  instructorAvatarUrl?: string | null;
}

interface ClassManagerWorkspaceProps {
  initialClasses: ManagedClassItem[];
}

export function ClassManagerWorkspace({
  initialClasses,
}: ClassManagerWorkspaceProps) {
  const router = useRouter();
  const [title, setTitle] = useState(
    "Cuban Salsa Casino & Rueda Partnerwork"
  );
  const [description, setDescription] = useState(
    "Focused Cuban Salsa partnerwork, circular frame tension, and Rueda de Casino calls."
  );
  const [minLevel, setMinLevel] = useState<DanceLevel>(DanceLevel.BEGINNER);
  const [room, setRoom] = useState("Main Havana Studio");
  const [durationMinutes, setDurationMinutes] = useState(75);
  const [maxCapacity, setMaxCapacity] = useState(24);
  const [maxLeads, setMaxLeads] = useState(12);
  const [maxFollows, setMaxFollows] = useState(12);
  const [creditCost, setCreditCost] = useState(1);
  const [startTimeIso, setStartTimeIso] = useState(() =>
    new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
  );

  const [banner, setBanner] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleCreateClass = (e: React.FormEvent) => {
    e.preventDefault();
    setBanner(null);

    startTransition(async () => {
      const res = await createClassSessionAction({
        title,
        description,
        minLevel,
        startTimeIso,
        durationMinutes: Number(durationMinutes),
        room,
        maxCapacity: Number(maxCapacity),
        maxLeads: Number(maxLeads),
        maxFollows: Number(maxFollows),
        creditCost: Number(creditCost),
      });

      if (res.success) {
        setBanner({ type: "success", text: res.message });
        router.refresh();
      } else {
        setBanner({ type: "error", text: res.error.message });
      }
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      {/* Left Col (5 Cols): Create New Class Session Form */}
      <div className="lg:col-span-5">
        <Card className="border shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <CalendarPlus className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-lg font-bold">
                Schedule New Class Session
              </CardTitle>
            </div>
            <CardDescription className="text-xs">
              Publish a new role-balanced Cuban Salsa class to the student schedule.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateClass} className="space-y-4 text-xs">
              {banner && (
                <div
                  className={`rounded-xl border p-3 font-semibold ${
                    banner.type === "success"
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
                      : "border-destructive/40 bg-destructive/10 text-destructive"
                  }`}
                >
                  {banner.text}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-semibold">Class Title</label>
                <input
                  type="text"
                  aria-label="Class Title"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold">Syllabus Tier</label>
                  <select
                    aria-label="Syllabus Tier"
                    value={minLevel}
                    onChange={(e) => setMinLevel(e.target.value as DanceLevel)}
                    className="w-full rounded-xl border bg-background px-3 py-2 font-semibold"
                  >
                    <option value="BEGINNER">BEGINNER</option>
                    <option value="IMPROVER">IMPROVER</option>
                    <option value="INTERMEDIATE">INTERMEDIATE</option>
                    <option value="ADVANCED">ADVANCED</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold">Studio Room</label>
                  <input
                    type="text"
                    aria-label="Studio Room"
                    required
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full rounded-xl border bg-background px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5 sm:col-span-1">
                  <label className="font-semibold">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    aria-label="Start Date and Time"
                    required
                    value={startTimeIso}
                    onChange={(e) => setStartTimeIso(e.target.value)}
                    className="w-full rounded-xl border bg-background px-3 py-2"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold">Duration (Mins)</label>
                  <input
                    type="number"
                    aria-label="Duration in minutes"
                    min={30}
                    max={240}
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full rounded-xl border bg-background px-3 py-2"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold text-amber-700 dark:text-amber-400">Credits</label>
                  <input
                    type="number"
                    aria-label="Credit cost"
                    min={1}
                    max={10}
                    value={creditCost}
                    onChange={(e) => setCreditCost(Number(e.target.value))}
                    className="w-full rounded-xl border bg-background px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold">Total Cap</label>
                  <input
                    type="number"
                    aria-label="Total Capacity"
                    min={4}
                    max={200}
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(Number(e.target.value))}
                    className="w-full rounded-xl border bg-background px-3 py-2"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-blue-700 dark:text-blue-300">
                    Max Leads
                  </label>
                  <input
                    type="number"
                    aria-label="Max Leads"
                    min={2}
                    max={100}
                    value={maxLeads}
                    onChange={(e) => setMaxLeads(Number(e.target.value))}
                    className="w-full rounded-xl border bg-background px-3 py-2"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="font-semibold text-rose-700 dark:text-rose-300">
                    Max Follows
                  </label>
                  <input
                    type="number"
                    aria-label="Max Follows"
                    min={2}
                    max={100}
                    value={maxFollows}
                    onChange={(e) => setMaxFollows(Number(e.target.value))}
                    className="w-full rounded-xl border bg-background px-3 py-2"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-semibold">Class Description</label>
                <textarea
                  rows={3}
                  aria-label="Class Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2"
                />
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="w-full bg-gradient-to-r from-amber-600 to-orange-500 text-white font-bold"
              >
                <Sparkles className="mr-1.5 h-4 w-4" />
                {isPending ? "Publishing Session..." : "Publish Class to Schedule"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Right Col (7 Cols): Scheduled Classes Overview */}
      <div className="lg:col-span-7 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold">
            Active Studio Classes ({initialClasses.length})
          </h2>
          <Button variant="outline" size="sm" asChild className="text-xs">
            <Link href="/dashboard/schedule">View Student Schedule →</Link>
          </Button>
        </div>

        <div className="space-y-3">
          {initialClasses.map((cls) => {
            const formattedDate = new Intl.DateTimeFormat("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
              hour: "2-digit",
              minute: "2-digit",
            }).format(new Date(cls.startTimeIso));

            return (
              <Card key={cls.id} className="border shadow-xs">
                <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-amber-500 text-zinc-950 font-bold text-[10px]">
                        {cls.minLevel}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formattedDate}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {cls.room}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold">{cls.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                      <span className="font-semibold text-blue-700 dark:text-blue-300">
                        Leads: {cls.leadsBooked}/{cls.maxLeads ?? cls.maxCapacity}
                      </span>
                      <span className="font-semibold text-rose-700 dark:text-rose-300">
                        Follows: {cls.followsBooked}/
                        {cls.maxFollows ?? cls.maxCapacity}
                      </span>
                      <span className="flex items-center gap-1.5 font-medium text-foreground">
                        <TeacherAvatar
                          name={cls.instructorName}
                          avatarUrl={cls.instructorAvatarUrl}
                          size="xs"
                          showBadge={false}
                        />
                        <span>Maestro {cls.instructorName}</span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" asChild className="text-xs">
                      <Link href={`/checkin/${cls.id}`}>
                        <QrCode className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                        QR Check-In
                      </Link>
                    </Button>
                    <Button variant="secondary" size="sm" asChild className="text-xs">
                      <Link href="/instructor/roster">
                        <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                        Roster
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
