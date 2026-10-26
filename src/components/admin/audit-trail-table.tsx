import React from "react";
import { AuditAction, Role } from "@prisma/client";
import {
  ShieldAlert,
  UserCheck,
  CreditCard,
  Award,
  FileSpreadsheet,
  Calendar,
  RotateCcw,
  Clock,
  Terminal,
} from "lucide-react";
import { StatusBadge } from "@/components/ui/status-badge";

export interface AuditLogEntry {
  id: string;
  action: AuditAction;
  targetType: string;
  targetId: string | null;
  metadata: unknown;
  ip: string | null;
  createdAt: Date;
  actor: {
    id: string;
    firstName: string | null;
    lastName: string | null;
    email: string;
    role: Role;
  };
}

interface AuditTrailTableProps {
  logs: AuditLogEntry[];
}

function getActionBadge(action: AuditAction) {
  switch (action) {
    case AuditAction.ROLE_CHANGE:
      return (
        <StatusBadge tone="info" className="flex items-center gap-1">
          <UserCheck className="h-3 w-3" />
          Role Switch
        </StatusBadge>
      );
    case AuditAction.CREDIT_ADJUSTMENT:
      return (
        <StatusBadge tone="warning" className="flex items-center gap-1">
          <CreditCard className="h-3 w-3" />
          Credit Delta
        </StatusBadge>
      );
    case AuditAction.LEVEL_PROMOTION:
      return (
        <StatusBadge tone="success" className="flex items-center gap-1">
          <Award className="h-3 w-3" />
          Progression
        </StatusBadge>
      );
    case AuditAction.CSV_EXPORT:
      return (
        <StatusBadge tone="neutral" className="flex items-center gap-1">
          <FileSpreadsheet className="h-3 w-3" />
          CSV Export
        </StatusBadge>
      );
    case AuditAction.EVENT_MUTATION:
      return (
        <StatusBadge tone="info" className="flex items-center gap-1">
          <Calendar className="h-3 w-3" />
          Event Mutation
        </StatusBadge>
      );
    case AuditAction.REFUND:
      return (
        <StatusBadge tone="danger" className="flex items-center gap-1">
          <RotateCcw className="h-3 w-3" />
          Refund
        </StatusBadge>
      );
    default:
      return <StatusBadge tone="neutral">{action}</StatusBadge>;
  }
}

export function AuditTrailTable({ logs }: AuditTrailTableProps) {
  return (
    <div className="rounded-2xl border bg-card p-6 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light text-primary-base">
            <ShieldAlert className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              Administrative Audit Trail
            </h2>
            <p className="text-xs text-muted-foreground">
              Immutable forensic log of privilege changes, credit grants, student evaluations, and sensitive exports (Latest 50 events).
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3.5 w-3.5" />
          <span>Real-time UTC sequence</span>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="py-12 text-center">
          <Terminal className="mx-auto h-8 w-8 text-muted-foreground opacity-40 mb-2" />
          <p className="text-sm font-medium text-muted-foreground">
            No administrative events recorded in the audit trail yet.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Card List View (< md) */}
          <div className="md:hidden divide-y divide-border/60">
            {logs.map((log) => {
              const dateStr = new Date(log.createdAt).toISOString().replace("T", " ").slice(0, 19);
              const metadataStr = log.metadata ? JSON.stringify(log.metadata) : "—";
              return (
                <div key={log.id} className="p-4 space-y-2.5 text-xs font-mono">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-muted-foreground text-[11px]">{dateStr}</span>
                    {getActionBadge(log.action)}
                  </div>
                  <div className="flex items-start justify-between gap-2 font-sans">
                    <div>
                      <div className="font-semibold text-text-main text-xs">
                        {log.actor.firstName
                          ? `${log.actor.firstName} ${log.actor.lastName || ""}`.trim()
                          : log.actor.email}
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono">{log.actor.email}</div>
                    </div>
                    <span className="text-muted-foreground font-mono text-[10px] shrink-0 bg-muted px-1.5 py-0.5 rounded">
                      {log.ip || "internal"}
                    </span>
                  </div>
                  <div className="bg-main/60 rounded-lg p-2 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-muted-foreground text-[10px] uppercase">Target:</span>
                      <span className="font-semibold text-text-main text-[11px]">{log.targetType}</span>
                      {log.targetId && (
                        <span className="text-muted-foreground text-[10px] truncate max-w-[120px]">
                          ({log.targetId})
                        </span>
                      )}
                    </div>
                    {Boolean(log.metadata) && (
                      <div className="text-[10px] text-muted-foreground truncate pt-0.5 border-t border-border/40">
                        {metadataStr}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop Table View (>= md) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b bg-main/50 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <th className="py-3 px-4">Timestamp (UTC)</th>
                  <th className="py-3 px-4">Action</th>
                  <th className="py-3 px-4">Actor</th>
                  <th className="py-3 px-4">Target Type & ID</th>
                  <th className="py-3 px-4">Metadata Context</th>
                  <th className="py-3 px-4">Client IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {logs.map((log) => {
                  const dateStr = new Date(log.createdAt).toISOString().replace("T", " ").slice(0, 19);
                  const metadataStr = log.metadata
                    ? JSON.stringify(log.metadata)
                    : "—";

                  return (
                    <tr
                      key={log.id}
                      className="hover:bg-main/40 transition-colors font-mono text-xs"
                    >
                      <td className="py-3 px-4 whitespace-nowrap text-muted-foreground">
                        {dateStr}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getActionBadge(log.action)}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap font-sans">
                        <div className="font-semibold text-text-main">
                          {log.actor.firstName
                            ? `${log.actor.firstName} ${log.actor.lastName || ""}`.trim()
                            : log.actor.email}
                        </div>
                        <div className="text-[11px] text-muted-foreground font-mono">
                          {log.actor.email}
                        </div>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span className="font-semibold text-text-main">
                          {log.targetType}
                        </span>
                        {log.targetId && (
                          <span className="text-muted-foreground text-[11px] block truncate max-w-[140px]">
                            {log.targetId}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate text-muted-foreground">
                        <span
                          title={metadataStr}
                          className="cursor-help underline decoration-dotted decoration-text-muted/50"
                        >
                          {metadataStr}
                        </span>
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap text-muted-foreground font-mono text-[11px]">
                        {log.ip || "internal"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
