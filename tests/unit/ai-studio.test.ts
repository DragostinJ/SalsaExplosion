import { describe, it, expect, vi, beforeEach } from "vitest";
import { Role } from "@prisma/client";
import { resetAiRateLimitStore } from "@/lib/security/upload-and-ai-guard";

// Who is signed in. A plain function (not vi.fn) so restoreAllMocks can't reset it.
const session = vi.hoisted(() => ({
  user: null as null | { id: string; role: "STUDENT" | "INSTRUCTOR" | "ADMIN" },
}));
vi.mock("@/lib/auth-user", async (importOriginal) => {
  const mod = await importOriginal<typeof import("@/lib/auth-user")>();
  return { ...mod, getOrProvisionCurrentUser: async () => session.user };
});

import {
  AiCoachingInputSchema,
  AiCoachingOutputSchema,
  FacebookEventImportInputSchema,
  VideoPreCheckInputSchema,
  VideoPreCheckOutputSchema,
  GoogleReviewDraftInputSchema,
  GoogleReviewDraftOutputSchema,
} from "@/lib/validations/ai-studio.schema";
import {
  generateCoachingPlanAction,
  parseFacebookPostToEventAction,
  preCheckStudentVideoAction,
  generateGoogleReviewHelperAction,
} from "@/actions/ai-studio.actions";

describe("AI Studio Validations & Server Actions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    resetAiRateLimitStore();
    session.user = { id: "teacher-1", role: Role.INSTRUCTOR };
  });

  describe("Zod Validation Schemas", () => {
    it("validates compliant AiCoachingInputSchema data", () => {
      const valid = {
        level: "Beginner" as const,
        danceStyle: "Cuban Salsa" as const,
        struggle: "Missing the count 1 step in Dile Que No during social dancing",
      };
      const result = AiCoachingInputSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects struggle shorter than 5 characters or invalid enum", () => {
      const invalid = {
        level: "Beginner" as const,
        danceStyle: "Cuban Salsa" as const,
        struggle: "No",
      };
      const result = AiCoachingInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("validates compliant FacebookEventImportInputSchema data", () => {
      const valid = {
        rawFacebookText:
          "HAVANA NIGHTS at BOH Studios! Join Maestro Enrique this Saturday for Cuban Salsa and Timba social until late!",
      };
      const result = FacebookEventImportInputSchema.safeParse(valid);
      expect(result.success).toBe(true);
    });

    it("rejects Facebook text shorter than 10 characters", () => {
      const invalid = {
        rawFacebookText: "Fiesta",
      };
      const result = FacebookEventImportInputSchema.safeParse(invalid);
      expect(result.success).toBe(false);
    });

    it("validates valid AiCoachingOutputSchema structure", () => {
      const output = {
        drills: [
          {
            title: "Drill 1",
            steps: "Step basic",
            focusBeat: "Beat 1",
            durationMinutes: 5,
          },
          {
            title: "Drill 2",
            steps: "Frame tension",
            focusBeat: "Beat 3",
            durationMinutes: 5,
          },
          {
            title: "Drill 3",
            steps: "Full turn",
            focusBeat: "Beat 5",
            durationMinutes: 5,
          },
        ],
        claveCue: "Listen to the conga on 2",
        rhythmTip: "Keep your knees soft",
        feedbackNote: "Great job tonight!",
      };
      const result = AiCoachingOutputSchema.safeParse(output);
      expect(result.success).toBe(true);
    });

    it("rejects AiCoachingOutputSchema if drills count is not exactly 3", () => {
      const invalidOutput = {
        drills: [
          {
            title: "Drill 1",
            steps: "Step basic",
            focusBeat: "Beat 1",
            durationMinutes: 5,
          },
        ],
        claveCue: "Listen to the conga on 2",
        rhythmTip: "Keep your knees soft",
        feedbackNote: "Great job tonight!",
      };
      const result = AiCoachingOutputSchema.safeParse(invalidOutput);
      expect(result.success).toBe(false);
    });

    it("validates compliant VideoPreCheckInputSchema & VideoPreCheckOutputSchema", () => {
      const validInput = {
        studentName: "Carlos Mendez",
        level: "Intermediate" as const,
        moveOrSong: "Setenta Complicado",
        studentNotes: "Looking for feedback on hook turn connection",
        videoDurationSeconds: 25,
      };
      expect(VideoPreCheckInputSchema.safeParse(validInput).success).toBe(true);

      const validOutput = {
        overallReadiness: "READY_FOR_APPROVAL" as const,
        confidenceScore: 90,
        timestampedObservations: [
          {
            timestamp: "0:04",
            zone: "Frame & Posture" as const,
            observation: "Shoulders square to partner",
            fixCue: "Keep frame engaged",
          },
          {
            timestamp: "0:12",
            zone: "Clave & Timing" as const,
            observation: "Strong accent on 1",
            fixCue: "Hold count 4",
          },
          {
            timestamp: "0:20",
            zone: "Footwork & Weight Transfer" as const,
            observation: "Weight fully committed on ball of foot",
            fixCue: "Pivot on ball of foot",
          },
        ],
        instructorDraftReply:
          "Excellent work on your Setenta Complicado, Carlos! Keep practicing the arm tension at BOH Studios.",
      };
      expect(VideoPreCheckOutputSchema.safeParse(validOutput).success).toBe(true);
    });

    it("validates compliant GoogleReviewDraftInputSchema & OutputSchema", () => {
      const validInput = {
        favoriteAspect: "Thursday & Sunday Social Vibe" as const,
        instructorHighlight: "Maestro Enrique" as const,
        dancerLevel: "Regular Social Dancer" as const,
      };
      expect(GoogleReviewDraftInputSchema.safeParse(validInput).success).toBe(true);

      const validOutput = {
        reviewText:
          "The Thursday and Sunday Cuban Salsa nights at BOH Studios Bournemouth are incredible! Maestro Enrique brings authentic Havana energy.",
        localSeoKeywordsIncluded: [
          "Cuban Salsa Bournemouth",
          "BOH Studios Bournemouth",
        ],
      };
      expect(GoogleReviewDraftOutputSchema.safeParse(validOutput).success).toBe(true);
    });
  });

  describe("Server Actions with Deterministic Fallbacks", () => {
    it("generates deterministic coaching plan when no GEMINI_API_KEY is configured", async () => {
      const res = await generateCoachingPlanAction({
        level: "Intermediate",
        danceStyle: "Rueda de Casino",
        struggle: "Arm collision during Setenta Complicado call",
      });

      expect(res.success).toBe(true);
      expect(res.data).toBeDefined();
      expect(res.data?.drills).toHaveLength(3);
      expect(res.data?.drills[0].durationMinutes).toBeGreaterThan(0);
      expect(res.data?.claveCue.toLowerCase()).toContain("clave");
      expect(res.data?.feedbackNote).toContain("BOH Studios");
    });

    it("handles validation error cleanly in generateCoachingPlanAction", async () => {
      const res = await generateCoachingPlanAction({
        level: "Beginner",
        danceStyle: "Cuban Salsa",
        struggle: "Tiny", // too short (< 5 chars)
      });

      expect(res.success).toBe(false);
      expect(res.error).toBeDefined();
    });

    it("parses Facebook event with fallback detecting DOOR_ONLY for weekly classes", async () => {
      const res = await parseFacebookPostToEventAction({
        rawFacebookText:
          "THURSDAY CUBAN SALSA NIGHT at BOH Studios! Join Maestro Enrique Perez Valdes for Beginners and Intermediate classes followed by social dancing!",
      });

      expect(res.success).toBe(true);
      expect(res.data).toBeDefined();
      expect(res.data?.bookingType).toBe("DOOR_ONLY");
      expect(res.data?.venue).toContain("BOH Studios");
      expect(res.data?.highlights.length).toBeGreaterThanOrEqual(3);
    });

    it("parses Facebook festival event detecting ONLINE_TICKET for congresses", async () => {
      const res = await parseFacebookPostToEventAction({
        rawFacebookText:
          "BOURNEMOUTH SALSA CONGRESS & ALL-DAYER! Get your advance ticket early bird pass online now for full masterclasses and international guest artists!",
      });

      expect(res.success).toBe(true);
      expect(res.data).toBeDefined();
      expect(res.data?.bookingType).toBe("ONLINE_TICKET");
      expect(res.data?.priceDisplay).toContain("Pass");
    });

    it("executes preCheckStudentVideoAction with deterministic fallback", async () => {
      const res = await preCheckStudentVideoAction({
        studentName: "Elena Rostova",
        level: "Intermediate",
        moveOrSong: "Setenta Complicado",
        studentNotes: "Practicing the hook turn",
        videoDurationSeconds: 25,
      });

      expect(res.success).toBe(true);
      expect(res.data).toBeDefined();
      expect(res.data?.timestampedObservations).toHaveLength(3);
      expect(res.data?.confidenceScore).toBeGreaterThanOrEqual(80);
      expect(res.data?.instructorDraftReply).toContain("Elena Rostova");
      expect(res.data?.instructorDraftReply).toContain("BOH Studios");
    });

    it("executes generateGoogleReviewHelperAction with deterministic fallback", async () => {
      const res = await generateGoogleReviewHelperAction({
        favoriteAspect: "Enrique's Authentic Cuban Teaching",
        instructorHighlight: "Maestro Enrique",
        dancerLevel: "First-Timer / Beginner",
      });

      expect(res.success).toBe(true);
      expect(res.data).toBeDefined();
      expect(res.data?.reviewText).toContain("Bournemouth");
      expect(res.data?.localSeoKeywordsIncluded.length).toBeGreaterThanOrEqual(2);
    });
  });

  // Server actions are public endpoints: anyone can call them, so each Gemini action
  // checks who's asking before it spends quota.
  describe("who may use the AI actions", () => {
    const coaching = { level: "Beginner", danceStyle: "Cuban Salsa", struggle: "Losing the count in Dile Que No" } as const;
    const video = { studentName: "Elena", level: "Intermediate", moveOrSong: "Setenta", videoDurationSeconds: 25 } as const;
    const review = {
      favoriteAspect: "Enrique's Authentic Cuban Teaching",
      instructorHighlight: "Maestro Enrique",
      dancerLevel: "First-Timer / Beginner",
    } as const;

    it("refuses the teacher tools to someone signed out", async () => {
      session.user = null;
      expect(await generateCoachingPlanAction(coaching)).toMatchObject({ success: false, error: expect.stringMatching(/signed in/) });
      expect(await preCheckStudentVideoAction(video)).toMatchObject({ success: false, error: expect.stringMatching(/signed in/) });
    });

    it("refuses the teacher tools to a dancer", async () => {
      session.user = { id: "dancer-1", role: Role.STUDENT };
      expect(await generateCoachingPlanAction(coaching)).toMatchObject({ success: false, error: expect.stringMatching(/teachers/) });
      expect(await preCheckStudentVideoAction(video)).toMatchObject({ success: false, error: expect.stringMatching(/teachers/) });
    });

    it("lets a signed-in dancer draft a review, five a minute", async () => {
      session.user = null;
      expect(await generateGoogleReviewHelperAction(review)).toMatchObject({ success: false, error: expect.stringMatching(/Sign in/) });

      session.user = { id: "dancer-1", role: Role.STUDENT };
      for (let i = 0; i < 5; i++) {
        expect((await generateGoogleReviewHelperAction(review)).success).toBe(true);
      }
      expect(await generateGoogleReviewHelperAction(review)).toMatchObject({ success: false, error: expect.stringMatching(/minute/) });
      // Someone else still has their own five
      session.user = { id: "dancer-2", role: Role.STUDENT };
      expect((await generateGoogleReviewHelperAction(review)).success).toBe(true);
    });
  });
});
