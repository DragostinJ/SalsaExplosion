"use server";

import { requireRole, ADMIN_ONLY } from "@/lib/auth-user";
import { prisma } from "@/lib/prisma";

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
  filename: string;
  csvContent?: string;
  error?: string;
}

/**
 * 1. Export Monthly Revenue & Credit Ledger Transactions
 */
export async function exportRevenueLedgerCsvAction(): Promise<CsvExportResult> {
  try {
    await requireRole(ADMIN_ONLY);

    const transactions = await prisma.creditLedger.findMany({
      include: {
        user: {
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
      "Transaction ID",
      "Date & Time (UTC)",
      "Student Name",
      "Student Email",
      "Transaction Type",
      "Credit Delta",
      "Balance After (Credits)",
      "Description",
      "Stripe Payment Intent ID",
      "Linked Booking ID",
    ];

    const rows = transactions.map((tx) => [
      tx.id,
      tx.createdAt.toISOString(),
      `${tx.user.firstName} ${tx.user.lastName}`.trim(),
      tx.user.email,
      tx.type,
      tx.amount,
      tx.balanceAfter,
      tx.description ?? "",
      tx.stripePaymentIntentId ?? "",
      tx.bookingId ?? "",
    ]);

    const csvContent = buildCsv(headers, rows);
    const dateStamp = new Date().toISOString().split("T")[0];

    return {
      success: true,
      filename: `salsa-explosion-revenue-ledger-${dateStamp}.csv`,
      csvContent,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to export revenue ledger";
    return { success: false, filename: "", error: message };
  }
}

/**
 * 2. Export Active Student Roster & Credit Balances
 */
export async function exportStudentRosterCsvAction(): Promise<CsvExportResult> {
  try {
    await requireRole(ADMIN_ONLY);

    const students = await prisma.user.findMany({
      include: {
        subscription: true,
      },
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
      "Available Class Credits",
      "Subscription Status",
      "Subscription Renews / Ends",
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
      student.classCredits,
      student.subscription?.status ?? "NONE",
      student.subscription?.currentPeriodEnd
        ? student.subscription.currentPeriodEnd.toISOString()
        : "",
      student.createdAt.toISOString(),
    ]);

    const csvContent = buildCsv(headers, rows);
    const dateStamp = new Date().toISOString().split("T")[0];

    return {
      success: true,
      filename: `salsa-explosion-student-roster-${dateStamp}.csv`,
      csvContent,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to export student roster";
    return { success: false, filename: "", error: message };
  }
}

/**
 * 3. Export Bournemouth Congress Ticket Holders & Check-In Status
 */
export async function exportCongressTicketHoldersCsvAction(): Promise<CsvExportResult> {
  try {
    await requireRole(ADMIN_ONLY);

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

    return {
      success: true,
      filename: `bournemouth-congress-attendees-${dateStamp}.csv`,
      csvContent,
    };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to export congress ticket holders";
    return { success: false, filename: "", error: message };
  }
}
