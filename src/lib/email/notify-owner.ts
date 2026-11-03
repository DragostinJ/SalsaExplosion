import { sendEmail } from "@/lib/email/send-email";
import { privateLessonRequestEmail, type PrivateLessonRequestInput } from "@/lib/email/templates";
import { reportError } from "@/lib/monitoring";
import { getSiteOrigin } from "@/lib/safe-url";

/** The owner's addresses, from ADMIN_EMAILS (the same list the Monday digest goes to). */
export function ownerEmails(raw: string | undefined = process.env.ADMIN_EMAILS): string[] {
  return (raw ?? "")
    .split(",")
    .map((email) => email.trim())
    .filter((email) => email.includes("@"));
}

/**
 * Emails the owner the moment a dancer asks for a private lesson, with Reply-To set to the dancer,
 * so answering is one tap instead of checking the studio desk. Never throws: the request is saved
 * either way, and the studio desk still lists it.
 */
export async function notifyOwnerOfPrivateLessonRequest(
  request: Omit<PrivateLessonRequestInput, "deskUrl">
): Promise<{ emailed: number }> {
  const to = ownerEmails();
  if (to.length === 0) return { emailed: 0 };
  try {
    const email = privateLessonRequestEmail({ ...request, deskUrl: `${getSiteOrigin()}/admin/operations` });
    const results = await Promise.all(
      to.map((address) => sendEmail({ to: address, ...email, headers: { "Reply-To": request.dancerEmail } }))
    );
    return { emailed: results.filter((r) => r.sent).length };
  } catch (error) {
    reportError("email:private-lesson-request", error);
    return { emailed: 0 };
  }
}
