"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DanceLevel } from "@prisma/client";
import {
  Calendar,
  MapPin,
  QrCode,
  Sparkles,
  CheckCircle2,
  Settings2,
  Ban,
  X,
  Save,
  Loader2,
} from "lucide-react";
import {
  createClassSessionAction,
  cancelClassSessionWithRefundsAction,
  updateClassSessionCapacityAction,
} from "@/actions/management.actions";
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
import { toast } from "sonner";

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

  // Edit capacity state
  const [editingClassId, setEditingClassId] = useState<string | null>(null);
  const [editRoom, setEditRoom] = useState("");
  const [editMaxCapacity, setEditMaxCapacity] = useState(24);
  const [editMaxLeads, setEditMaxLeads] = useState(12);
  const [editMaxFollows, setEditMaxFollows] = useState(12);

  // Cancellation state
  const [cancellingClassId, setCancellingClassId] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState("Instructor unwell / emergency coverage");

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

  const handleStartEdit = (cls: ManagedClassItem) => {
    setEditingClassId(cls.id);
    setEditRoom(cls.room);
    setEditMaxCapacity(cls.maxCapacity);
    setEditMaxLeads(cls.maxLeads ?? Math.floor(cls.maxCapacity / 2));
    setEditMaxFollows(cls.maxFollows ?? Math.floor(cls.maxCapacity / 2));
    setCancellingClassId(null);
  };

  const handleSaveEdit = (classSessionId: string) => {
    startTransition(async () => {
      const res = await updateClassSessionCapacityAction({
        classSessionId,
        room: editRoom,
        maxCapacity: Number(editMaxCapacity),
        maxLeads: Number(editMaxLeads),
        maxFollows: Number(editMaxFollows),
      });

      if (res.success) {
        toast.success(res.message);
        setEditingClassId(null);
        router.refresh();
      } else {
        toast.error(res.error?.message ?? "Failed to update room & capacity.");
      }
    });
  };

  const handleCancelClass = (classSessionId: string) => {
    if (!cancelReason.trim()) {
      toast.error("Please specify a cancellation reason.");
      return;
    }

    startTransition(async () => {
      const res = await cancelClassSessionWithRefundsAction({
        classSessionId,
        reason: cancelReason.trim(),
      });

      if (res.success) {
        toast.success(res.message);
        setCancellingClassId(null);
        router.refresh();
      } else {
        toast.error(res.error?.message ?? "Failed to cancel class session.");
      }
    });
  };

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      {/* Left Col (5 Cols): Class Session Creator Form */}
      <div className="lg:col-span-5 space-y-6">
        <Card className="border shadow-xs">
          <CardHeader>
            <CardTitle className="text-lg">Publish New Class</CardTitle>
            <CardDescription className="text-xs">
              Add a single session or set up the weekly schedule block.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {banner && (
              <div
                className={`mb-4 rounded-xl p-3 text-xs font-semibold ${
                  banner.type === "success"
                    ? "bg-emerald-500/10 text-emerald-300"
                    : "bg-rose-500/10 text-rose-300"
                }`}
              >
                {banner.text}
              </div>
            )}

            <form onSubmit={handleCreateClass} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-semibold">Class Title</label>
                <input
                  type="text"
                  required
                  aria-label="Class Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold">Minimum Level</label>
                  <select
                    value={minLevel}
                    aria-label="Minimum Level"
                    onChange={(e) => setMinLevel(e.target.value as DanceLevel)}
                    className="w-full rounded-xl border bg-background px-3 py-2"
                  >
                    <option value={DanceLevel.BEGINNER}>Beginner (L1)</option>
                    <option value={DanceLevel.IMPROVER}>Improver (L2)</option>
                    <option value={DanceLevel.INTERMEDIATE}>Intermediate (L3)</option>
                    <option value={DanceLevel.ADVANCED}>Advanced (L4)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold">Studio Room / Venue</label>
                  <input
                    type="text"
                    required
                    aria-label="Studio Room / Venue"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    className="w-full rounded-xl border bg-background px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold">Start Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    aria-label="Start Date & Time"
                    value={startTimeIso}
                    onChange={(e) => setStartTimeIso(e.target.value)}
                    className="w-full rounded-xl border bg-background px-3 py-2"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="font-semibold">Duration (Mins)</label>
                  <input
                    type="number"
                    min={30}
                    max={180}
                    step={15}
                    required
                    aria-label="Duration (Mins)"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full rounded-xl border bg-background px-3 py-2"
                  />
                </div>
              </div>

              <div className="rounded-xl border bg-muted/30 p-3 space-y-3">
                <span className="font-bold text-foreground block">
                  Capacity & Lead/Follow Role Caps
                </span>

                <div className="grid grid-cols-3 gap-2">
                  <div className="space-y-1">
                    <label className="text-[11px] text-muted-foreground">Hard Cap</label>
                    <input
                      type="number"
                      min={4}
                      max={100}
                      aria-label="Hard Cap"
                      value={maxCapacity}
                      onChange={(e) => setMaxCapacity(Number(e.target.value))}
                      className="w-full rounded-lg border bg-background px-2 py-1.5"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-muted-foreground">Max Leads</label>
                    <input
                      type="number"
                      min={2}
                      max={50}
                      aria-label="Max Leads"
                      value={maxLeads}
                      onChange={(e) => setMaxLeads(Number(e.target.value))}
                      className="w-full rounded-lg border bg-background px-2 py-1.5"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-muted-foreground">Max Follows</label>
                    <input
                      type="number"
                      min={2}
                      max={50}
                      aria-label="Max Follows"
                      value={maxFollows}
                      onChange={(e) => setMaxFollows(Number(e.target.value))}
                      className="w-full rounded-lg border bg-background px-2 py-1.5"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="font-semibold">Credit Cost</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    required
                    aria-label="Credit Cost"
                    value={creditCost}
                    onChange={(e) => setCreditCost(Number(e.target.value))}
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

            const isEditing = editingClassId === cls.id;
            const isCancelling = cancellingClassId === cls.id;

            return (
              <Card key={cls.id} className="border shadow-xs overflow-hidden">
                <CardContent className="p-4 flex flex-col gap-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className="bg-amber-500 text-stone-950 font-bold text-[10px]">
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
                        <span className="font-semibold text-blue-300">
                          Leads: {cls.leadsBooked}/{cls.maxLeads ?? cls.maxCapacity}
                        </span>
                        <span className="font-semibold text-rose-300">
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

                    <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                      <Button variant="outline" size="sm" asChild className="text-xs h-8">
                        <Link href={`/checkin/${cls.id}`}>
                          <QrCode className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                          Door QR
                        </Link>
                      </Button>
                      <Button variant="secondary" size="sm" asChild className="text-xs h-8">
                        <Link href="/instructor/roster">
                          <CheckCircle2 className="mr-1.5 h-3.5 w-3.5 text-emerald-500" />
                          Roster
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => (isEditing ? setEditingClassId(null) : handleStartEdit(cls))}
                        className="text-xs h-8 px-2 text-muted-foreground hover:text-foreground"
                        title="Edit Room & Capacity"
                      >
                        <Settings2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setCancellingClassId(isCancelling ? null : cls.id);
                          setEditingClassId(null);
                        }}
                        className="text-xs h-8 px-2 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10"
                        title="Cancel Class & Refund Students"
                      >
                        <Ban className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>

                  {/* Inline Room & Capacity Editor */}
                  {isEditing && (
                    <div className="rounded-xl border bg-muted/40 p-3 space-y-3 mt-1 text-xs animate-in fade-in duration-150">
                      <div className="flex items-center justify-between pb-1 border-b">
                        <span className="font-bold text-foreground flex items-center gap-1.5">
                          <Settings2 className="h-3.5 w-3.5 text-accent-tangerine" />
                          Adjust Studio Room & Capacity Limits
                        </span>
                        <button
                          type="button"
                          onClick={() => setEditingClassId(null)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        <div className="space-y-1">
                          <label className="text-[11px] text-muted-foreground font-semibold">
                            Studio Room
                          </label>
                          <input
                            type="text"
                            value={editRoom}
                            onChange={(e) => setEditRoom(e.target.value)}
                            className="w-full rounded-lg border bg-background px-2.5 py-1.5 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-muted-foreground font-semibold">
                            Total Capacity
                          </label>
                          <input
                            type="number"
                            min={4}
                            max={100}
                            value={editMaxCapacity}
                            onChange={(e) => setEditMaxCapacity(Number(e.target.value))}
                            className="w-full rounded-lg border bg-background px-2.5 py-1.5 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-muted-foreground font-semibold">
                            Max Leads
                          </label>
                          <input
                            type="number"
                            min={2}
                            max={50}
                            value={editMaxLeads}
                            onChange={(e) => setEditMaxLeads(Number(e.target.value))}
                            className="w-full rounded-lg border bg-background px-2.5 py-1.5 text-xs"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] text-muted-foreground font-semibold">
                            Max Follows
                          </label>
                          <input
                            type="number"
                            min={2}
                            max={50}
                            value={editMaxFollows}
                            onChange={(e) => setEditMaxFollows(Number(e.target.value))}
                            className="w-full rounded-lg border bg-background px-2.5 py-1.5 text-xs"
                          />
                        </div>
                      </div>

                      <div className="flex justify-end gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingClassId(null)}
                          className="text-xs h-7"
                        >
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleSaveEdit(cls.id)}
                          className="bg-brand hover:bg-brand-hover text-white font-bold text-xs h-7"
                        >
                          {isPending ? (
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          ) : (
                            <Save className="mr-1 h-3 w-3" />
                          )}
                          Save Adjustments
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Inline Class Cancellation & Refund Prompt */}
                  {isCancelling && (
                    <div className="rounded-xl border border-rose-500/30 bg-rose-500/[0.06] p-3.5 space-y-2 mt-1 text-xs animate-in fade-in duration-150">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-rose-400 flex items-center gap-1.5">
                          <Ban className="h-4 w-4" />
                          Cancel Class & Automatically Refund {cls.leadsBooked + cls.followsBooked} Student(s)
                        </span>
                        <button
                          type="button"
                          onClick={() => setCancellingClassId(null)}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <p className="text-[11px] text-muted-foreground">
                        This will transition all confirmed bookings to CANCELLED, credit back each student&apos;s class credits via a credit ledger refund, and record an audit trail event.
                      </p>
                      <div className="space-y-1 pt-1">
                        <label className="text-[11px] font-semibold text-foreground">
                          Reason for Cancellation (sent in student notification):
                        </label>
                        <input
                          type="text"
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          placeholder="e.g. Instructor emergency, venue unavailable..."
                          className="w-full rounded-lg border bg-background px-3 py-1.5 text-xs"
                        />
                      </div>
                      <div className="flex justify-end gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setCancellingClassId(null)}
                          className="text-xs h-7"
                        >
                          Abort
                        </Button>
                        <Button
                          size="sm"
                          disabled={isPending}
                          onClick={() => handleCancelClass(cls.id)}
                          className="bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs h-7"
                        >
                          {isPending ? (
                            <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                          ) : (
                            <Ban className="mr-1 h-3 w-3" />
                          )}
                          Confirm Cancellation & Refund Credits
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
}
