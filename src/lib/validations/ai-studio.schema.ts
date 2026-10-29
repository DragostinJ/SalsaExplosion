import { z } from "zod";
import {
  sanitizeExtractedString,
  sanitizeSafeEventUrl,
} from "@/lib/security/upload-and-ai-guard";

/**
 * Strict Zod Schemas for Salsa Explosion / BOH Studios AI Features
 * Zero `any` policy enforced.
 */

// --- 1. AI Syllabus & Musicality Copilot Schemas ---

export const DANCE_LEVELS = [
  "Beginner",
  "Improver",
  "Intermediate",
  "Advanced",
] as const;

export const DANCE_STYLES = [
  "Cuban Salsa",
  "Rueda de Casino",
  "Timba Musicality",
  "Bachata",
  "Afro-Cuban",
] as const;

export const AiCoachingInputSchema = z.object({
  level: z.enum(DANCE_LEVELS),
  danceStyle: z.enum(DANCE_STYLES),
  struggle: z
    .string()
    .trim()
    .min(5, "Please describe the struggle with at least 5 characters.")
    .max(400, "Struggle description cannot exceed 400 characters."),
});

export type AiCoachingInput = z.infer<typeof AiCoachingInputSchema>;

export const DrillItemSchema = z.object({
  title: z.string().min(1, "Drill title is required"),
  steps: z.string().min(1, "Drill steps are required"),
  focusBeat: z.string().min(1, "Focus beat is required"),
  durationMinutes: z.number().int().positive().max(60),
});

export type DrillItem = z.infer<typeof DrillItemSchema>;

export const AiCoachingOutputSchema = z.object({
  drills: z
    .array(DrillItemSchema)
    .length(3, "Must return exactly 3 structured micro-drills"),
  claveCue: z
    .string()
    .min(1, "Clave cue listening trigger is required"),
  rhythmTip: z.string().min(1, "Rhythm tip is required"),
  feedbackNote: z
    .string()
    .min(1, "WhatsApp-ready coaching note is required"),
});

export type AiCoachingOutput = z.infer<typeof AiCoachingOutputSchema>;


// --- 2. Multimodal Flyer & Facebook Event Importer Schemas ---

export const FlyerAndPostImportInputSchema = z
  .object({
    rawFacebookText: z
      .string()
      .trim()
      .max(3000, "Facebook post text cannot exceed 3000 characters.")
      .optional(),
    flyerImageBase64: z
      .string()
      .max(
        6 * 1024 * 1024,
        "Base64 image payload exceeds safe limits (max ~4MB binary)."
      )
      .optional(),
    flyerMimeType: z
      .enum(["image/jpeg", "image/png", "image/webp"])
      .optional(),
  })
  .refine(
    (data) => {
      const hasText =
        Boolean(data.rawFacebookText) &&
        (data.rawFacebookText?.length ?? 0) >= 10;
      const hasImage = Boolean(data.flyerImageBase64);
      return hasText || hasImage;
    },
    {
      message:
        "Please provide either event text (at least 10 characters) OR an event flyer poster image.",
    }
  );

export type FlyerAndPostImportInput = z.infer<
  typeof FlyerAndPostImportInputSchema
>;

// Backwards compatibility alias
export const FacebookEventImportInputSchema = FlyerAndPostImportInputSchema;
export type FacebookEventImportInput = FlyerAndPostImportInput;

export const ParsedEventCardSchema = z.object({
  id: z
    .string()
    .min(2, "ID is required")
    .transform((val) =>
      val
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "")
    ),
  title: z
    .string()
    .min(1, "Event title is required")
    .transform(sanitizeExtractedString),
  subtitle: z
    .string()
    .min(1, "Event subtitle is required")
    .transform(sanitizeExtractedString),
  dateDisplay: z
    .string()
    .min(1, "Event date display is required")
    .transform(sanitizeExtractedString),
  doorsTime: z
    .string()
    .min(1, "Doors time is required")
    .transform(sanitizeExtractedString),
  venue: z
    .string()
    .min(1, "Venue is required")
    .transform(sanitizeExtractedString),
  priceDisplay: z
    .string()
    .min(1, "Price display is required")
    .transform(sanitizeExtractedString),
  bookingType: z.enum(["DOOR_ONLY", "ONLINE_TICKET"]),
  highlights: z
    .array(z.string().min(1).transform(sanitizeExtractedString))
    .min(3, "Must include at least 3 highlights")
    .max(5, "Maximum 5 highlights"),
  instagramOrFbSummary: z
    .string()
    .min(10, "Summary must be at least 10 characters")
    .transform(sanitizeExtractedString),
  ctaUrl: z
    .string()
    .optional()
    .default("/events")
    .transform(sanitizeSafeEventUrl),
  posterPreviewUrl: z.string().optional(),
});

export type ParsedEventCard = z.infer<typeof ParsedEventCardSchema>;
export const FacebookEventImportOutputSchema = ParsedEventCardSchema;


// --- 3. Multimodal Student Video Pre-Checker Schemas ---

export const VideoPreCheckInputSchema = z.object({
  studentName: z.string().trim().min(2, "Student name is required"),
  level: z.enum(DANCE_LEVELS),
  moveOrSong: z.string().trim().min(2, "Move or song name is required"),
  studentNotes: z.string().max(500).optional(),
  videoDurationSeconds: z.number().int().min(5).max(120).default(20),
  videoMimeType: z.string().optional(),
});

export type VideoPreCheckInput = z.infer<typeof VideoPreCheckInputSchema>;

export const TimestampedObservationSchema = z.object({
  timestamp: z.string().min(1, "Timestamp is required (e.g., 0:04)"),
  zone: z.enum([
    "Frame & Posture",
    "Clave & Timing",
    "Footwork & Weight Transfer",
  ]),
  observation: z.string().min(5, "Observation is required"),
  fixCue: z.string().min(5, "Fix cue is required"),
});

export type TimestampedObservation = z.infer<typeof TimestampedObservationSchema>;

export const VideoPreCheckOutputSchema = z.object({
  overallReadiness: z.enum([
    "READY_FOR_APPROVAL",
    "NEEDS_MINOR_TWEAK",
    "RE_RECORD_SUGGESTED",
  ]),
  confidenceScore: z.number().min(0).max(100),
  timestampedObservations: z
    .array(TimestampedObservationSchema)
    .length(3, "Must return exactly 3 timestamped observations"),
  instructorDraftReply: z
    .string()
    .min(20, "Instructor draft reply must be comprehensive and supportive"),
});

export type VideoPreCheckAssessment = z.infer<typeof VideoPreCheckOutputSchema>;


// --- 4. Google Maps 5-Star Review Helper Schemas ---

export const REVIEW_FAVORITE_ASPECTS = [
  "Thursday & Sunday Social Vibe",
  "Enrique's Authentic Cuban Teaching",
  "Beginner-Friendly Rueda de Casino",
  "Music & Timba Atmosphere at BOH Studios",
] as const;

export const REVIEW_INSTRUCTOR_HIGHLIGHTS = [
  "Maestro Enrique",
  "Whole Salsa Explosion Team",
  "Justyna, Arturas & Jim",
] as const;

export const REVIEW_DANCER_LEVELS = [
  "First-Timer / Beginner",
  "Regular Social Dancer",
  "Festival Visitor",
] as const;

export const GoogleReviewDraftInputSchema = z.object({
  favoriteAspect: z.enum(REVIEW_FAVORITE_ASPECTS),
  instructorHighlight: z.enum(REVIEW_INSTRUCTOR_HIGHLIGHTS),
  dancerLevel: z.enum(REVIEW_DANCER_LEVELS),
});

export type GoogleReviewDraftInput = z.infer<typeof GoogleReviewDraftInputSchema>;

export const GoogleReviewDraftOutputSchema = z.object({
  reviewText: z
    .string()
    .min(20, "Review text must be at least 20 characters"),
  localSeoKeywordsIncluded: z
    .array(z.string().min(2))
    .min(2, "Must include at least 2 local SEO keywords"),
});

export type GoogleReviewDraftOutput = z.infer<
  typeof GoogleReviewDraftOutputSchema
>;
