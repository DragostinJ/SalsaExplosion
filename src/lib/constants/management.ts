import {
  BookingStatus,
  DanceLevel,
  DanceRole,
  Role,
} from "@prisma/client";

export type ManagementActionResponse<T = undefined> =
  | { success: true; data: T; message: string }
  | { success: false; error: { code: string; message: string } };

export interface StudentProgressionRow {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  role: Role;
  currentLevel: DanceLevel;
  preferredRole: DanceRole;
  classCredits: number;
  hasActiveSubscription: boolean;
  totalBookingsCount: number;
  attendedClassesCount: number;
  pendingSubmissionsCount: number;
  approvedSubmissionsCount: number;
  latestSubmissionStatus: string | null;
  createdAt: string;
}

export interface RosterBookingItem {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  currentLevel: DanceLevel;
  danceRole: DanceRole;
  status: BookingStatus;
  checkedInAt: string | null;
}

export interface ClassRosterSummary {
  id: string;
  title: string;
  minLevel: DanceLevel;
  startTime: string;
  endTime: string;
  room: string;
  instructorName: string;
  instructorAvatarUrl?: string | null;
  maxCapacity: number;
  maxLeads: number | null;
  maxFollows: number | null;
  confirmedLeads: number;
  confirmedFollows: number;
  checkedInLeads: number;
  checkedInFollows: number;
  recapVideoUrl?: string | null;
  recapNotes?: string | null;
  recapFigures?: string[];
  recapPublished?: boolean;
  /** "Tonight's songs" linked to this class (practice-player song ids) */
  practiceSongIds?: string[];
  bookings: RosterBookingItem[];
}

export interface AiFigureEvaluation {
  figureName: string;
  score: number;
  observation: string;
}

export interface AiRubricEvaluation {
  overallScore: number;
  claveTimingScore: number;
  circularFrameScore: number;
  cubanMotionScore: number;
  recommendation: "APPROVE" | "NEEDS_PRACTICE";
  summaryHeadline: string;
  figureBreakdown: AiFigureEvaluation[];
  suggestedInstructorFeedback: string;
}
