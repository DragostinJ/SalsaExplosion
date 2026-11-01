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
        <MoveReviewDetailConsole
          move={move}
          reviewState={reviewState}
          sections={sections}
          currentUserName={currentUserName}
        />
      </div>
    </div>
  );
}
