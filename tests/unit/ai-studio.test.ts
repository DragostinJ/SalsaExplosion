import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  AiCoachingInputSchema,
  AiCoachingOutputSchema,
  FacebookEventImportInputSchema,
  FacebookEventImportOutputSchema,
} from "@/lib/validations/ai-studio.schema";
import {
  generateCoachingPlanAction,
  parseFacebookPostToEventAction,
} from "@/actions/ai-studio.actions";

describe("AI Studio Validations & Server Actions", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
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
  });
});
