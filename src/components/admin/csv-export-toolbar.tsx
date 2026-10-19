"use client";

import { useState } from "react";
import { Download, FileSpreadsheet, Users, Ticket, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  exportRevenueLedgerCsvAction,
  exportStudentRosterCsvAction,
  exportCongressTicketHoldersCsvAction,
} from "@/actions/export.actions";

function triggerBrowserDownload(filename: string, content: string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function CsvExportToolbar() {
  const [downloadingType, setDownloadingType] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  async function handleExportRevenue() {
    setDownloadingType("revenue");
    setStatusMessage(null);
    try {
      const res = await exportRevenueLedgerCsvAction();
      if (res.success && res.csvContent && res.filename) {
        triggerBrowserDownload(res.filename, res.csvContent);
        setStatusMessage(`Successfully downloaded ${res.filename}`);
      } else {
        const errText =
          typeof res.error === "string"
            ? res.error
            : res.error?.message ?? "Unknown error";
        setStatusMessage(`Export failed: ${errText}`);
      }
    } catch {
      setStatusMessage("Export failed due to network or server error.");
    } finally {
      setDownloadingType(null);
    }
  }

  async function handleExportRoster() {
    setDownloadingType("roster");
    setStatusMessage(null);
    try {
      const res = await exportStudentRosterCsvAction();
      if (res.success && res.csvContent && res.filename) {
        triggerBrowserDownload(res.filename, res.csvContent);
        setStatusMessage(`Successfully downloaded ${res.filename}`);
      } else {
        const errText =
          typeof res.error === "string"
            ? res.error
            : res.error?.message ?? "Unknown error";
        setStatusMessage(`Export failed: ${errText}`);
      }
    } catch {
      setStatusMessage("Export failed due to network or server error.");
    } finally {
      setDownloadingType(null);
    }
  }

  async function handleExportCongress() {
    setDownloadingType("congress");
    setStatusMessage(null);
    try {
      const res = await exportCongressTicketHoldersCsvAction();
      if (res.success && res.csvContent && res.filename) {
        triggerBrowserDownload(res.filename, res.csvContent);
        setStatusMessage(`Successfully downloaded ${res.filename}`);
      } else {
        const errText =
          typeof res.error === "string"
            ? res.error
            : res.error?.message ?? "Unknown error";
        setStatusMessage(`Export failed: ${errText}`);
      }
    } catch {
      setStatusMessage("Export failed due to network or server error.");
    } finally {
      setDownloadingType(null);
    }
  }

  return (
    <Card className="border border-border/80 bg-card shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <FileSpreadsheet className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-base font-bold sm:text-lg">
                1-Click Accountant & Data Exporter
              </CardTitle>
            </div>
            <CardDescription className="mt-1 text-xs sm:text-sm">
              Export audit-ready CSV spreadsheets formatted for UK studio accounting, tax filing, and Congress door management.
            </CardDescription>
          </div>
          {statusMessage && (
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              {statusMessage}
            </span>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 sm:grid-cols-3">
          {/* Revenue Ledger Export */}
          <Button
            variant="outline"
            className="flex h-auto flex-col items-start gap-1 p-3.5 text-left border-border hover:border-amber-500/50 hover:bg-amber-500/[0.04]"
            onClick={handleExportRevenue}
            disabled={downloadingType !== null}
          >
            <div className="flex w-full items-center justify-between">
              <span className="text-xs font-bold text-foreground">
                Revenue & Ledger
              </span>
              {downloadingType === "revenue" ? (
                <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
              ) : (
                <Download className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <span className="text-[11px] text-muted-foreground leading-snug">
              Monthly revenue, Stripe ledger transactions & credit deductions.
            </span>
          </Button>

          {/* Student Roster Export */}
          <Button
            variant="outline"
            className="flex h-auto flex-col items-start gap-1 p-3.5 text-left border-border hover:border-emerald-500/50 hover:bg-emerald-500/[0.04]"
            onClick={handleExportRoster}
            disabled={downloadingType !== null}
          >
            <div className="flex w-full items-center justify-between">
              <span className="text-xs font-bold text-foreground">
                Student Roster
              </span>
              {downloadingType === "roster" ? (
                <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
              ) : (
                <Users className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <span className="text-[11px] text-muted-foreground leading-snug">
              Active student roster, syllabus levels, roles & credit balances.
            </span>
          </Button>

          {/* Congress Ticket Holders Export */}
          <Button
            variant="outline"
            className="flex h-auto flex-col items-start gap-1 p-3.5 text-left border-border hover:border-orange-500/50 hover:bg-orange-500/[0.04]"
            onClick={handleExportCongress}
            disabled={downloadingType !== null}
          >
            <div className="flex w-full items-center justify-between">
              <span className="text-xs font-bold text-foreground">
                Congress Attendees
              </span>
              {downloadingType === "congress" ? (
                <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
              ) : (
                <Ticket className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <span className="text-[11px] text-muted-foreground leading-snug">
              Bournemouth Congress passes, door check-in status & QR hashes.
            </span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
