export type GradingErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "VALIDATION_ERROR"
  | "SUBMISSION_NOT_FOUND"
  | "ALREADY_GRADED"
  | "INTERNAL_ERROR"
  | "RATE_LIMITED";

export class GradingDomainError extends Error {
  public readonly code: GradingErrorCode;

  constructor(code: GradingErrorCode, message: string) {
    super(message);
    this.name = "GradingDomainError";
    this.code = code;
  }
}

export type GradingActionResponse<T = undefined> =
  | { success: true; data: T; message: string }
  | { success: false; error: { code: GradingErrorCode; message: string } };
