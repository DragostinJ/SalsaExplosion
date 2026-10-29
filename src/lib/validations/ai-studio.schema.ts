import { z } from "zod";

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


// --- 2. Facebook Event Importer Schemas ---

export const FacebookEventImportInputSchema = z.object({
  rawFacebookText: z
    .string()
    .trim()
    .min(10, "Paste at least 10 characters from the Facebook post.")
    .max(3000, "Facebook post text cannot exceed 3000 characters."),
});

export type FacebookEventImportInput = z.infer<
  typeof FacebookEventImportInputSchema
>;

export const ParsedEventCardSchema = z.object({
  title: z.string().min(1, "Event title is required"),
  subtitle: z.string().min(1, "Event subtitle is required"),
  dateDisplay: z.string().min(1, "Event date display is required"),
  doorsTime: z.string().min(1, "Doors time is required"),
  venue: z.string().min(1, "Venue is required"),
  priceDisplay: z.string().min(1, "Price display is required"),
  bookingType: z.enum(["DOOR_ONLY", "ONLINE_TICKET"]),
  highlights: z
    .array(z.string().min(1))
    .min(3, "Must include at least 3 highlights")
    .max(5, "Maximum 5 highlights"),
  instagramOrFbSummary: z
    .string()
    .min(10, "Summary must be at least 10 characters"),
});

export type ParsedEventCard = z.infer<typeof ParsedEventCardSchema>;

export const FacebookEventImportOutputSchema = ParsedEventCardSchema;
