"use client";

import { useState, useTransition, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { CheckCircle2, ArrowRight, XCircle, Clock } from "lucide-react";
import { TeacherAvatar } from "@/components/ui/teacher-avatar";
import {
  bookPrivateLessonAction,
  cancelPrivateLessonBookingAction,
} from "@/actions/lessons.actions";
import { getMyPrivateLessonBookingsAction } from "@/actions/viewer.actions";
import { PaymentSecurityTrustBar } from "@/components/pricing/payment-security-trust-bar";
import {
  COACHING_INSTRUCTORS_CATALOG,
  COACHING_FOCUS_TOPICS,
  DEFAULT_COACHING_TOPIC,
  CoachingInstructor,
} from "@/lib/constants/coaching";
import { TYPE, POSTER_BUTTON, POSTER_BUTTON_COLORS } from "@/components/poster/poster-kit";

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
  const [selectedTopic, setSelectedTopic] = useState<string>(DEFAULT_COACHING_TOPIC);
  const [selectedDay, setSelectedDay] = useState<string>("Thursday Afternoon (BOH Studios)");
  const [notes, setNotes] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  const { isLoaded, isSignedIn } = useUser();

  useEffect(() => {
    if (isLoaded && isSignedIn && initialBookings.length === 0) {
      getMyPrivateLessonBookingsAction().then((loaded) => {
        if (loaded && loaded.length > 0) {
          setBookings(loaded);
        }
      });
    }
  }, [isLoaded, isSignedIn, initialBookings.length]);

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
        <div className="border-4 border-ink bg-paper p-5 space-y-3 shadow-[4px_4px_0_0_var(--color-ink)] text-ink">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b-2 border-ink pb-2">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Clock className="h-4 w-4 text-accent-red" />
              Your Private Coaching Requests ({bookings.length})
            </h3>
            <span className="text-xs text-ink/70 font-semibold">
              Direct with BOH Studios Reception
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {bookings.map((booking) => {
              const isPending = booking.status === "PENDING";
              const isConfirmed = booking.status === "CONFIRMED";
              const isCancelled = booking.status === "CANCELLED";

              return (
                <div
                  key={booking.id}
                  className="border-2 border-ink bg-paper p-3.5 flex flex-col justify-between space-y-2 text-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-ink">
                        {booking.instructorName}
                      </div>
                      <div className="text-xs text-ink/75 font-semibold">
                        {booking.packageType === "SINGLE_1HR"
                          ? "1-Hour Session"
                          : "5-Hour Intensive Package"}{" "}
                        • £{booking.totalPricePounds}
                      </div>
                    </div>
                    <span
                      className={`border border-ink font-bold text-xs uppercase px-2 py-0.5 ${
                        isConfirmed
                          ? "bg-poster-teal text-ink"
                          : isPending
                          ? "bg-poster-mustard text-ink"
                          : isCancelled
                          ? "bg-ink text-paper"
                          : "bg-poster-blue text-paper"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </div>

                  <div className="text-xs text-ink font-medium">
                    <div>
                      <strong className="text-ink">Focus:</strong> {booking.focusTopic}
                    </div>
                    <div>
                      <strong className="text-ink">Slot:</strong> {booking.preferredSlot}
                    </div>
                  </div>

                  {isPending && (
                    <div className="pt-2 border-t border-ink flex justify-end">
                      <button
                        type="button"
                        disabled={cancellingId === booking.id}
                        onClick={() => handleCancelBooking(booking.id)}
                        className="text-xs text-accent-red font-bold hover:underline flex items-center gap-1"
                      >
                        <XCircle className="h-3.5 w-3.5" />
                        {cancellingId === booking.id ? "Cancelling..." : "Cancel Request"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {isSubmitted ? (
        <div className="border-4 border-ink bg-poster-teal/20 p-8 text-center space-y-4 shadow-[8px_8px_0_0_var(--color-ink)] text-ink">
          <div className="mx-auto flex h-16 w-16 items-center justify-center border-4 border-ink bg-poster-teal text-ink shadow-[4px_4px_0_0_var(--color-ink)]">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="font-display font-black text-2xl uppercase tracking-tight text-ink">
            Private Lesson Request Received!
          </h2>
          <p className="text-xs sm:text-sm text-ink max-w-lg mx-auto leading-relaxed font-semibold">
            Thank you! Maestro {activeInstructor.name} and the BOH Studios Bournemouth desk will confirm your {selectedPackage === "SINGLE" ? "1-Hour Lesson" : "5-Hour Intensive Package"} ({selectedDay}) within 24 hours.
          </p>
          <div className="border-2 border-ink bg-paper p-4 max-w-md mx-auto text-xs space-y-1.5 text-left text-ink shadow-[2px_2px_0_0_var(--color-ink)]">
            <div>
              <span className="font-bold text-ink/70">Instructor:</span>{" "}
              <span className="font-bold text-ink">{activeInstructor.name}</span>
            </div>
            <div>
              <span className="font-bold text-ink/70">Focus Area:</span>{" "}
              <span className="font-bold text-ink">{selectedTopic}</span>
            </div>
            <div>
              <span className="font-bold text-ink/70">Package Total:</span>{" "}
              <span className="font-bold text-accent-red">£{price}.00</span>
            </div>
            <div>
              <span className="font-bold text-ink/70">Studio Location:</span>{" "}
              <span className="font-semibold text-ink">BOH Studios, 104 Commercial Road, Bournemouth (BH2 5LR)</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsSubmitted(false)}
            className={`${POSTER_BUTTON} ${POSTER_BUTTON_COLORS.ink} text-xs font-bold px-6 py-2.5 min-h-[40px]`}
          >
            Submit Another Request
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Step 1: Choose Instructor */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b-2 border-ink pb-2">
              <span className="border border-ink bg-poster-mustard text-ink font-bold text-xs uppercase px-2 py-0.5">Step 1</span>
              <h3 className="font-display font-black text-xl uppercase tracking-tight text-ink">Select Your Private Coach</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {instructors.map((inst) => {
                const isSelected = selectedInstructor === inst.id;
                return (
                  <div
                    key={inst.id}
                    onClick={() => setSelectedInstructor(inst.id)}
                    className={`cursor-pointer border-4 border-ink p-5 transition-all flex flex-col justify-between space-y-4 shadow-[4px_4px_0_0_var(--color-ink)] ${
                      isSelected
                        ? "bg-poster-mustard/30 ring-2 ring-poster-red"
                        : "bg-paper hover:bg-black/5"
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <TeacherAvatar name={inst.name} avatarUrl={inst.avatarUrl} size="md" className="border-2 border-ink" />
                        <div>
                          <h4 className="font-display font-black text-base uppercase text-ink">{inst.name}</h4>
                          <span className="text-xs text-ink/75 font-semibold block line-clamp-1">
                            {inst.title}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-ink leading-relaxed font-medium line-clamp-3">
                        {inst.bio}
                      </p>

                      <div className="flex flex-wrap gap-1">
                        {inst.specialties.slice(0, 2).map((s) => (
                          <span
                            key={s}
                            className="border border-ink bg-paper px-2 py-0.5 text-xs font-bold text-ink"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-3 border-t-2 border-ink flex items-center justify-between text-xs">
                      <div>
                        <span className="text-ink/70">From</span>{" "}
                        <span className="font-display font-black text-lg text-ink">
                          £{inst.hourlyRatePounds}
                        </span>
                        <span className="text-xs text-ink/70">/hr</span>
                      </div>
                      <span className={`text-xs font-bold ${isSelected ? "text-accent-red uppercase" : "text-ink/70"}`}>
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
            <div className="flex items-center gap-2 border-b-2 border-ink pb-2">
              <span className="border border-ink bg-poster-mustard text-ink font-bold text-xs uppercase px-2 py-0.5">Step 2</span>
              <h3 className="font-display font-black text-xl uppercase tracking-tight text-ink">Package &amp; Format</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div
                onClick={() => setSelectedPackage("SINGLE")}
                className={`cursor-pointer border-4 border-ink p-5 transition-all space-y-2 shadow-[4px_4px_0_0_var(--color-ink)] ${
                  selectedPackage === "SINGLE"
                    ? "bg-poster-mustard/30 ring-2 ring-poster-red"
                    : "bg-paper hover:bg-black/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h4 className="font-display font-black text-base uppercase text-ink">1-Hour Intensive Session</h4>
                  <span className={`font-display font-black text-2xl text-ink ${TYPE.card}`}>
                    £{activeInstructor.hourlyRatePounds}
                  </span>
                </div>
                <p className="text-xs text-ink leading-relaxed font-medium">
                  Fast diagnosis and targeted corrections for specific figures, styling habits, or musical timing.
                </p>
                <div className="text-xs font-bold text-accent-red">
                  Ideal for quick tune-ups before a social party.
                </div>
              </div>

              <div
                onClick={() => setSelectedPackage("BLOCK")}
                className={`cursor-pointer border-4 border-ink p-5 transition-all space-y-2 shadow-[4px_4px_0_0_var(--color-ink)] ${
                  selectedPackage === "BLOCK"
                    ? "bg-poster-mustard/30 ring-2 ring-poster-red"
                    : "bg-paper hover:bg-black/5"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-display font-black text-base uppercase text-ink">5-Hour Mastery Block</h4>
                    <span className="border border-ink bg-poster-teal text-ink font-bold text-xs px-1.5 py-0">
                      Save £50
                    </span>
                  </div>
                  <span className={`font-display font-black text-2xl text-ink ${TYPE.card}`}>
                    £{activeInstructor.blockRatePounds}
                  </span>
                </div>
                <p className="text-xs text-ink leading-relaxed font-medium">
                  Comprehensive syllabus transformation: body isolations, dynamic leading tension, and musical interpretation.
                </p>
                <div className="text-xs font-bold text-accent-teal">
                  Recommended for rapid level advancement or wedding routines.
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDancerType("SOLO")}
                className={`${POSTER_BUTTON} ${
                  dancerType === "SOLO"
                    ? POSTER_BUTTON_COLORS.ink
                    : `${POSTER_BUTTON_COLORS.outline} bg-paper`
                } text-xs font-bold min-h-[44px] flex items-center justify-center`}
              >
                Solo Dancer (1-on-1 with Maestro)
              </button>
              <button
                type="button"
                onClick={() => setDancerType("COUPLE")}
                className={`${POSTER_BUTTON} ${
                  dancerType === "COUPLE"
                    ? POSTER_BUTTON_COLORS.ink
                    : `${POSTER_BUTTON_COLORS.outline} bg-paper`
                } text-xs font-bold min-h-[44px] flex items-center justify-center`}
              >
                Couple (Lead &amp; Follow)
              </button>
            </div>
          </div>

          {/* Step 3: Focus Topic & Timing */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 border-b-2 border-ink pb-2">
              <span className="border border-ink bg-poster-mustard text-ink font-bold text-xs uppercase px-2 py-0.5">Step 3</span>
              <h3 className="font-display font-black text-xl uppercase tracking-tight text-ink">Focus Topic &amp; Preferred Slot</h3>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink uppercase tracking-wider block">Primary Technique Focus</label>
                <select
                  aria-label="Select Focus Topic"
                  value={selectedTopic}
                  onChange={(e) => setSelectedTopic(e.target.value)}
                  className="w-full border-2 border-ink bg-paper px-3 py-2 text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-poster-red"
                >
                  {COACHING_FOCUS_TOPICS.map((topic) => (
                    <option key={topic} value={topic}>
                      {topic}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-ink uppercase tracking-wider block">Preferred Day / Slot</label>
                <select
                  aria-label="Select Preferred Slot"
                  value={selectedDay}
                  onChange={(e) => setSelectedDay(e.target.value)}
                  className="w-full border-2 border-ink bg-paper px-3 py-2 text-xs font-bold text-ink focus:outline-none focus:ring-2 focus:ring-poster-red"
                >
                  <option value="Sunday Afternoon (BOH Studios)">Sunday Afternoon (14:00 – 17:30)</option>
                  <option value="Thursday Afternoon (BOH Studios)">Thursday Afternoon (14:00 – 17:30)</option>
                  <option value="Thursday Evening Pre-Social">Thursday Evening Pre-Social (18:00 – 19:00)</option>
                  <option value="Saturday Morning Weekend Intensive">Saturday Morning (10:00 – 13:00)</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5 pt-2">
              <label className="text-xs font-bold text-ink uppercase tracking-wider block">
                Your Dance Experience &amp; Goals (Optional)
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Tell Maestro Enrique about your current dancing, any specific figures you want to polish, or upcoming events..."
                className="w-full border-2 border-ink bg-paper p-3 text-xs font-medium text-ink focus:outline-none focus:ring-2 focus:ring-poster-red"
              />
            </div>
          </div>

          {/* Checkout & Summary Bar */}
          <div className="border-4 border-ink bg-poster-mustard p-6 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-[6px_6px_0_0_var(--color-ink)] text-ink">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-ink/75 block">
                Lesson Summary
              </span>
              <div className="font-display font-black text-xl uppercase tracking-tight text-ink mt-0.5">
                {activeInstructor.name} • {selectedPackage === "SINGLE" ? "1-Hour Lesson" : "5-Hour Block"}
              </div>
              <span className="text-xs text-ink font-medium">
                Studio: BOH Studios Bournemouth • {dancerType === "SOLO" ? "1 Dancer" : "Couple"}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 w-full sm:w-auto">
              {errorMessage && (
                <span className="text-xs font-bold text-accent-red">
                  {errorMessage}
                </span>
              )}
              <div className="text-left sm:text-right">
                <span className={`font-display font-black ${TYPE.number} text-ink block`}>£{price}.00</span>
                <span className="text-xs text-ink font-semibold">No upfront payment required</span>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`${POSTER_BUTTON} border-poster-red bg-poster-red text-ink hover:bg-ink hover:text-ink font-display text-sm font-black uppercase tracking-wider px-7 min-h-[48px] shadow-[4px_4px_0_0_var(--color-ink)] flex items-center justify-center`}
              >
                {isSubmitting ? "Submitting..." : "Request Coaching Slot"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
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
