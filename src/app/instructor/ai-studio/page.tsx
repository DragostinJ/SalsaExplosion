import type { Metadata } from "next";
import { requireRole, STAFF_ROLES } from "@/lib/auth-user";
import { InstructorNav } from "@/components/navigation/instructor-nav";
import { AiStudioConsole } from "@/components/instructor/ai-studio-console";

export const metadata: Metadata = {
  title: "AI Studio & Copilot Console | Salsa Explosion Faculty",
  description:
    "Maestro Enrique Perez Valdes AI Studio: Facebook Post Event Importer and Gemini-grounded Clave & Musicality Copilot.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function InstructorAiStudioPage() {
  await requireRole(STAFF_ROLES);

  return (
    <div className="min-h-screen bg-canvas text-ivory py-8 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <InstructorNav />
        <AiStudioConsole />
      </div>
    </div>
  );
}
