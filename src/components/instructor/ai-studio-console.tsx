"use client";

import { useState } from "react";
import {
  Sparkles,
  Music,
  Share2,
  Calendar,
  Clock,
  MapPin,
  Check,
  Copy,
  ChevronRight,
  Send,
  Zap,
  Ticket,
  DoorOpen,
  RotateCcw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DANCE_LEVELS,
  DANCE_STYLES,
  AiCoachingOutput,
  ParsedEventCard,
} from "@/lib/validations/ai-studio.schema";
import {
  generateCoachingPlanAction,
  parseFacebookPostToEventAction,
} from "@/actions/ai-studio.actions";

// Realistic sample post written in Maestro Enrique's distinct social style
const SAMPLE_ENRIQUE_FACEBOOK_POST = `🇨🇺🔥 HAVANA NIGHTS CUBAN FIESTA AT BOH STUDIOS! 🔥🇨🇺

Bournemouth Salsa Family! Get ready for an authentic night of Havana rhythm, passion and energy this Saturday night! 💃🕺

Maestro Enrique Perez Valdes (UK Lifetime Achievement Award) invites you to our world-class Canadian sprung maple dance floor in Bournemouth Triangle!

📅 SATURDAY, NOVEMBER 14TH 2026
⏰ DOORS OPEN 19:30 | MASTERCLASSES 20:00 SHARP
📍 BOH STUDIOS, 104 Commercial Rd, Bournemouth BH2 5LR (Free parking after 18:00)

🎶 PROGRAMME:
• 20:00 - Cuban Salsa Partnerwork & Turn Patterns (Beginners with Anna & Advanced with Enrique)
• 21:00 - High-Energy Rueda de Casino Masterclass
• 21:45 till Midnight - Non-stop Timba, Son, Bachata & Salsa Social Fiesta with DJ Enrique!

🎟️ ADMISSION AT THE DOOR:
£12 (1 Class + Social) | £14 (2 Classes + Social) | £5 Social Dancing Only after 21:45
Cash or Card at the door. ZERO PARTNER REQUIRED! Come alone or with friends!

Tag your dance partners and see you on the dance floor! Dale mambo! 🇨🇺✨`;

const QUICK_STRUGGLES = [
  "Late on count 1 in Dile Que No during social dancing",
  "Pulling arms and tense frame during Setenta Complicado",
  "Rushing through Aguanile liturgical break and losing the clave",
  "Confusing 2:3 Son Clave with 3:2 Rumba Clave in high tempo Timba",
  "Follower anticipating the turn before lead extension on beat 3",
];

export function AiStudioConsole() {
  const [activeTab, setActiveTab] = useState<"importer" | "copilot">("importer");

  // Tab 1: Importer State
  const [fbPostText, setFbPostText] = useState("");
  const [isParsingFb, setIsParsingFb] = useState(false);
  const [parsedEvent, setParsedEvent] = useState<ParsedEventCard | null>(null);
  const [fbError, setFbError] = useState<string | null>(null);
  const [fbCopied, setFbCopied] = useState(false);

  // Tab 2: Copilot State
  const [level, setLevel] = useState<typeof DANCE_LEVELS[number]>("Improver");
  const [danceStyle, setDanceStyle] = useState<typeof DANCE_STYLES[number]>("Cuban Salsa");
  const [struggle, setStruggle] = useState("");
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [coachingPlan, setCoachingPlan] = useState<AiCoachingOutput | null>(null);
  const [copilotError, setCopilotError] = useState<string | null>(null);
  const [planCopied, setPlanCopied] = useState(false);

  // Importer Actions
  const handleLoadSample = () => {
    setFbPostText(SAMPLE_ENRIQUE_FACEBOOK_POST);
    setFbError(null);
  };

  const handleParseEvent = async () => {
    if (fbPostText.trim().length < 10) {
      setFbError("Please enter at least 10 characters from the Facebook post.");
      return;
    }
    setIsParsingFb(true);
    setFbError(null);

    const res = await parseFacebookPostToEventAction({
      rawFacebookText: fbPostText,
    });

    setIsParsingFb(false);
    if (res.success && res.data) {
      setParsedEvent(res.data);
    } else {
      setFbError(res.error || "Failed to parse Facebook post.");
    }
  };

  const handleCopyEventJson = () => {
    if (!parsedEvent) return;
    navigator.clipboard.writeText(JSON.stringify(parsedEvent, null, 2));
    setFbCopied(true);
    setTimeout(() => setFbCopied(false), 2000);
  };

  // Copilot Actions
  const handleGeneratePlan = async () => {
    if (struggle.trim().length < 5) {
      setCopilotError("Please describe the student struggle with at least 5 characters.");
      return;
    }
    setIsGeneratingPlan(true);
    setCopilotError(null);

    const res = await generateCoachingPlanAction({
      level,
      danceStyle,
      struggle,
    });

    setIsGeneratingPlan(false);
    if (res.success && res.data) {
      setCoachingPlan(res.data);
    } else {
      setCopilotError(res.error || "Failed to generate coaching drills.");
    }
  };

  const handleCopyFeedbackNote = () => {
    if (!coachingPlan) return;
    navigator.clipboard.writeText(coachingPlan.feedbackNote);
    setPlanCopied(true);
    setTimeout(() => setPlanCopied(false), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Studio Header Card */}
      <div className="relative overflow-hidden rounded-3xl border border-line bg-surface-1 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge
                variant="outline"
                className="border-gold/40 bg-gold/10 text-gold font-semibold px-3 py-1 flex items-center gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5 text-gold" />
                Gemini 2.5 Flash + Zod Structured Output
              </Badge>
              <Badge
                variant="outline"
                className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-mono"
              >
                Zero-Any Type Safety
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ivory">
              Salsa Explosion AI Studio Console
            </h1>
            <p className="mt-1 text-sm text-ivory-muted max-w-2xl">
              Production AI tooling tailored for Maestro Enrique Perez Valdes and BOH Studios faculty. Grounded in authentic Cuban clave pedagogy and door-pricing business invariants.
            </p>
          </div>

          {/* Navigation Pill Tabs */}
          <div className="flex items-center gap-2 rounded-2xl bg-surface-2 p-1.5 border border-line shrink-0">
            <button
              type="button"
              onClick={() => setActiveTab("importer")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all min-h-[40px] ${
                activeTab === "importer"
                  ? "bg-gold text-canvas shadow-lg"
                  : "text-ivory-muted hover:text-ivory hover:bg-surface-3"
              }`}
            >
              <Share2 className="h-4 w-4" />
              <span>Facebook-to-Event Importer</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("copilot")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all min-h-[40px] ${
                activeTab === "copilot"
                  ? "bg-gold text-canvas shadow-lg"
                  : "text-ivory-muted hover:text-ivory hover:bg-surface-3"
              }`}
            >
              <Music className="h-4 w-4" />
              <span>Syllabus & Clave Copilot</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: FACEBOOK EVENT IMPORTER */}
      {activeTab === "importer" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Input Pane */}
          <div className="lg:col-span-6 rounded-3xl border border-line bg-surface-1 p-6 sm:p-7 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-ivory flex items-center gap-2">
                  <Share2 className="h-4 w-4 text-gold" />
                  Raw Facebook Event Post
                </h2>
                <p className="text-xs text-ivory-muted mt-0.5">
                  Paste raw text from Enrique's Facebook page or group announcements.
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleLoadSample}
                className="border-line bg-surface-2 hover:bg-surface-3 text-ivory text-xs min-h-[36px]"
              >
                <Zap className="h-3.5 w-3.5 mr-1.5 text-gold" />
                Load Sample Post
              </Button>
            </div>

            <textarea
              value={fbPostText}
              onChange={(e) => setFbPostText(e.target.value)}
              placeholder="Paste raw Facebook event post here (with emojis, dates, prices, and venue info)..."
              rows={12}
              className="w-full rounded-2xl border border-line bg-surface-3 p-4 text-xs font-mono text-ivory placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 leading-relaxed resize-none"
            />

            {fbError && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                {fbError}
              </div>
            )}

            <Button
              type="button"
              onClick={handleParseEvent}
              disabled={isParsingFb}
              className="w-full rounded-2xl bg-gold hover:bg-gold-light text-canvas font-bold text-sm min-h-[44px] transition-all"
            >
              {isParsingFb ? (
                <span className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 animate-spin" />
                  Extracting Event Details with Gemini 2.5...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Extract Structured Event Card
                </span>
              )}
            </Button>
          </div>

          {/* Right Preview Pane */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-ivory flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-gold" />
                  Salsa Explosion Event Card Preview
                </h2>
                <p className="text-xs text-ivory-muted mt-0.5">
                  Live preview rendered with Obsidian & Warm Ivory typography.
                </p>
              </div>
              {parsedEvent && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyEventJson}
                  className="border-line bg-surface-2 hover:bg-surface-3 text-ivory text-xs min-h-[36px]"
                >
                  {fbCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
                      JSON Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 mr-1.5 text-ivory-muted" />
                      Copy JSON
                    </>
                  )}
                </Button>
              )}
            </div>

            {parsedEvent ? (
              <div className="rounded-3xl border border-gold/40 bg-surface-1 p-6 sm:p-7 shadow-2xl relative overflow-hidden">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <Badge
                    variant="outline"
                    className="border-gold/50 bg-gold/10 text-gold font-mono text-xs uppercase tracking-wider"
                  >
                    {parsedEvent.bookingType === "ONLINE_TICKET" ? (
                      <span className="flex items-center gap-1.5">
                        <Ticket className="h-3 w-3" /> Online Advance Ticket
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5">
                        <DoorOpen className="h-3 w-3" /> Door Entry Only
                      </span>
                    )}
                  </Badge>
                  <span className="text-xs font-bold text-gold">
                    {parsedEvent.priceDisplay}
                  </span>
                </div>

                <h3 className="text-xl font-black text-ivory tracking-tight">
                  {parsedEvent.title}
                </h3>
                <p className="text-xs text-gold/80 mt-1 font-medium">
                  {parsedEvent.subtitle}
                </p>

                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-ivory-muted border-y border-line py-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-gold shrink-0" />
                    <span>{parsedEvent.dateDisplay}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gold shrink-0" />
                    <span>{parsedEvent.doorsTime}</span>
                  </div>
                  <div className="sm:col-span-2 flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-gold shrink-0 mt-0.5" />
                    <span className="leading-snug">{parsedEvent.venue}</span>
                  </div>
                </div>

                <div className="mt-5 space-y-2">
                  <p className="text-xs font-semibold text-ivory uppercase tracking-wider">
                    Event Highlights:
                  </p>
                  <ul className="space-y-1.5">
                    {parsedEvent.highlights.map((h, i) => (
                      <li
                        key={i}
                        className="text-xs text-ivory-muted flex items-start gap-2"
                      >
                        <ChevronRight className="h-3.5 w-3.5 text-gold shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="mt-6 rounded-2xl bg-surface-2 border border-line p-4">
                  <p className="text-[11px] font-semibold text-ivory-muted uppercase tracking-wider mb-1">
                    Editorial Social Summary:
                  </p>
                  <p className="text-xs text-ivory italic leading-relaxed">
                    "{parsedEvent.instagramOrFbSummary}"
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-line bg-surface-1/50 p-12 text-center flex flex-col items-center justify-center min-h-[380px]">
                <Share2 className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-semibold text-ivory">
                  No Event Extracted Yet
                </p>
                <p className="text-xs text-ivory-muted mt-1 max-w-sm">
                  Click <strong className="text-gold font-semibold">Load Sample Post</strong> on the left or paste any raw Facebook announcement and click extract to see the live event card.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: SYLLABUS & CLAVE COPILOT */}
      {activeTab === "copilot" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Controls Pane */}
          <div className="lg:col-span-5 rounded-3xl border border-line bg-surface-1 p-6 sm:p-7 shadow-xl space-y-5">
            <div>
              <h2 className="text-base font-bold text-ivory flex items-center gap-2">
                <Music className="h-4 w-4 text-gold" />
                Student Profile & Struggle
              </h2>
              <p className="text-xs text-ivory-muted mt-0.5">
                Targeted biomechanical feedback based on Cuban dance pedagogy.
              </p>
            </div>

            {/* Level Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-ivory">
                Student Level:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {DANCE_LEVELS.map((lvl) => (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => setLevel(lvl)}
                    className={`rounded-xl py-2 px-3 text-xs font-semibold transition-all min-h-[38px] ${
                      level === lvl
                        ? "bg-gold text-canvas font-bold shadow-md"
                        : "border border-line bg-surface-2 text-ivory-muted hover:text-ivory"
                    }`}
                  >
                    {lvl}
                  </button>
                ))}
              </div>
            </div>

            {/* Dance Style Selector */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-ivory">
                Dance Discipline:
              </label>
              <div className="flex flex-wrap gap-2">
                {DANCE_STYLES.map((style) => (
                  <button
                    key={style}
                    type="button"
                    onClick={() => setDanceStyle(style)}
                    className={`rounded-xl py-1.5 px-3 text-xs font-semibold transition-all min-h-[36px] ${
                      danceStyle === style
                        ? "bg-gold/20 text-gold border border-gold/40"
                        : "border border-line bg-surface-2 text-ivory-muted hover:text-ivory"
                    }`}
                  >
                    {style}
                  </button>
                ))}
              </div>
            </div>

            {/* Struggle Description */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-ivory">
                Specific Struggle or Technique Bottleneck:
              </label>
              <textarea
                value={struggle}
                onChange={(e) => setStruggle(e.target.value)}
                placeholder="e.g., Pulling arms backwards on Setenta turn, late stepping count 1 in Dile Que No..."
                rows={4}
                className="w-full rounded-2xl border border-line bg-surface-3 p-3 text-xs text-ivory placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 leading-relaxed resize-none"
              />
            </div>

            {/* Quick Chips */}
            <div className="space-y-2">
              <label className="text-[11px] font-semibold text-ivory-muted uppercase tracking-wider">
                Quick Select Common Struggles:
              </label>
              <div className="flex flex-col gap-1.5">
                {QUICK_STRUGGLES.map((qs, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setStruggle(qs)}
                    className="text-left text-[11px] text-ivory-muted hover:text-gold rounded-lg p-2 bg-surface-2 hover:bg-surface-3 transition-colors flex items-center justify-between"
                  >
                    <span className="truncate">{qs}</span>
                    <ChevronRight className="h-3 w-3 shrink-0 ml-1 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>

            {copilotError && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                {copilotError}
              </div>
            )}

            <Button
              type="button"
              onClick={handleGeneratePlan}
              disabled={isGeneratingPlan}
              className="w-full rounded-2xl bg-gold hover:bg-gold-light text-canvas font-bold text-sm min-h-[44px] transition-all"
            >
              {isGeneratingPlan ? (
                <span className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 animate-spin" />
                  Formulating Micro-Drills...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Generate 3 Micro-Drills & Clave Cue
                </span>
              )}
            </Button>
          </div>

          {/* Right Drills & Clave Output Pane */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-ivory flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-gold" />
                  Personalized Pedagogical Plan
                </h2>
                <p className="text-xs text-ivory-muted mt-0.5">
                  Micro-drills with timing triggers and WhatsApp-ready student note.
                </p>
              </div>
              {coachingPlan && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleCopyFeedbackNote}
                  className="border-line bg-surface-2 hover:bg-surface-3 text-ivory text-xs min-h-[36px]"
                >
                  {planCopied ? (
                    <>
                      <Check className="h-3.5 w-3.5 mr-1.5 text-emerald-400" />
                      Note Copied!
                    </>
                  ) : (
                    <>
                      <Send className="h-3.5 w-3.5 mr-1.5 text-gold" />
                      Copy WhatsApp Note
                    </>
                  )}
                </Button>
              )}
            </div>

            {coachingPlan ? (
              <div className="space-y-4">
                {/* 3 Structured Drills */}
                <div className="space-y-3">
                  {coachingPlan.drills.map((drill, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-line bg-surface-1 p-4 sm:p-5 shadow-lg"
                    >
                      <div className="flex items-center justify-between gap-3 mb-2">
                        <h4 className="text-sm font-bold text-ivory flex items-center gap-2">
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-gold/20 text-[11px] font-bold text-gold">
                            {idx + 1}
                          </span>
                          {drill.title}
                        </h4>
                        <Badge
                          variant="outline"
                          className="border-line bg-surface-2 text-[11px] text-ivory-muted font-mono shrink-0"
                        >
                          {drill.durationMinutes} mins
                        </Badge>
                      </div>
                      <p className="text-xs text-ivory-muted leading-relaxed">
                        {drill.steps}
                      </p>
                      <div className="mt-3 flex items-center gap-2 rounded-xl bg-surface-2 p-2.5 border border-line text-[11px] text-gold/90">
                        <Clock className="h-3.5 w-3.5 text-gold shrink-0" />
                        <span>
                          <strong>Focus Timing:</strong> {drill.focusBeat}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Clave Cue & Rhythm Tip Bar */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-gold/30 bg-gold/5 p-4">
                    <p className="text-[11px] font-semibold text-gold uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Music className="h-3.5 w-3.5" /> Clave Listening Trigger
                    </p>
                    <p className="text-xs text-ivory leading-relaxed">
                      {coachingPlan.claveCue}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                    <p className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5" /> Rhythm & Biomechanics
                    </p>
                    <p className="text-xs text-ivory leading-relaxed">
                      {coachingPlan.rhythmTip}
                    </p>
                  </div>
                </div>

                {/* WhatsApp Ready Note */}
                <div className="rounded-2xl border border-line bg-surface-1 p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-ivory uppercase tracking-wider flex items-center gap-1.5">
                      <Send className="h-3.5 w-3.5 text-emerald-400" />
                      WhatsApp Student Coaching Note:
                    </p>
                    <span className="text-[10px] text-ivory-muted font-mono">
                      Ready to send
                    </span>
                  </div>
                  <div className="rounded-xl bg-surface-2 p-4 border border-line text-xs text-ivory leading-relaxed whitespace-pre-line font-sans">
                    {coachingPlan.feedbackNote}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-line bg-surface-1/50 p-12 text-center flex flex-col items-center justify-center min-h-[380px]">
                <Music className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-semibold text-ivory">
                  Ready to Formulate Micro-Drills
                </p>
                <p className="text-xs text-ivory-muted mt-1 max-w-sm">
                  Select a student level, choose a common struggle or enter custom notes, and click <strong className="text-gold font-semibold">Generate Micro-Drills</strong>.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
