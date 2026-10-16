// src/lib/constants/submission.ts
import { DanceLevel } from "@prisma/client";
import { LEVEL_WEIGHT } from "@/lib/constants/booking";

export const STORAGE_BUCKET = "assessments";
export const MAX_VIDEO_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB

export const ALLOWED_VIDEO_MIME_TYPES = {
  "video/mp4": "mp4",
  "video/quicktime": "mov",
  "video/webm": "webm",
} as const;

export type AllowedVideoMimeType = keyof typeof ALLOWED_VIDEO_MIME_TYPES;

export const CUBAN_SALSA_SYLLABUS: Record<
  Exclude<DanceLevel, "BEGINNER">,
  {
    title: string;
    description: string;
    requiredFigures: string[];
  }
> = {
  IMPROVER: {
    title: "Improver Casino Assessment",
    description:
      "Demonstrate consistent on-beat timing (counts 1-2-3, 5-6-7), grounded Cuban basic, and clean partner connection.",
    requiredFigures: [
      "Guapea & Basic Steps (Son / Casino timing)",
      "Dile Que No (Cross-body lead with clear circular frame)",
      "Enchufla & Enchufla Doble",
      "Exhibela (Single right turn with proper tension)",
    ],
  },
  INTERMEDIATE: {
    title: "Intermediate Casino & Rueda Assessment",
    description:
      "Demonstrate smooth circular travel in Casino, dynamic weight transfers, and complex two-handed figures without losing the clave.",
    requiredFigures: [
      "Setenta (70) & Setenta Complicado",
      "Vacilala (With and without hand release)",
      "Sombrero (Clean double-hand transition into Dile Que No)",
      "Kentucky or Paseala en Abajo",
    ],
  },
  ADVANCED: {
    title: "Advanced Master Casino Assessment",
    description:
      "Demonstrate advanced musicality, Afro-Cuban/Rumba body movement (Guaguancó / Columbia accents), and seamless high-tempo knot combinations.",
    requiredFigures: [
      "Setenta con Alarde & Contratiempo phrasing",
      "Coca-Cola / Montaña with fluid torso isolation",
      "Bayamo or Dedo combination",
      "Musicality break (Rumba / Timba gear shifts)",
    ],
  },
};

export function getNextUnlockableLevel(
  currentLevel: DanceLevel
): Exclude<DanceLevel, "BEGINNER"> | null {
  switch (currentLevel) {
    case DanceLevel.BEGINNER:
      return DanceLevel.IMPROVER;
    case DanceLevel.IMPROVER:
      return DanceLevel.INTERMEDIATE;
    case DanceLevel.INTERMEDIATE:
      return DanceLevel.ADVANCED;
    case DanceLevel.ADVANCED:
      return null;
  }
}

export function isValidSingleStepPromotion(
  currentLevel: DanceLevel,
  targetLevel: DanceLevel
): boolean {
  return LEVEL_WEIGHT[targetLevel] === LEVEL_WEIGHT[currentLevel] + 1;
}

export type SubmissionErrorCode =
  | "UNAUTHORIZED"
  | "USER_NOT_FOUND"
  | "VALIDATION_ERROR"
  | "MAX_LEVEL_REACHED"
  | "INVALID_TARGET_LEVEL"
  | "PENDING_SUBMISSION_EXISTS"
  | "STORAGE_SIGNING_FAILED"
  | "INTERNAL_ERROR";

export class SubmissionDomainError extends Error {
  public readonly code: SubmissionErrorCode;

  constructor(code: SubmissionErrorCode, message: string) {
    super(message);
    this.name = "SubmissionDomainError";
    this.code = code;
  }
}

export type SubmissionActionResponse<T = undefined> =
  | { success: true; data: T; message: string }
  | { success: false; error: { code: SubmissionErrorCode; message: string } };
