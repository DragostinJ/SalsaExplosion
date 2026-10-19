"use client";

import { useState } from "react";
import { CheckCircle2, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { TeacherAvatar } from "@/components/ui/teacher-avatar";
import { bookPrivateLessonAction } from "@/actions/lessons.actions";

interface InstructorProfile {
  id: string;
  name: string;
  title: string;
  hourlyRatePounds: number;
  blockRatePounds: number; // 5-hour package
  specialties: string[];
  avatarUrl?: string;
  bio: string;
}

const INSTRUCTORS: InstructorProfile[] = [
  {
    id: "enrique",
    name: "Enrique Perez Valdes",
    title: "Founder & Director • Lifetime Achievement Recipient",
    hourlyRatePounds: 65,
    blockRatePounds: 275,
    specialties: [
      "Cuban Body Isolation & Despelote",
      "Cantante Master Training",
      "Authentic Cuban Son & Chachacha",
      "Lead/Follow Tension Mechanics",
    ],
    bio: "Pioneered Cuban Salsa & Rueda in the UK for over 25 years. Tailored coaching for competitive dancers, social perfectionists, and wedding routines at BOH Studios.",
  },
  {
    id: "yaniel",
    name: "Yaniel Castillo",
    title: "Guest Artist & Afro-Cuban Master",
    hourlyRatePounds: 60,
    blockRatePounds: 250,
    specialties: [
      "Afro-Cuban Rumba (Yambu & Guaguanco)",
      "Orisha Body Isolations",
      "Footwork Speed & Musicality",
    ],
    bio: "Internationally renowned Cuban artist bringing sacred Afro-Cuban movement and high-energy Timba body isolation to your dancing.",
  },
  {
    id: "elena",
    name: "Elena Reyes",
    title: "Senior Academy Instructor",
    hourlyRatePounds: 50,
    blockRatePounds: 220,
    specialties: [
      "Follower Arm Styling & Spin Technique",
      "Guapea Frame Sensitivity",
      "Beginner-to-Social Confidence",
    ],
    bio: "Specializes in developing graceful styling, fluid armwork, and rapid confidence for beginners stepping onto the Bournemouth social floor.",
  },
];

const FOCUS_TOPICS = [
  "Cuban Motion, Ribcage & Afro-Isolation",
  "Lead/Follow Elastic Tension & Frame Connection",
  "Rueda de Casino Cantante (Calling) Mastery",
  "Footwork Timing on the 1 vs Son on the 2",
  "Wedding First Dance (Cuban Romance Routine)",
  "Bournemouth Congress Intensive Preparation",
];

export function PrivateLessonsClient() {
  const [selectedInstructor, setSelectedInstructor] = useState<string>("enrique");
  const [selectedPackage, setSelectedPackage] = useState<"SINGLE" | "BLOCK">("SINGLE");
  const [dancerType, setDancerType] = useState<"SOLO" | "COUPLE">("SOLO");
  const [selectedTopic, setSelectedTopic] = useState<string>(FOCUS_TOPICS[0]);
  const [selectedDay, setSelectedDay] = useState<string>("Thursday Evening");
  const [notes, setNotes] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeInstructor =
    INSTRUCTORS.find((i) => i.id === selectedInstructor) ?? INSTRUCTORS[0];

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
        instructorName: activeInstructor.name,
        focusTopic: selectedTopic,
        packageType: selectedPackage === "SINGLE" ? "SINGLE_1HR" : "BLOCK_5HR",
        preferredSlot: selectedDay,
        totalPricePounds: price,
      });

      if (res.success) {
        setIsSubmitted(true);
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

  return (
    <div className="space-y-8">
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
              <Badge className="bg-amber-600 text-white font-bold text-xs">Step 1</Badge>
              <h3 className="font-bold text-lg">Select Your Private Coach</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {INSTRUCTORS.map((inst) => {
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
                      <span className={`text-[11px] font-bold ${isSelected ? "text-amber-600" : "text-muted-foreground"}`}>
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
              <Badge className="bg-amber-600 text-white font-bold text-xs">Step 2</Badge>
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
                  Targeted 60-minute deep dive on a specific figure, footwork issue, or musicality timing hurdle.
                </p>
              </div>

              <div
                onClick={() => setSelectedPackage("BLOCK")}
                className={`cursor-pointer rounded-2xl border p-5 transition-all space-y-2 ${
                  selectedPackage === "BLOCK"
                    ? "border-amber-500 bg-amber-500/[0.08] ring-2 ring-amber-500/30"
                    : "bg-card hover:bg-muted/30"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-sm">5-Hour Transformation Block</h4>
                      <Badge className="bg-emerald-700 text-white text-[10px] font-bold px-2 py-0.5">
                        Save £{activeInstructor.hourlyRatePounds * 5 - activeInstructor.blockRatePounds}
                      </Badge>
                    </div>
                  </div>
                  <span className="text-lg font-black text-amber-700 dark:text-amber-300 shrink-0">
                    £{activeInstructor.blockRatePounds}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Five 1-hour sessions to master an entire syllabus level, wedding dance choreography, or prepare for the Bournemouth Congress.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <span className="text-xs font-bold text-muted-foreground">Booking For:</span>
              <button
                type="button"
                onClick={() => setDancerType("SOLO")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  dancerType === "SOLO"
                    ? "bg-amber-600 text-white"
                    : "border bg-card text-muted-foreground"
                }`}
              >
                Solo Dancer (1 Dancer)
              </button>
              <button
                type="button"
                onClick={() => setDancerType("COUPLE")}
                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                  dancerType === "COUPLE"
                    ? "bg-amber-600 text-white"
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
              <Badge className="bg-amber-600 text-white font-bold text-xs">Step 3</Badge>
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
                  {FOCUS_TOPICS.map((topic) => (
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
        </form>
      )}
    </div>
  );
}
