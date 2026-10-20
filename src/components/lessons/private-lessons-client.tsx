"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, ArrowRight, XCircle, Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TeacherAvatar } from "@/components/ui/teacher-avatar";
import {
  bookPrivateLessonAction,
  cancelPrivateLessonBookingAction,
} from "@/actions/lessons.actions";
import { PaymentSecurityTrustBar } from "@/components/pricing/payment-security-trust-bar";
import {
  COACHING_INSTRUCTORS_CATALOG,
  COACHING_FOCUS_TOPICS,
  CoachingInstructor,
} from "@/lib/constants/coaching";

export interface SerializedPrivateLessonBooking {
  id: string;
  instructorName: string;
  focusTopic: string;
  packageType: string;
  preferredSlot: string;
  totalPricePounds: number;
  status: string;
  createdAtIso: string;
}

interface PrivateLessonsClientProps {
  initialBookings?: SerializedPrivateLessonBooking[];
}

export function PrivateLessonsClient({
  initialBookings = [],
}: PrivateLessonsClientProps) {
  const instructors = Object.values(COACHING_INSTRUCTORS_CATALOG);
  const [bookings, setBookings] = useState<SerializedPrivateLessonBooking[]>(initialBookings);
  const [selectedInstructor, setSelectedInstructor] = useState<"enrique" | "moe" | "justyna" | "arturas" | "jim">("enrique");
  const [selectedPackage, setSelectedPackage] = useState<"SINGLE" | "BLOCK">("SINGLE");
  const [dancerType, setDancerType] = useState<"SOLO" | "COUPLE">("SOLO");
  const [selectedTopic, setSelectedTopic] = useState<string>(COACHING_FOCUS_TOPICS[0]);
  const [selectedDay, setSelectedDay] = useState<string>("Thursday Afternoon (BOH Studios)");
  const [notes, setNotes] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const activeInstructor: CoachingInstructor =
    COACHING_INSTRUCTORS_CATALOG[selectedInstructor] ?? COACHING_INSTRUCTORS_CATALOG.enrique;

  const price =
    selectedPackage === "SINGLE"
      ? activeInstructor.hourlyRatePounds
      : activeInstructor.blockRatePounds;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);
    try {
      const res = await bookPrivateLessonAction({
        instructorId: selectedInstructor,
        focusTopic: selectedTopic,
        packageType: selectedPackage === "SINGLE" ? "SINGLE_1HR" : "BLOCK_5HR",
        preferredSlot: selectedDay,
        dancerType,
        notes: notes || undefined,
      });

      if (res.success && res.data) {
        setIsSubmitted(true);
        setBookings((prev) => [
          {
            id: res.data!.bookingId,
            instructorName: activeInstructor.name,
            focusTopic: selectedTopic,
            packageType: selectedPackage === "SINGLE" ? "SINGLE_1HR" : "BLOCK_5HR",
            preferredSlot: `${selectedDay} (${dancerType === "COUPLE" ? "Couple" : "Solo"})`,
            totalPricePounds: res.data!.totalPricePounds,
            status: "PENDING",
            createdAtIso: new Date().toISOString(),
          },
          ...prev,
        ]);
      } else {
        const errText =
          typeof res.error === "string"
            ? res.error
            : res.error?.message ?? "Failed to book lesson.";
        setErrorMessage(errText);
      }
    } catch {
      setErrorMessage("Network error booking private lesson.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelBooking = (bookingId: string) => {
    setCancellingId(bookingId);
    startTransition(async () => {
      const res = await cancelPrivateLessonBookingAction({ bookingId });
      if (res.success) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status: "CANCELLED" } : b))
        );
      }
      setCancellingId(null);
    });
  };

  return (
    <div className="space-y-8">
      {/* Existing Student Requests Drawer / Queue */}
      {bookings.length > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-muted/20 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-600" />
              Your Private Coaching Requests ({bookings.length})
            </h3>
            <span className="text-[11px] text-muted-foreground">
              Direct with BOH Studios Reception
            </span>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2">
            {bookings.map((booking) => {
              const isPending = booking.status === "PENDING";
              const isConfirmed = booking.status === "CONFIRMED";
              const isCancelled = booking.status === "CANCELLED";

              return (
                <div
                  key={booking.id}
                  className="rounded-xl border bg-card p-3.5 flex flex-col justify-between space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-foreground">
                        {booking.instructorName}
                      </div>
                      <div className="text-[11px] text-muted-foreground">
                        {booking.packageType === "SINGLE_1HR"
                          ? "1-Hour Session"
                          : "5-Hour Intensive Package"}{" "}
                        • £{booking.totalPricePounds}
                      </div>
                    </div>
                    <Badge
                      className={
                        isConfirmed
                          ? "bg-emerald-800 text-white font-bold"
                          : isPending
                          ? "bg-amber-500 text-zinc-950 font-bold"
                          : isCancelled
                          ? "bg-zinc-600 text-white font-bold"
                          : "bg-blue-700 text-white font-bold"
                      }
                    >
                      {booking.status}
                    </Badge>
                  </div>

                  <div className="text-[11px] text-muted-foreground">
                    <div>
                      <strong className="text-foreground">Focus:</strong> {booking.focusTopic}
                    </div>
                    <div>
                      <strong className="text-foreground">Slot:</strong> {booking.preferredSlot}
                    </div>
                  </div>

                  {isPending && (
                    <div className="pt-2 border-t flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={cancellingId === booking.id}
                        onClick={() => handleCancelBooking(booking.id)}
                        className="h-7 text-[11px] text-destructive hover:bg-destructive/10"
                      >
                        <XCircle className="mr-1 h-3.5 w-3.5" />
                        {cancellingId === booking.id ? "Cancelling..." : "Cancel Request"}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isSubmitted ? (
        <Card className="border-2 border-emerald-500/40 bg-emerald-500/[0.04] p-8 text-center space-y-4 rounded-3xl">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg animate-bounce">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-black text-foreground">
            Private Lesson Request Received!
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Thank you! Maestro {activeInstructor.name} and the BOH Studios Bournemouth desk will confirm your {selectedPackage === "SINGLE" ? "1-Hour Lesson" : "5-Hour Intensive Package"} ({selectedDay}) within 24 hours.
          </p>
          <div className="rounded-2xl border bg-background/80 p-4 max-w-md mx-auto text-xs space-y-1.5 text-left">
            <div>
              <span className="font-bold text-muted-foreground">Instructor:</span>{" "}
              <span className="font-semibold text-foreground">{activeInstructor.name}</span>
            </div>
            <div>
              <span className="font-bold text-muted-foreground">Focus Area:</span>{" "}
              <span className="font-semibold text-foreground">{selectedTopic}</span>
            </div>
            <div>
              <span className="font-bold text-muted-foreground">Package Total:</span>{" "}
              <span className="font-bold text-amber-600">£{price}.00</span>
            </div>
            <div>
              <span className="font-bold text-muted-foreground">Studio Location:</span>{" "}
              <span className="font-semibold text-foreground">BOH Studios, Haviland Road West, Bournemouth</span>
            </div>
          </div>
          <Button
            type="button"
            onClick={() => setIsSubmitted(false)}
            className="bg-primary-base hover:bg-primary-hover text-white font-bold text-xs"
          >
            Submit Another Request
          </Button>
        </Card>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Choose Instructor */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-500 text-zinc-950 font-extrabold text-xs">Step 1</Badge>
              <h3 className="font-bold text-lg">Select Your Private Coach</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {instructors.map((inst) => {
                const isSelected = selectedInstructor === inst.id;
                return (
                  <div
                    key={inst.id}
                    onClick={() => setSelectedInstructor(inst.id)}
                    className={`cursor-pointer rounded-2xl border p-5 transition-all flex flex-col justify-between space-y-4 ${
                      isSelected
                        ? "border-amber-500 bg-amber-500/[0.08] shadow-md ring-2 ring-amber-500/30"
                        : "bg-card hover:border-border/80 hover:bg-muted/30"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <TeacherAvatar name={inst.name} avatarUrl={inst.avatarUrl} size="md" />
                        <div>
                          <h4 className="font-bold text-sm text-foreground">{inst.name}</h4>
                          <span className="text-[10px] text-muted-foreground block line-clamp-1">
                            {inst.title}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                        {inst.bio}
                      </p>

                      <div className="flex flex-wrap gap-1">
                        {inst.specialties.slice(0, 2).map((s) => (
                          <span
                            key={s}
                            className="rounded bg-muted px-2 py-0.5 text-[9px] font-semibold text-muted-foreground"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t flex items-center justify-between text-xs">
                      <div>
                        <span className="text-muted-foreground">From</span>{" "}
                        <span className="font-extrabold text-sm text-foreground">
                          £{inst.hourlyRatePounds}
                        </span>
                        <span className="text-[10px] text-muted-foreground">/hr</span>
                      </div>
                      <span className={`text-[11px] font-bold ${isSelected ? "text-amber-900 dark:text-amber-300" : "text-muted-foreground"}`}>
                        {isSelected ? "Selected" : "Select Coach"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Choose Package & Dancer Setup */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-500 text-zinc-950 font-extrabold text-xs">Step 2</Badge>
              <h3 className="font-bold text-lg">Package & Dancer Format</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div
                onClick={() => setSelectedPackage("SINGLE")}
                className={`cursor-pointer rounded-2xl border p-5 transition-all space-y-2 ${
                  selectedPackage === "SINGLE"
                    ? "border-amber-500 bg-amber-500/[0.08] ring-2 ring-amber-500/30"
                    : "bg-card hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm">1-Hour Intensive Session</h4>
                  <span className="text-lg font-black text-foreground">
                    £{activeInstructor.hourlyRatePounds}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Fast diagnosis and targeted corrections for specific figures, styling habits, or musical timing.
                </p>
                <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-400">
                  Ideal for quick tune-ups before a social party.
                </div>
              </div>

              <div
                onClick={() => setSelectedPackage("BLOCK")}
                className={`cursor-pointer rounded-2xl border p-5 transition-all space-y-2 ${
                  selectedPackage === "BLOCK"
                    ? "border-amber-500 bg-amber-500/[0.08] ring-2 ring-amber-500/30"
                    : "bg-card hover:bg-muted/30"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-sm">5-Hour Mastery Block</h4>
                    <Badge className="bg-emerald-800 text-white font-extrabold text-[10px] px-1.5 py-0">
                      Save £50
                    </Badge>
                  </div>
                  <span className="text-lg font-black text-foreground">
                    £{activeInstructor.blockRatePounds}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Comprehensive syllabus transformation: body isolations, dynamic leading tension, and musical interpretation.
                </p>
                <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400">
                  Recommended for rapid level advancement or wedding routines.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDancerType("SOLO")}
                className={`rounded-xl p-3 text-xs font-bold transition-all ${
                  dancerType === "SOLO"
                    ? "bg-amber-500 text-zinc-950 font-extrabold"
                    : "border bg-card text-muted-foreground"
                }`}
              >
                Solo Dancer (1-on-1 with Maestro)
              </button>
              <button
                type="button"
                onClick={() => setDancerType("COUPLE")}
                className={`rounded-xl p-3 text-xs font-bold transition-all ${
                  dancerType === "COUPLE"
                    ? "bg-amber-500 text-zinc-950 font-extrabold"
                    : "border bg-card text-muted-foreground"
                }`}
              >
                Couple (Lead & Follow)
              </button>
            </div>
          </div>

          {/* Step 3: Focus Topic & Timing */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className="bg-amber-500 text-zinc-950 font-extrabold text-xs">Step 3</Badge>
              <h3 className="font-bold text-lg">Focus Topic & Preferred Slot</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Primary Technique Focus</label>
                <select
                  aria-label="Select Focus Topic"
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  {COACHING_FOCUS_TOPICS.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">Preferred Day / Slot</label>
                <select
                  aria-label="Select Preferred Slot"
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="w-full rounded-xl border bg-background px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="Tuesday Daytime (BOH Studios)">Tuesday Daytime (11:00 AM – 3:00 PM)</option>
                  <option value="Thursday Afternoon (BOH Studios)">Thursday Afternoon (2:00 PM – 5:30 PM)</option>
                  <option value="Friday Evening Pre-Social">Friday Evening Pre-Social (6:00 PM – 7:15 PM)</option>
                  <option value="Saturday Morning Weekend Intensive">Saturday Morning (10:00 AM – 1:00 PM)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-foreground">
                Your Dance Experience & Goals (Optional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tell Maestro Enrique about your current dancing, any specific figures you want to polish, or upcoming events..."
                className="w-full rounded-xl border bg-background p-3 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* Checkout & Summary Bar */}
          <div className="rounded-3xl border border-amber-500/30 bg-muted/20 p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                Lesson Summary
              </span>
              <div className="text-lg font-black text-foreground mt-0.5">
                {activeInstructor.name} • {selectedPackage === "SINGLE" ? "1-Hour Lesson" : "5-Hour Block"}
              </div>
              <span className="text-xs text-muted-foreground">
                Studio: BOH Studios Bournemouth • {dancerType === "SOLO" ? "1 Dancer" : "Couple"}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 w-full sm:w-auto">
              {errorMessage && (
                <span className="text-xs font-semibold text-destructive">
                  {errorMessage}
                </span>
              )}
              <div className="text-left sm:text-right">
                <span className="text-2xl font-black text-foreground block">£{price}.00</span>
                <span className="text-[10px] text-muted-foreground">No upfront payment required</span>
              </div>
              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full sm:w-auto bg-primary-base hover:bg-primary-hover text-white font-bold text-sm px-7 min-h-12 flex items-center justify-center shadow-md shadow-primary-base/20"
              >
                {isSubmitting ? "Submitting..." : "Request Coaching Slot"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="pt-2">
            <PaymentSecurityTrustBar showRefundPolicy={false} />
          </div>
        </form>
      )}
    </div>
  );
}
