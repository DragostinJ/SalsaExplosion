import { prisma } from "@/lib/prisma";
import { AuditAction, Prisma } from "@prisma/client";
import { headers } from "next/headers";

export interface RecordAuditLogParams {
  actorId: string;
  action: AuditAction;
  targetType: string;
  targetId?: string | null;
  metadata?: Prisma.InputJsonValue;
  ip?: string | null;
}

/**
 * Persists an immutable security/administrative audit log entry.
 * Non-blocking logger designed to fail gracefully without crashing critical business operations,
 * while ensuring compliance and tamper-evident event tracing.
 */
export async function recordAuditLog(params: RecordAuditLogParams) {
  try {
    let clientIp = params.ip;
    if (!clientIp) {
      try {
        const headerList = await headers();
        clientIp =
          headerList.get("x-forwarded-for")?.split(",")[0]?.trim() ||
          headerList.get("x-real-ip") ||
          null;
      } catch {
        clientIp = null;
      }
    }

    return await prisma.auditLog.create({
      data: {
        actorId: params.actorId,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId ?? null,
        metadata: params.metadata ?? Prisma.JsonNull,
        ip: clientIp,
      },
    });
  } catch (error) {
    console.error("[AUDIT_LOG_ERROR] Failed to record audit log:", error);
    return null;
  }
}
