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
  title: "Moves on the Site | Salsa Explosion Faculty",
  description: "Every move is live. Teachers fix a move or take it down if it is wrong.",
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
          <h1 className="font-display text-2xl font-bold">Moves on the Site</h1>
          <p className="mt-1 text-sm text-ivory-muted">
            Every move is live, and there&apos;s no list to work through. If one looks wrong, open it and mark it Rejected or Needs Work: it comes off the site once the report is applied.
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
