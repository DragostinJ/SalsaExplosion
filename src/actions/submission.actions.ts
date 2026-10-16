"use server";

import { randomUUID } from "crypto";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { DanceLevel, DanceStyle, SubmissionStatus } from "@prisma/client";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import {
  ALLOWED_VIDEO_MIME_TYPES,
  AllowedVideoMimeType,
  isValidSingleStepPromotion,
  MAX_VIDEO_SIZE_BYTES,
  STORAGE_BUCKET,
  SubmissionActionResponse,
  SubmissionDomainError,
} from "@/lib/constants/submission";

function getSupabaseAdmin() {
  const envUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseUrl =
    envUrl && !envUrl.includes("[")
      ? envUrl
      : "https://placeholder-project.supabase.co";
  const supabaseServiceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || "placeholder_service_role_key";

  return createClient(supabaseUrl, supabaseServiceKey);
}

// ==========================================
// ZOD 4 VALIDATION SCHEMAS
// ==========================================

const VALID_DANCE_LEVELS = [
  DanceLevel.BEGINNER,
  DanceLevel.IMPROVER,
  DanceLevel.INTERMEDIATE,
  DanceLevel.ADVANCED,
] as const;

const GenerateUploadUrlSchema = z.object({
  targetLevel: z.enum(VALID_DANCE_LEVELS),
  contentType: z.enum(["video/mp4", "video/quicktime", "video/webm"] as const, {
    message: "Only MP4, MOV (QuickTime), and WebM video formats are supported.",
  }),
  fileSizeBytes: z
    .number()
    .int()
    .positive({ message: "File size must be greater than 0 bytes." })
    .max(MAX_VIDEO_SIZE_BYTES, {
      message: "Video file size cannot exceed 100 MB.",
    }),
});

const CreateVideoSubmissionSchema = z.object({
  targetLevel: z.enum(VALID_DANCE_LEVELS),
  videoPath: z
    .string()
    .min(10, { message: "Invalid video storage path." })
    .regex(
      /^[a-zA-Z0-9_-]+\/\d+-[a-f0-9-]+\.(mp4|mov|webm)$/,
      { message: "Malformed storage object path." }
    ),
  studentNotes: z
    .string()
    .trim()
    .max(1000, { message: "Notes cannot exceed 1000 characters." })
    .optional(),
});

// ==========================================
// 1. GENERATE SIGNED UPLOAD URL ACTION
// ==========================================

export async function generateSignedUploadUrlAction(rawInput: {
  targetLevel: DanceLevel;
  contentType: AllowedVideoMimeType;
  fileSizeBytes: number;
}): Promise<
  SubmissionActionResponse<{
    signedUrl: string;
    token: string;
    videoPath: string;
    targetLevel: DanceLevel;
  }>
> {
  try {
    // 1. Verify User Authentication
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      throw new SubmissionDomainError(
        "UNAUTHORIZED",
        "You must be signed in to upload a Cuban Salsa assessment video."
      );
    }

    // 2. Validate Payload (File Type <= 100MB, MP4/MOV/WebM)
    const parsed = GenerateUploadUrlSchema.safeParse(rawInput);
    if (!parsed.success) {
      throw new SubmissionDomainError(
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message ?? "Invalid video file parameters."
      );
    }

    const { targetLevel, contentType } = parsed.data;

    // 3. Fetch Student & Verify Level Progression Rules
    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: { id: true, currentLevel: true },
    });

    if (!user) {
      throw new SubmissionDomainError(
        "USER_NOT_FOUND",
        "Student profile not found."
      );
    }

    if (user.currentLevel === DanceLevel.ADVANCED) {
      throw new SubmissionDomainError(
        "MAX_LEVEL_REACHED",
        "You have already unlocked ADVANCED (the highest Cuban Salsa tier at RitmoFlow)!"
      );
    }

    // Enforce monotonic level progression: LEVEL_WEIGHT[targetLevel] === LEVEL_WEIGHT[user.currentLevel] + 1
    if (!isValidSingleStepPromotion(user.currentLevel, targetLevel)) {
      throw new SubmissionDomainError(
        "INVALID_TARGET_LEVEL",
        `Level skipping is not permitted. From ${user.currentLevel}, you must unlock the immediate next level before applying for ${targetLevel}.`
      );
    }

    // 4. Verify No Currently PENDING Submission Exists for Cuban Salsa
    const existingPending = await prisma.videoSubmission.findFirst({
      where: {
        studentId: user.id,
        style: DanceStyle.CUBAN_SALSA,
        status: SubmissionStatus.PENDING,
      },
      select: { id: true },
    });

    if (existingPending) {
      throw new SubmissionDomainError(
        "PENDING_SUBMISSION_EXISTS",
        "You already have a Cuban Salsa assessment video awaiting instructor review."
      );
    }

    // 5. Generate Scoped Supabase Storage Signed Upload URL
    const extension = ALLOWED_VIDEO_MIME_TYPES[contentType];
    const videoPath = `${user.id}/${Date.now()}-${randomUUID()}.${extension}`;
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .createSignedUploadUrl(videoPath);

    if (error || !data?.signedUrl) {
      console.error("[Supabase createSignedUploadUrl Error]:", error);
      throw new SubmissionDomainError(
        "STORAGE_SIGNING_FAILED",
        "Could not initialize secure storage upload. Please try again."
      );
    }

    return {
      success: true,
      data: {
        signedUrl: data.signedUrl,
        token: data.token,
        videoPath,
        targetLevel,
      },
      message: "Secure upload URL generated.",
    };
  } catch (error) {
    if (error instanceof SubmissionDomainError) {
      return {
        success: false,
        error: { code: error.code, message: error.message },
      };
    }

    console.error("[generateSignedUploadUrlAction Error]:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "An unexpected error occurred while preparing your upload.",
      },
    };
  }
}

// ==========================================
// 2. CREATE VIDEO SUBMISSION ACTION
// ==========================================

export async function createVideoSubmissionAction(rawInput: {
  targetLevel: DanceLevel;
  videoPath: string;
  studentNotes?: string;
}): Promise<SubmissionActionResponse<{ submissionId: string }>> {
  try {
    // 1. Verify User Authentication
    const { userId: clerkId } = await auth();
    if (!clerkId) {
      throw new SubmissionDomainError(
        "UNAUTHORIZED",
        "You must be signed in to submit an assessment video."
      );
    }

    // 2. Validate Submission Payload
    const parsed = CreateVideoSubmissionSchema.safeParse(rawInput);
    if (!parsed.success) {
      throw new SubmissionDomainError(
        "VALIDATION_ERROR",
        parsed.error.issues[0]?.message ?? "Invalid submission payload."
      );
    }

    const { targetLevel, videoPath, studentNotes } = parsed.data;

    // 3. Atomic Transaction: Re-verify Eligibility & Insert PENDING Record
    const submission = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { clerkId },
        select: { id: true, currentLevel: true },
      });

      if (!user) {
        throw new SubmissionDomainError(
          "USER_NOT_FOUND",
          "Student profile not found."
        );
      }

      // Ensure the uploaded storage path belongs to the authenticated user's directory
      if (!videoPath.startsWith(`${user.id}/`)) {
        throw new SubmissionDomainError(
          "VALIDATION_ERROR",
          "Unauthorized video storage path ownership."
        );
      }

      // Enforce monotonic level jump: LEVEL_WEIGHT[targetLevel] === LEVEL_WEIGHT[user.currentLevel] + 1
      if (!isValidSingleStepPromotion(user.currentLevel, targetLevel)) {
        throw new SubmissionDomainError(
          "INVALID_TARGET_LEVEL",
          `Invalid target level (${targetLevel}) for your current level (${user.currentLevel}).`
        );
      }

      // Prevent race-condition duplicate PENDING submissions
      const existingPending = await tx.videoSubmission.findFirst({
        where: {
          studentId: user.id,
          style: DanceStyle.CUBAN_SALSA,
          status: SubmissionStatus.PENDING,
        },
        select: { id: true },
      });

      if (existingPending) {
        throw new SubmissionDomainError(
          "PENDING_SUBMISSION_EXISTS",
          "You already have a Cuban Salsa video submission in the review queue."
        );
      }

      return tx.videoSubmission.create({
        data: {
          studentId: user.id,
          style: DanceStyle.CUBAN_SALSA,
          currentLevel: user.currentLevel,
          targetLevel,
          videoUrl: videoPath,
          studentNotes:
            studentNotes && studentNotes.length > 0 ? studentNotes : null,
          status: SubmissionStatus.PENDING,
        },
        select: { id: true },
      });
    });

    // 4. Revalidate Student Progression & Instructor Queue Paths
    revalidatePath("/dashboard/progression");
    revalidatePath("/instructor/submissions");

    return {
      success: true,
      data: { submissionId: submission.id },
      message:
        "Cuban Salsa assessment submitted! An instructor will review your Casino technique and post feedback soon.",
    };
  } catch (error) {
    if (error instanceof SubmissionDomainError) {
      return {
        success: false,
        error: { code: error.code, message: error.message },
      };
    }

    console.error("[createVideoSubmissionAction Error]:", error);
    return {
      success: false,
      error: {
        code: "INTERNAL_ERROR",
        message: "Failed to save your video submission. Please try again.",
      },
    };
  }
}
