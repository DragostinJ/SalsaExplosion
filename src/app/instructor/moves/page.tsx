import type { Metadata } from "next";
import { requireRole, STAFF_ROLES } from "@/lib/auth-user";
import { InstructorNav } from "@/components/navigation/instructor-nav";
import {
  getAllMoves,
  getMoveReviewState,
  songSectionsForMove,
  type MoveReviewState,
} from "@/lib/moves/move-library";
import { MoveReviewListConsole } from "@/components/instructor/move-review/move-review-list-console";

export const metadata: Metadata = {
  title: "Move Library Review | Salsa Explosion Faculty",
  description: "Review, audit, and approve curriculum dance moves and attach verified YouTube video breakdowns.",
  robots: { index: false, follow: false },
};

export default async function MoveReviewListPage() {
  await requireRole(STAFF_ROLES);

  const moves = getAllMoves();
  const reviewStates: Record<string, MoveReviewState> = {};
  const songSectionsCounts: Record<string, number> = {};

  for (const move of moves) {
    const state = getMoveReviewState(move.id);
    if (state) {
      reviewStates[move.id] = state;
    }
    songSectionsCounts[move.id] = songSectionsForMove(move.id).length;
  }

  return (
    <div className="min-h-screen bg-canvas text-ivory py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <InstructorNav />
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold">Move Library Review Desk</h1>
          <p className="mt-1 text-sm text-ivory-muted">
            Inspect AI drafts, count movements against benchmark timba tracks, and approve figures for the dancer curriculum.
          </p>
        </div>
        <MoveReviewListConsole
          moves={[...moves]}
          reviewStates={reviewStates}
          songSectionsCounts={songSectionsCounts}
        />
      </div>
    </div>
  );
}
