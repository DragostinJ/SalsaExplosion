"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getOrProvisionCurrentUser, isFallbackUser, SERVICE_UNAVAILABLE_MESSAGE } from "@/lib/auth-user";
import { withRateLimit, getRateLimitIdentifier } from "@/lib/ratelimit";

// ==========================================
// SCHEMAS
// ==========================================

const AnonymousQuestionSchema = z.object({
  category: z.enum([
    "FOOTWEAR",
    "RHYTHM",
    "PARTNER_ANXIETY",
    "VENUE_ARRIVING",
    "GENERAL",
  ]),
  question: z
    .string()
    .min(5, "Question must be at least 5 characters.")
    .max(1000, "Question cannot exceed 1000 characters."),
  email: z
    .string()
    .email("Please provide a valid email address.")
    .optional()
    .or(z.literal("")),
});

export type AnonymousQuestionInput = z.infer<typeof AnonymousQuestionSchema>;

const PostClassFeedbackSchema = z.object({
  classSessionId: z.string().min(1, "Class session ID is required."),
  sentiment: z.enum(["LOVED_IT", "CHALLENGING_FUN", "A_BIT_OVERWHELMED"]),
  notes: z.string().max(500, "Notes cannot exceed 500 characters.").optional(),
});

export type PostClassFeedbackInput = z.infer<typeof PostClassFeedbackSchema>;

export interface BeginnerActionResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string | { code: string; message: string };
  message?: string;
}

// ==========================================
// KNOWLEDGE BASE REASSURANCES
// ==========================================

const CATEGORY_REASSURANCES: Record<string, string> = {
  FOOTWEAR:
    "Maestro Enrique says: Clean smooth-soled shoes or leather-bottom sneakers are perfect for your first night at BOH Studios! Avoid deep rubber running treads that grip the wood. No special dance shoes needed on day 1.",
  RHYTHM:
    "Remember: Nobody is born with Cuban clave in their ears! In Level 0, we count out loud together ('1-2-3, 5-6-7') so your feet find the pulse naturally within 20 minutes.",
  PARTNER_ANXIETY:
    "Never fear: In Cuban Salsa and Rueda de Casino, we rotate in a circle every 60 seconds. You dance with everyone, no partner needed, and every advanced dancer in the room remembers their very first class.",
  VENUE_ARRIVING:
    "Arrive 10–15 minutes early at BOH Studios (104 Commercial Rd). Grab a water or mint at the desk, say hello to our Floor Ambassador in the yellow badge, and take a breath—you're among friends!",
  GENERAL:
    "Welcome to the Salsa Explosion family! There are no silly questions in our studio. Leave perfectionism at the door and come ready to smile.",
};

// ==========================================
// SERVER ACTIONS
// ==========================================

/**
 * Persist an anonymous beginner question & return immediate reassurance
 */
export async function submitAnonymousQuestionAction(
  rawInput: AnonymousQuestionInput
): Promise<BeginnerActionResponse<{ id: string; reassurance: string }>> {
  const identifier = await getRateLimitIdentifier(null);

  return withRateLimit(
    identifier,
    "ANONYMOUS_QUESTION",
    async (): Promise<BeginnerActionResponse<{ id: string; reassurance: string }>> => {
      try {
        const parsed = AnonymousQuestionSchema.safeParse(rawInput);
        if (!parsed.success) {
          return {
            success: false,
            error: parsed.error.issues[0]?.message ?? "Invalid question submission.",
          };
        }

        const { category, question, email } = parsed.data;
        const reassurance = CATEGORY_REASSURANCES[category] ?? CATEGORY_REASSURANCES.GENERAL;

        const record = await prisma.anonymousQuestion.create({
          data: {
            category,
            question,
            email: email && email.length > 0 ? email : null,
            status: "ANSWERED",
            response: reassurance,
          },
        });

        return {
          success: true,
          data: {
            id: record.id,
            reassurance,
          },
          message: "Thank you! Your question was received with 100% anonymity.",
        };
      } catch (error) {
        console.error("submitAnonymousQuestionAction error:", error);
        return {
          success: false,
          error: "Unable to submit your question. Please try again.",
        };
      }
    }
  );
}

/**
 * Submit post-class sentiment check-in
 */
export async function submitPostClassFeedbackAction(
  rawInput: PostClassFeedbackInput
): Promise<BeginnerActionResponse<{ sentiment: string; encouragement: string }>> {
// fallback-guard
  const user = await getOrProvisionCurrentUser();
  const identifier = await getRateLimitIdentifier(user?.id);

  return withRateLimit(
    identifier,
    "BOOKING",
    async (): Promise<BeginnerActionResponse<{ sentiment: string; encouragement: string }>> => {
      try {
        if (!user) {
          return {
            success: false,
            error: "Please sign in to submit your class check-in.",
          };
        }
        if (isFallbackUser(user)) {
          return {
            success: false,
            error: SERVICE_UNAVAILABLE_MESSAGE,
          };
        }

        const parsed = PostClassFeedbackSchema.safeParse(rawInput);
        if (!parsed.success) {
          return {
            success: false,
            error: parsed.error.issues[0]?.message ?? "Invalid feedback submission.",
          };
        }

        const { classSessionId, sentiment, notes } = parsed.data;

        // Verify class session exists to prevent foreign key errors or orphaned feedback
        const targetSession = await prisma.classSession.findUnique({
          where: { id: classSessionId },
          select: { id: true },
        });

        if (!targetSession) {
          return {
            success: false,
            error: "Class session not found.",
          };
        }

        let encouragement = "¡Excelente! Keep dancing and we will see you at the next class!";
        if (sentiment === "A_BIT_OVERWHELMED") {
          encouragement =
            "Completely normal! Every dancer's brain fries a bit on class 1. Maestro Enrique promises your muscle memory begins taking over by class 3. You did amazingly just by stepping onto the floor!";
        } else if (sentiment === "CHALLENGING_FUN") {
          encouragement =
            "That sweet spot where growth happens! Check out your class video recap on the dashboard to review today's turn patterns.";
        } else if (sentiment === "LOVED_IT") {
          encouragement =
            "¡Fabuloso! Your Cuban rhythm is shining. We can't wait to see your energy in the Rueda circle next week!";
        }

        await prisma.postClassFeedback.upsert({
          where: {
            userId_classSessionId: {
              userId: user.id,
              classSessionId,
            },
          },
          update: {
            sentiment,
            notes: notes ?? null,
          },
          create: {
            userId: user.id,
            classSessionId,
            sentiment,
            notes: notes ?? null,
          },
        });

        revalidatePath("/dashboard/schedule");
        revalidatePath("/dashboard/recaps");

        return {
          success: true,
          data: {
            sentiment,
            encouragement,
          },
          message: "Thank you for letting us know how your class felt!",
        };
      } catch (error) {
        console.error("submitPostClassFeedbackAction error:", error);
        return {
          success: false,
          error: "Unable to record feedback. Please try again.",
        };
      }
    }
  );
}
