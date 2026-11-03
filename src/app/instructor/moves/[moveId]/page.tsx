import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireRole, STAFF_ROLES } from "@/lib/auth-user";
import { InstructorNav } from "@/components/navigation/instructor-nav";
import {
  findMove,
  getMoveReviewState,
  songSectionsForMove,
} from "@/lib/moves/move-library";
import { MoveReviewDetailConsole } from "@/components/instructor/move-review/move-review-detail-console";
import { MovePosterCard } from "@/components/moves/move-poster-card";

export const metadata: Metadata = {
  title: "Review Move | Salsa Explosion Faculty",
  robots: { index: false, follow: false },
};

interface MoveDetailPageProps {
  params: Promise<{ moveId: string }>;
}

export default async function MoveReviewDetailPage({ params }: MoveDetailPageProps) {
  const user = await requireRole(STAFF_ROLES);
  const { moveId } = await params;

  const move = findMove(moveId);
  if (!move) {
    notFound();
  }

  const reviewState = getMoveReviewState(move.id) ?? {
    status: "draft" as const,
    fingerprint: "",
  };

  const sections = songSectionsForMove(move.id);
  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  const currentUserName = fullName || user.email || "Instructor";

  return (
    <div className="min-h-screen bg-canvas text-ivory py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <InstructorNav />
        {move.notes && (
          // Teachers only: what Gemini wasn't sure of when it drafted this move. Dancers never see it.
          <aside aria-label="Note from the draft" className="mb-6 border-4 border-ink bg-poster-mustard p-4 text-ink">
            <p className="text-xs font-bold uppercase tracking-[0.2em]">Note from the draft · check this first</p>
            <p className="mt-2 text-sm font-medium">{move.notes}</p>
          </aside>
        )}
        <MoveReviewDetailConsole
          move={move}
          reviewState={reviewState}
          sections={sections}
          currentUserName={currentUserName}
        />
        {/* What dancers will see on /moves once this move is approved */}
        <section aria-labelledby="dancer-preview-heading" className="mt-10 max-w-sm space-y-3">
          <h2 id="dancer-preview-heading" className="text-xs font-bold uppercase tracking-[0.3em]">
            Dancer preview · how the card will look
          </h2>
          <MovePosterCard move={move} />
        </section>
      </div>
    </div>
  );
}
