import type { Metadata } from "next";
import { requireRole, STAFF_ROLES } from "@/lib/auth-user";
import { InstructorNav } from "@/components/navigation/instructor-nav";
import { MoveImportConsole } from "@/components/instructor/move-review/move-import-console";

export const metadata: Metadata = {
  title: "Import Move Drafts | Salsa Explosion Faculty",
  description: "Import AI Studio drafted moves into the faculty review queue.",
  robots: { index: false, follow: false },
};

export default async function MoveImportPage() {
  await requireRole(STAFF_ROLES);

  return (
    <div className="min-h-screen bg-canvas text-ivory py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <InstructorNav />
        <div className="mb-6">
          <h1 className="font-display text-2xl font-bold">Import Move Maker Drafts</h1>
          <p className="mt-1 text-sm text-ivory-muted">
            Paste Gemini-generated move structures into the instructor desk to preview, queue, and audit.
          </p>
        </div>
        <MoveImportConsole />
      </div>
    </div>
  );
}
