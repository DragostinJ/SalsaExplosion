import { z } from "zod";

/**
 * Transactional email through Resend's REST API (no SDK dependency).
 * Without RESEND_API_KEY this is a dry run: nothing is sent and callers must
 * not record the email as delivered.
 */

const EmailEnvSchema = z.object({
  RESEND_API_KEY: z.string().trim().min(1).optional(),
  EMAIL_FROM: z.string().trim().min(3).default("Salsa Explosion <hello@salsaexplosion.co.uk>"),
});

export interface OutgoingEmail {
  to: string;
  subject: string;
  html: string;
  text: string;
  headers?: Record<string, string>;
}

export type SendEmailResult = { sent: true; id: string | null } | { sent: false; reason: "dry-run" | "error"; detail?: string };

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY?.trim());
}

export async function sendEmail(email: OutgoingEmail): Promise<SendEmailResult> {
  const env = EmailEnvSchema.parse({
    RESEND_API_KEY: process.env.RESEND_API_KEY || undefined,
    EMAIL_FROM: process.env.EMAIL_FROM || undefined,
  });
  if (!env.RESEND_API_KEY) {
    console.info(`[email] dry run (no RESEND_API_KEY): "${email.subject}"`);
    return { sent: false, reason: "dry-run" };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: env.EMAIL_FROM,
        to: [email.to],
        subject: email.subject,
        html: email.html,
        text: email.text,
        headers: email.headers,
      }),
    });
    if (!response.ok) {
      return { sent: false, reason: "error", detail: `Resend answered ${response.status}` };
    }
    const body = (await response.json().catch(() => ({}))) as { id?: string };
    return { sent: true, id: body.id ?? null };
  } catch (error) {
    return { sent: false, reason: "error", detail: error instanceof Error ? error.message : "network error" };
  }
}
