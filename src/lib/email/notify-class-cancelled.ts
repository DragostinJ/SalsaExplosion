import { sendEmail } from "@/lib/email/send-email";
import { classCancelledEmail } from "@/lib/email/templates";
import { reportError } from "@/lib/monitoring";
import { getSiteOrigin } from "@/lib/safe-url";

export interface ClassCancelledNotice {
  /** Emails that went out. */
  emailed: number;
  failed: number;
  /** True when RESEND_API_KEY isn't set, so nothing could be sent. */
  emailOff: boolean;
}

/**
 * Emails everyone who said they were coming that the class is off, so the owner doesn't have to
 * message each dancer. Classes that already started get no email. Never throws: the class is
 * cancelled either way.
 */
export async function notifyClassCancelled({
  classTitle,
  startTime,
  reason,
  dancers,
  now = new Date(),
}: {
  classTitle: string;
  startTime: Date | null | undefined;
  reason: string;
  dancers: { email: string; firstName: string }[];
  now?: Date;
}): Promise<ClassCancelledNotice> {
  const notice: ClassCancelledNotice = { emailed: 0, failed: 0, emailOff: false };
  if (!startTime || startTime.getTime() <= now.getTime() || dancers.length === 0) return notice;

  const appUrl = getSiteOrigin();
  const results = await Promise.allSettled(
    dancers.map((dancer) =>
      sendEmail({
        to: dancer.email,
        ...classCancelledEmail({ firstName: dancer.firstName, classTitle, startTime, reason, appUrl }),
      })
    )
  );
  for (const result of results) {
    const outcome = result.status === "fulfilled" ? result.value : null;
    if (outcome?.sent) notice.emailed++;
    else if (outcome && !outcome.sent && outcome.reason === "dry-run") notice.emailOff = true;
    else notice.failed++;
  }
  if (notice.failed > 0) reportError("email:class-cancelled", new Error(`${notice.failed} cancellation emails failed`));
  return notice;
}
