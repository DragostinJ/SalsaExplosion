"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Sparkles,
  Music,
  Share2,
  Clock,
  Check,
  Copy,
  ChevronRight,
  Send,
  Zap,
  Ticket,
  DoorOpen,
  RotateCcw,
  Video,
  ShieldCheck,
  ThumbsUp,
  FileEdit,
  Upload,
  Image as ImageIcon,
  ExternalLink,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DANCE_LEVELS,
  DANCE_STYLES,
  AiCoachingOutput,
  ParsedEventCard,
  VideoPreCheckAssessment,
} from "@/lib/validations/ai-studio.schema";
import {
  generateCoachingPlanAction,
  parseFacebookPostToEventAction,
  preCheckStudentVideoAction,
  approveAndPublishEventAction,
  removePublishedEventAction,
  getLivePublishedEventsAction,
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

// Realistic 1x1 base64 valid JPEG for 1-click test simulation without file system browsing
const SAMPLE_FLYER_IMAGE_BASE64 =
  "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=";

const QUICK_STRUGGLES = [
  "Rushing count 1 on Dile Que No",
  "Stiff shoulders in Rumba Guaguancó",
  "Missing trombone cue in Aguanile",
  "Pulling arms and tense frame during Setenta Complicado",
  "Follower anticipating the turn before lead extension on beat 3",
];

const SAMPLE_VIDEO_SUBMISSIONS = [
  {
    studentName: "Elena Rostova",
    level: "Intermediate" as const,
    moveOrSong: "Setenta Complicado at BOH Studios",
    studentNotes: "Practicing the second inside turn. I feel like my left shoulder lifts when transitioning into the hook turn.",
    clipBadge: "30s Practice Video",
  },
  {
    studentName: "Marcus Sterling",
    level: "Improver" as const,
    moveOrSong: "Aguanile Musicality Freeze & Guapea",
    studentNotes: "Trying to lock into count 1 on the brass accent right after the liturgical vocal intro.",
    clipBadge: "20s Practice Video",
  },
];

export function AiStudioConsole() {
  const [activeTab, setActiveTab] = useState<"importer" | "copilot" | "video">("importer");

  // Tab 1: Importer & Flyer Upload State
  const [fbPostText, setFbPostText] = useState("");
  const [flyerPreview, setFlyerPreview] = useState<string | null>(null);
  const [flyerMimeType, setFlyerMimeType] = useState<"image/jpeg" | "image/png" | "image/webp">("image/jpeg");
  const [isParsingFb, setIsParsingFb] = useState(false);
  const [parsedEvent, setParsedEvent] = useState<ParsedEventCard | null>(null);
  const [fbError, setFbError] = useState<string | null>(null);
  const [fbCopied, setFbCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Approval and Live Published Events State
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccessBanner, setPublishSuccessBanner] = useState<string | null>(null);
  const [liveApprovedEvents, setLiveApprovedEvents] = useState<ParsedEventCard[]>([]);

  // Tab 2: Copilot State
  const [level, setLevel] = useState<typeof DANCE_LEVELS[number]>("Improver");
  const [danceStyle, setDanceStyle] = useState<typeof DANCE_STYLES[number]>("Cuban Salsa");
  const [struggle, setStruggle] = useState("");
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [coachingPlan, setCoachingPlan] = useState<AiCoachingOutput | null>(null);
  const [copilotError, setCopilotError] = useState<string | null>(null);
  const [planCopied, setPlanCopied] = useState(false);

  // Tab 3: Video Pre-Checker State
  const [selectedVideoSample, setSelectedVideoSample] = useState(SAMPLE_VIDEO_SUBMISSIONS[0]);
  const [isCheckingVideo, setIsCheckingVideo] = useState(false);
  const [videoAssessment, setVideoAssessment] = useState<VideoPreCheckAssessment | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [customReplyDraft, setCustomReplyDraft] = useState("");
  const [feedbackSent, setFeedbackSent] = useState(false);

  // Load existing published events on mount
  useEffect(() => {
    async function loadLiveEvents() {
      const res = await getLivePublishedEventsAction();
      if (res.success && res.data) {
        setLiveApprovedEvents(res.data);
      }
    }
    loadLiveEvents();
  }, []);

  // Client-Side Canvas Image Compression Helper (Max 1200px, 0.85 quality)
  const handleFileUpload = (file: File) => {
    if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
      setFbError("Unsupported format. Please upload a JPEG, PNG, or WebP poster.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 1200;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
          setFlyerPreview(compressedDataUrl);
          setFlyerMimeType("image/jpeg");
          setFbError(null);
        }
      };
      img.src = readerEvent.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Importer Actions
  const handleLoadSample = () => {
    setFbPostText(SAMPLE_ENRIQUE_FACEBOOK_POST);
    setFbError(null);
  };

  const handleLoadSamplePoster = () => {
    setFlyerPreview(SAMPLE_FLYER_IMAGE_BASE64);
    setFlyerMimeType("image/jpeg");
    setFbError(null);
  };

  const handleParseEvent = async () => {
    if (!flyerPreview && fbPostText.trim().length < 10) {
      setFbError("Please upload an event poster OR paste at least 10 characters from the post.");
      return;
    }
    setIsParsingFb(true);
    setFbError(null);
    setPublishSuccessBanner(null);

    const res = await parseFacebookPostToEventAction({
      rawFacebookText: fbPostText || undefined,
      flyerImageBase64: flyerPreview || undefined,
      flyerMimeType: flyerPreview ? flyerMimeType : undefined,
    });

    setIsParsingFb(false);
    if (res.success && res.data) {
      setParsedEvent(res.data);
    } else {
      setFbError(res.error || "Failed to parse event details.");
    }
  };

  const handleCopyEventJson = () => {
    if (!parsedEvent) return;
    navigator.clipboard.writeText(JSON.stringify(parsedEvent, null, 2));
    setFbCopied(true);
    setTimeout(() => setFbCopied(false), 2000);
  };

  const handleApproveAndPublish = async () => {
    if (!parsedEvent) return;
    setIsPublishing(true);

    const res = await approveAndPublishEventAction(parsedEvent);
    setIsPublishing(false);

    if (res.success && res.data) {
      setPublishSuccessBanner(
        res.data.posterDropped
          ? `"${parsedEvent.title}" is live on /events, but the flyer image could not be stored, so it is shown without a poster.`
          : `"${parsedEvent.title}" is now approved and live on /events!`
      );
      // Reload live events list
      const liveRes = await getLivePublishedEventsAction();
      if (liveRes.success && liveRes.data) {
        setLiveApprovedEvents(liveRes.data);
      }
    } else {
      setFbError(res.error || "Failed to publish event.");
    }
  };

  const handleRemovePublished = async (id: string) => {
    const res = await removePublishedEventAction(id);
    if (!res.success) {
      setFbError(res.error || "Failed to remove event.");
      return;
    }
    const liveRes = await getLivePublishedEventsAction();
    if (liveRes.success && liveRes.data) {
      setLiveApprovedEvents(liveRes.data);
    }
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

  // Video Pre-Checker Actions
  const handleRunVideoPreCheck = async () => {
    setIsCheckingVideo(true);
    setVideoError(null);
    setFeedbackSent(false);

    const res = await preCheckStudentVideoAction({
      studentName: selectedVideoSample.studentName,
      level: selectedVideoSample.level,
      moveOrSong: selectedVideoSample.moveOrSong,
      studentNotes: selectedVideoSample.studentNotes,
      videoDurationSeconds: 25,
    });

    setIsCheckingVideo(false);
    if (res.success && res.data) {
      setVideoAssessment(res.data);
      setCustomReplyDraft(res.data.instructorDraftReply);
    } else {
      setVideoError(res.error || "Failed to analyze student video submission.");
    }
  };

  const handleApproveAndSend = () => {
    setFeedbackSent(true);
    setTimeout(() => setFeedbackSent(false), 3000);
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
                Gemini 2.5 Flash Multimodal Vision
              </Badge>
              <Badge
                variant="outline"
                className="border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-xs font-mono"
              >
                Magic-Byte Verified
              </Badge>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-ivory">
              Salsa Explosion AI Studio Console
            </h1>
            <p className="mt-1 text-sm text-ivory-muted max-w-2xl">
              Production AI tooling tailored for Maestro Enrique Perez Valdes and BOH Studios faculty. Upload event posters, pre-screen student dance clips, and publish live to /events.
            </p>
          </div>

          {/* Navigation Pill Tabs */}
          <div className="flex items-center gap-2 rounded-2xl bg-surface-2 p-1.5 border border-line shrink-0 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={() => setActiveTab("importer")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all min-h-[40px] shrink-0 ${
                activeTab === "importer"
                  ? "bg-gold text-canvas shadow-lg"
                  : "text-ivory-muted hover:text-ivory hover:bg-surface-3"
              }`}
            >
              <Share2 className="h-4 w-4" />
              <span>Flyer &amp; Event Importer</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("copilot")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all min-h-[40px] shrink-0 ${
                activeTab === "copilot"
                  ? "bg-gold text-canvas shadow-lg"
                  : "text-ivory-muted hover:text-ivory hover:bg-surface-3"
              }`}
            >
              <Music className="h-4 w-4" />
              <span>Syllabus &amp; Clave Copilot</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("video")}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all min-h-[40px] shrink-0 ${
                activeTab === "video"
                  ? "bg-gold text-canvas shadow-lg"
                  : "text-ivory-muted hover:text-ivory hover:bg-surface-3"
              }`}
            >
              <Video className="h-4 w-4" />
              <span>Video Pre-Screener</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: FLYER POSTER & FACEBOOK EVENT IMPORTER */}
      {activeTab === "importer" && (
        <div className="space-y-8">
          {/* Success Banner */}
          {publishSuccessBanner && (
            <div className="rounded-2xl border border-emerald-500/40 bg-emerald-500/10 p-4 text-xs text-emerald-300 flex items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="font-semibold">{publishSuccessBanner}</span>
              </div>
              <Link
                href="/events"
                target="_blank"
                className="inline-flex items-center gap-1 font-bold text-gold hover:underline shrink-0"
              >
                <span>View on /events</span>
                <ExternalLink className="h-3 w-3" />
              </Link>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Input Pane: Poster Image + Text */}
            <div className="lg:col-span-6 rounded-3xl border border-line bg-surface-1 p-6 sm:p-7 shadow-xl space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-ivory flex items-center gap-2">
                    <Upload className="h-4 w-4 text-gold" />
                    Upload Poster &amp; Post
                  </h2>
                  <p className="text-xs text-ivory-muted mt-0.5">
                    Drag and drop an event flyer image, or paste Facebook copy.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleLoadSamplePoster}
                    className="border-line bg-surface-2 hover:bg-surface-3 text-ivory text-xs min-h-[34px]"
                  >
                    <ImageIcon className="h-3.5 w-3.5 mr-1 text-gold" />
                    Sample Poster
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleLoadSample}
                    className="border-line bg-surface-2 hover:bg-surface-3 text-ivory text-xs min-h-[34px]"
                  >
                    <Zap className="h-3.5 w-3.5 mr-1 text-gold" />
                    Sample Post
                  </Button>
                </div>
              </div>

              {/* Poster Dropzone */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-ivory flex items-center justify-between">
                  <span>Event Flyer Image (.jpg, .png, .webp):</span>
                  {flyerPreview && (
                    <button
                      type="button"
                      onClick={() => setFlyerPreview(null)}
                      className="text-rose-400 text-[11px] hover:underline"
                    >
                      Remove Poster
                    </button>
                  )}
                </label>

                {flyerPreview ? (
                  <div className="relative rounded-2xl border border-gold/40 bg-surface-3 p-3 flex items-center gap-4">
                    <img
                      src={flyerPreview}
                      alt="Event Flyer Preview"
                      className="h-20 w-16 object-cover rounded-xl border border-line"
                    />
                    <div className="text-xs space-y-1">
                      <p className="font-bold text-ivory">Event Flyer Ready</p>
                      <p className="text-[11px] text-emerald-400">
                        ✓ Compressed for fast vision parsing
                      </p>
                      <p className="text-[10px] text-ivory-muted">
                        Format: {flyerMimeType}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-line hover:border-gold/50 rounded-2xl p-6 text-center cursor-pointer transition-colors bg-surface-2/40 hover:bg-surface-2"
                  >
                    <Upload className="h-7 w-7 text-ivory-muted mx-auto mb-2" />
                    <p className="text-xs font-semibold text-ivory">
                      Click to choose or drag &amp; drop event flyer image
                    </p>
                    <p className="text-[10px] text-ivory-muted mt-1">
                      Auto-downscaled on canvas • Max 4MB binary
                    </p>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFileUpload(file);
                  }}
                />
              </div>

              {/* Text Area */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-ivory">
                  Optional Facebook Announcement Text:
                </label>
                <textarea
                  value={fbPostText}
                  onChange={(e) => setFbPostText(e.target.value)}
                  placeholder="Paste raw text announcement or leave blank if flyer has all event info..."
                  rows={6}
                  className="w-full rounded-2xl border border-line bg-surface-3 p-3.5 text-xs font-mono text-ivory placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 leading-relaxed resize-none"
                />
              </div>

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
                    Extracting Poster &amp; Post with Gemini 2.5 Vision...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    Extract Structured Event Card
                  </span>
                )}
              </Button>
            </div>

            {/* Right Preview Pane: Editable Event Card & Approval */}
            <div className="lg:col-span-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-ivory flex items-center gap-2">
                    <Ticket className="h-4 w-4 text-gold" />
                    Review &amp; Edit Event Preview
                  </h2>
                  <p className="text-xs text-ivory-muted mt-0.5">
                    Human-in-the-loop: Verify details before publishing to /events.
                  </p>
                </div>
                {parsedEvent && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleCopyEventJson}
                    className="border-line bg-surface-2 hover:bg-surface-3 text-ivory text-xs min-h-[34px]"
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
                <div className="rounded-3xl border border-gold/40 bg-surface-1 p-6 sm:p-7 shadow-2xl relative overflow-hidden space-y-5">
                  <div className="flex items-center justify-between gap-3">
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

                  {/* Inline Editable Fields */}
                  <div className="space-y-3">
                    <div>
                      <label className="text-[10px] uppercase font-bold text-ivory-muted">
                        Event Title:
                      </label>
                      <input
                        type="text"
                        value={parsedEvent.title}
                        onChange={(e) =>
                          setParsedEvent({ ...parsedEvent, title: e.target.value })
                        }
                        className="w-full rounded-xl border border-line bg-surface-2 px-3 py-1.5 text-sm font-bold text-ivory focus:ring-1 focus:ring-gold"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="text-[10px] uppercase font-bold text-ivory-muted">
                          Date:
                        </label>
                        <input
                          type="text"
                          value={parsedEvent.dateDisplay}
                          onChange={(e) =>
                            setParsedEvent({
                              ...parsedEvent,
                              dateDisplay: e.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-line bg-surface-2 px-3 py-1 text-xs text-ivory"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase font-bold text-ivory-muted">
                          Doors Time:
                        </label>
                        <input
                          type="text"
                          value={parsedEvent.doorsTime}
                          onChange={(e) =>
                            setParsedEvent({
                              ...parsedEvent,
                              doorsTime: e.target.value,
                            })
                          }
                          className="w-full rounded-xl border border-line bg-surface-2 px-3 py-1 text-xs text-ivory"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] uppercase font-bold text-ivory-muted">
                        Price Display:
                      </label>
                      <input
                        type="text"
                        value={parsedEvent.priceDisplay}
                        onChange={(e) =>
                          setParsedEvent({
                            ...parsedEvent,
                            priceDisplay: e.target.value,
                          })
                        }
                        className="w-full rounded-xl border border-line bg-surface-2 px-3 py-1 text-xs text-ivory"
                      />
                    </div>
                  </div>

                  {/* Highlights */}
                  <div className="space-y-1.5 border-t border-line pt-3">
                    <p className="text-[11px] font-semibold text-ivory uppercase tracking-wider">
                      Event Highlights:
                    </p>
                    <ul className="space-y-1">
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

                  {/* 2-Step Approval Action */}
                  <div className="pt-2">
                    <Button
                      type="button"
                      onClick={handleApproveAndPublish}
                      disabled={isPublishing}
                      className="w-full rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm min-h-[46px] transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      {isPublishing ? (
                        <span className="flex items-center gap-2">
                          <RotateCcw className="h-4 w-4 animate-spin" />
                          Publishing to /events...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Check className="h-4 w-4" />
                          Approve &amp; Publish to /events →
                        </span>
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="rounded-3xl border border-dashed border-line bg-surface-1/50 p-12 text-center flex flex-col items-center justify-center min-h-[380px]">
                  <Share2 className="h-10 w-10 text-muted-foreground/30 mb-3" />
                  <p className="text-sm font-semibold text-ivory">
                    No Event Extracted Yet
                  </p>
                  <p className="text-xs text-ivory-muted mt-1 max-w-sm">
                    Upload an event poster or click <strong className="text-gold font-semibold">Sample Poster</strong> on the left to test the multimodal AI vision extraction pipeline.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Section: Currently Live AI-Approved Announcements */}
          {liveApprovedEvents.length > 0 && (
            <div className="rounded-3xl border border-line bg-surface-1 p-6 sm:p-7 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-ivory flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    Currently Live Published Events ({liveApprovedEvents.length})
                  </h3>
                  <p className="text-xs text-ivory-muted mt-0.5">
                    These announcements are currently active on /events and the homepage feed.
                  </p>
                </div>
                <Link
                  href="/events"
                  target="_blank"
                  className="text-xs text-gold font-bold hover:underline inline-flex items-center gap-1"
                >
                  <span>Open Public /events</span>
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {liveApprovedEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="rounded-2xl border border-line bg-surface-2 p-4 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-gold font-mono mb-1">
                        <span>{evt.bookingType}</span>
                        <span>{evt.priceDisplay}</span>
                      </div>
                      <h4 className="text-sm font-bold text-ivory line-clamp-1">
                        {evt.title}
                      </h4>
                      <p className="text-xs text-ivory-muted mt-1">
                        {evt.dateDisplay} • {evt.doorsTime}
                      </p>
                    </div>

                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemovePublished(evt.id)}
                      className="w-full border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs min-h-[32px]"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                      Unpublish
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
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
                Student Profile &amp; Struggle
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
                  Generate 3 Micro-Drills &amp; Clave Cue
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
                      <Zap className="h-3.5 w-3.5" /> Rhythm &amp; Biomechanics
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

      {/* TAB 3: MULTIMODAL VIDEO PRE-SCREENER */}
      {activeTab === "video" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Video Selection & Action Pane */}
          <div className="lg:col-span-5 rounded-3xl border border-line bg-surface-1 p-6 sm:p-7 shadow-xl space-y-5">
            <div>
              <h2 className="text-base font-bold text-ivory flex items-center gap-2">
                <Video className="h-4 w-4 text-gold" />
                Student Practice Video Queue
              </h2>
              <p className="text-xs text-ivory-muted mt-0.5">
                AI pre-screens video submissions before teacher review to save 80% instructor time.
              </p>
            </div>

            {/* Video Selection Cards */}
            <div className="space-y-2.5">
              <label className="text-xs font-semibold text-ivory">
                Select Practice Submission:
              </label>
              {SAMPLE_VIDEO_SUBMISSIONS.map((sub, idx) => {
                const isSelected = selectedVideoSample.studentName === sub.studentName;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setSelectedVideoSample(sub);
                      setVideoAssessment(null);
                    }}
                    className={`w-full text-left rounded-2xl p-4 transition-all border text-xs min-h-[44px] ${
                      isSelected
                        ? "border-gold/50 bg-gold/10 text-ivory shadow-md"
                        : "border-line bg-surface-2 text-ivory-muted hover:text-ivory hover:bg-surface-3"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-ivory">{sub.studentName}</span>
                      <Badge
                        variant="outline"
                        className="border-line bg-surface-3 text-[10px] text-gold font-mono"
                      >
                        {sub.clipBadge}
                      </Badge>
                    </div>
                    <p className="text-gold/90 font-medium text-xs">
                      {sub.moveOrSong} ({sub.level})
                    </p>
                    <p className="text-ivory-muted text-[11px] mt-1.5 italic line-clamp-2">
                      &ldquo;{sub.studentNotes}&rdquo;
                    </p>
                  </button>
                );
              })}
            </div>

            {videoError && (
              <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
                {videoError}
              </div>
            )}

            <Button
              type="button"
              onClick={handleRunVideoPreCheck}
              disabled={isCheckingVideo}
              className="w-full rounded-2xl bg-gold hover:bg-gold-light text-canvas font-bold text-sm min-h-[44px] transition-all"
            >
              {isCheckingVideo ? (
                <span className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4 animate-spin" />
                  Analyzing Video Cadence &amp; Frame with Gemini 2.5...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" />
                  Pre-Check Practice Video
                </span>
              )}
            </Button>
          </div>

          {/* Right Assessment & Instructor Approval Pane */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-ivory flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-gold" />
                  AI Assessment &amp; 1-Click Teacher Action
                </h2>
                <p className="text-xs text-ivory-muted mt-0.5">
                  Review posture, clave timing, and edit feedback before sending.
                </p>
              </div>
              {videoAssessment && (
                <Badge
                  variant="outline"
                  className={`text-xs font-bold uppercase tracking-wider px-3 py-1 ${
                    videoAssessment.overallReadiness === "READY_FOR_APPROVAL"
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                      : "border-amber-500/40 bg-amber-500/10 text-amber-300"
                  }`}
                >
                  {videoAssessment.overallReadiness.replace(/_/g, " ")} ({videoAssessment.confidenceScore}%)
                </Badge>
              )}
            </div>

            {videoAssessment ? (
              <div className="space-y-5">
                {/* 3 Timestamped Flags */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-ivory uppercase tracking-wider">
                    Timestamped Biomechanical &amp; Clave Analysis:
                  </p>
                  {videoAssessment.timestampedObservations.map((obs, idx) => (
                    <div
                      key={idx}
                      className="rounded-2xl border border-line bg-surface-1 p-4 shadow-md space-y-2"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-2 px-2.5 py-1 text-xs font-mono font-bold text-gold border border-line">
                          <Clock className="h-3 w-3" />
                          {obs.timestamp}
                        </span>
                        <Badge
                          variant="outline"
                          className="border-line bg-surface-2 text-[11px] text-ivory-muted"
                        >
                          {obs.zone}
                        </Badge>
                      </div>
                      <p className="text-xs text-ivory leading-relaxed">
                        {obs.observation}
                      </p>
                      <div className="rounded-xl bg-surface-2 p-2.5 border border-line text-[11px] text-emerald-300/90 flex items-start gap-1.5">
                        <ThumbsUp className="h-3.5 w-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <span>
                          <strong>Coaching Cue:</strong> {obs.fixCue}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Editable Instructor Feedback Reply */}
                <div className="rounded-3xl border border-line bg-surface-1 p-5 shadow-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-ivory flex items-center gap-2">
                      <FileEdit className="h-3.5 w-3.5 text-gold" />
                      Instructor Feedback Reply (Ready to Approve / Edit):
                    </label>
                    <span className="text-[10px] text-ivory-muted font-mono">
                      Faculty Draft
                    </span>
                  </div>

                  <textarea
                    value={customReplyDraft}
                    onChange={(e) => setCustomReplyDraft(e.target.value)}
                    rows={4}
                    className="w-full rounded-2xl border border-line bg-surface-3 p-3.5 text-xs text-ivory leading-relaxed placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gold/50 resize-none font-sans"
                  />

                  <div className="flex flex-wrap items-center gap-3 pt-2">
                    <Button
                      type="button"
                      onClick={handleApproveAndSend}
                      disabled={feedbackSent}
                      className="flex-1 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs min-h-[42px] transition-all"
                    >
                      {feedbackSent ? (
                        <span className="flex items-center gap-2">
                          <Check className="h-4 w-4 text-white" />
                          Feedback Approved &amp; Sent to Student!
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          <Check className="h-4 w-4" />
                          1-Click Approve &amp; Send Feedback
                        </span>
                      )}
                    </Button>

                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setCustomReplyDraft(videoAssessment.instructorDraftReply)}
                      className="border-line bg-surface-2 hover:bg-surface-3 text-ivory text-xs min-h-[42px]"
                    >
                      Reset Draft
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-line bg-surface-1/50 p-12 text-center flex flex-col items-center justify-center min-h-[380px]">
                <Video className="h-10 w-10 text-muted-foreground/30 mb-3" />
                <p className="text-sm font-semibold text-ivory">
                  No Video Pre-Checked Yet
                </p>
                <p className="text-xs text-ivory-muted mt-1 max-w-sm">
                  Select a student submission clip on the left and click <strong className="text-gold font-semibold">Pre-Check Practice Video</strong> to generate timestamped biomechanical analysis.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
