import type { Metadata } from "next";
import Image from "next/image";
import { requireRole, STAFF_ROLES } from "@/lib/auth-user";
import { MEDIA_MANIFEST } from "@/lib/media-manifest";
import { InstructorNav } from "@/components/navigation/instructor-nav";
import { getAllMoves } from "@/lib/moves/move-library";
import { ClipReviewConsole } from "@/components/instructor/clip-review/clip-review-console";
import { TYPE, KICKER } from "@/components/poster/poster-kit";

export const metadata: Metadata = {
  title: "Pro Clips Review Desk | Salsa Explosion Faculty",
  description: "Teacher audit and verification desk for YouTube professional dance clip breakdowns.",
  robots: { index: false, follow: false },
};

export default async function ProClipsReviewPage() {
  const user = await requireRole(STAFF_ROLES);

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ").trim();
  const currentUserName = fullName || user.email || "Instructor";

  const allMoves = getAllMoves();
  const availableMoves = allMoves.map((m) => ({
    id: m.id,
    name: m.name,
  }));

  return (
    <div className="min-h-screen bg-canvas text-ivory py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <InstructorNav />
        <div className="flex items-center gap-6 border-4 border-ink bg-paper p-6 text-ink shadow-[8px_8px_0_var(--color-ink)]">
          <div className="min-w-0 flex-1">
            <p className={KICKER}>Faculty Choreography &amp; Performance Desk</p>
            <h1 className={`mt-1 font-display ${TYPE.hero} leading-none text-ink`}>
              Pro Clips Review Desk
            </h1>
            <p className="mt-3 text-xs sm:text-sm font-medium text-ink/80 leading-relaxed max-w-3xl">
              Audit AI Studio Move Mapper breakdowns of professional YouTube performances.
              Verify each time slice, confirm figure alignments against the Salsa Explosion library,
              and export audited reports for the curriculum engine.
            </p>
          </div>
          <Image
            src={MEDIA_MANIFEST.mockupGraphics.filmstrip.src}
            alt=""
            width={MEDIA_MANIFEST.mockupGraphics.filmstrip.width}
            height={MEDIA_MANIFEST.mockupGraphics.filmstrip.height}
            sizes="7rem"
            className="hidden w-24 shrink-0 sm:block md:w-28"
          />
        </div>

        <ClipReviewConsole
          currentUserName={currentUserName}
          availableMoves={availableMoves}
        />
      </div>
    </div>
  );
}
