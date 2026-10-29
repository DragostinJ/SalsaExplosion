import { redirect } from "next/navigation";
import { requireRole, STAFF_ROLES } from "@/lib/auth-user";

export default async function InstructorIndexPage() {
  await requireRole(STAFF_ROLES);
  redirect("/instructor/ai-studio");
}
