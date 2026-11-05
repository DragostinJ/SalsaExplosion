"use server";

import { AuditAction } from "@prisma/client";
import { z } from "zod";
import { requireRole, ADMIN_ONLY } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";
import { withRateLimit, getRateLimitIdentifier } from "@/lib/ratelimit";
import { recordAuditLog } from "@/lib/audit-log";

const exportInputSchema = z
  .object({
    format: z.enum(["csv"]).default("csv").optional(),
  })
  .optional();

export type ExportInput = z.infer<typeof exportInputSchema>;

function formatCsvCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return '""';
  let str = String(value);
  // Neutralize CSV / formula injection (Excel / Google Sheets trigger chars: = + - @ \t \r)
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  const stringified = str.replace(/"/g, '""');
  return `"${stringified}"`;
}

function buildCsv(headers: string[], rows: (string | number | boolean | null | undefined)[][]): string {
  const headerLine = headers.map(formatCsvCell).join(",");
  const dataLines = rows.map((row) => row.map(formatCsvCell).join(","));
  return [headerLine, ...dataLines].join("\r\n");
}

export interface CsvExportResult {
  success: boolean;
  filename?: string;
  csvContent?: string;
  error?: string | { code: string; message: string };
}

/**
 * Export the student roster (levels and roles; classes are paid at the door, so no balances)
 */
export async function exportStudentRosterCsvAction(rawInput?: unknown): Promise<CsvExportResult> {
  exportInputSchema.parse(rawInput);
  const admin = await requireRole(ADMIN_ONLY);
  const identifier = await getRateLimitIdentifier(admin.id);

  return withRateLimit(identifier, "EXPORT", async (): Promise<CsvExportResult> => {
    try {
      const students = await prisma.user.findMany({
        orderBy: { createdAt: "desc" },
      });

      const headers = [
        "User ID",
        "First Name",
        "Last Name",
        "Email Address",
        "System Role",
        "Current Syllabus Level",
        "Preferred Role",
        "Account Created At",
      ];

      const rows = students.map((student) => [
        student.id,
        student.firstName,
        student.lastName,
        student.email,
        student.role,
        student.currentLevel,
        student.preferredRole,
        student.createdAt.toISOString(),
      ]);

      const csvContent = buildCsv(headers, rows);
      const dateStamp = new Date().toISOString().split("T")[0];
      const filename = `salsa-explosion-student-roster-${dateStamp}.csv`;

      await recordAuditLog({
        actorId: admin.id,
        action: AuditAction.CSV_EXPORT,
        targetType: "CSV_EXPORT",
        targetId: "student-roster",
        metadata: { filename, rowCount: rows.length },
      });

      return {
        success: true,
        filename,
        csvContent,
      };
    } catch (err: unknown) {
      console.error("[exportStudentRosterCsvAction]", err);
      return { success: false, filename: "", error: "Failed to generate CSV export. Please try again." };
    }
  });
}

/**
 * 3. Export Bournemouth Congress Ticket Holders & Check-In Status
 */
export async function exportCongressTicketHoldersCsvAction(rawInput?: unknown): Promise<CsvExportResult> {
  exportInputSchema.parse(rawInput);
  const admin = await requireRole(ADMIN_ONLY);
  const identifier = await getRateLimitIdentifier(admin.id);

  return withRateLimit(identifier, "EXPORT", async (): Promise<CsvExportResult> => {
    try {
      const registrations = await prisma.eventRegistration.findMany({
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          event: {
            select: {
              title: true,
              venueName: true,
            },
          },
          ticketTier: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const headers = [
        "Registration ID",
        "Event Title",
        "Venue",
        "Ticket Tier",
        "Amount Paid (£)",
        "Attendee Name",
        "Attendee Email",
        "Dance Role",
        "Payment Status",
        "Checked In (Yes/No)",
        "Check-In Timestamp",
        "QR Code Hash",
        "Stripe Session ID",
        "Purchased At",
      ];

      const rows = registrations.map((reg) => [
        reg.id,
        reg.event.title,
        reg.event.venueName,
        reg.ticketTier.name,
        (reg.amountPaidInCents / 100).toFixed(2),
        `${reg.user.firstName} ${reg.user.lastName}`.trim(),
        reg.user.email,
        reg.role,
        reg.paymentStatus,
        reg.checkedIn ? "YES" : "NO",
        reg.checkedInAt ? reg.checkedInAt.toISOString() : "",
        reg.qrCodeHash,
        reg.stripeSessionId ?? "",
        reg.createdAt.toISOString(),
      ]);

      const csvContent = buildCsv(headers, rows);
      const dateStamp = new Date().toISOString().split("T")[0];
      const filename = `bournemouth-congress-attendees-${dateStamp}.csv`;

      await recordAuditLog({
        actorId: admin.id,
        action: AuditAction.CSV_EXPORT,
        targetType: "CSV_EXPORT",
        targetId: "congress-attendees",
        metadata: { filename, rowCount: rows.length },
      });

      return {
        success: true,
        filename,
        csvContent,
      };
    } catch (err: unknown) {
      console.error("[exportCongressTicketHoldersCsvAction]", err);
      return { success: false, filename: "", error: "Failed to generate CSV export. Please try again." };
    }
  });
}

/**
 * 4. Export Private Coaching Orders
 */
export async function exportPrivateCoachingCsvAction(rawInput?: unknown): Promise<CsvExportResult> {
  exportInputSchema.parse(rawInput);
  const admin = await requireRole(ADMIN_ONLY);
  const identifier = await getRateLimitIdentifier(admin.id);

  return withRateLimit(identifier, "EXPORT", async (): Promise<CsvExportResult> => {
    try {
      const privateBookings = await prisma.privateLessonBooking.findMany({
        include: {
          student: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const headers = [
        "Order ID",
        "Date Created (UTC)",
        "Customer Name",
        "Customer Email",
        "Teacher & Focus",
        "Package",
        "Preferred Slot",
        "Amount (£)",
        "Status",
      ];

      const rows = privateBookings.map((b) => [
        b.id,
        b.createdAt.toISOString(),
        `${b.student.firstName} ${b.student.lastName}`.trim(),
        b.student.email,
        `${b.instructorName} - ${b.focusTopic}`,
        b.packageType,
        b.preferredSlot,
        b.totalPricePounds.toFixed(2),
        b.status,
      ]);

      const csvContent = buildCsv(headers, rows);
      const dateStamp = new Date().toISOString().split("T")[0];
      const filename = `salsa-explosion-private-coaching-${dateStamp}.csv`;

      await recordAuditLog({
        actorId: admin.id,
        action: AuditAction.CSV_EXPORT,
        targetType: "CSV_EXPORT",
        targetId: "private-coaching-orders",
        metadata: { filename, rowCount: rows.length },
      });

      return {
        success: true,
        filename,
        csvContent,
      };
    } catch (err: unknown) {
      console.error("[exportPrivateCoachingCsvAction]", err);
      return { success: false, filename: "", error: "Failed to generate CSV export. Please try again." };
    }
  });
}

