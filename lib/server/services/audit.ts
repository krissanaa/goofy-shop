import { AuditAction } from "@prisma/client";
import { prisma } from "@/lib/server/prisma";

interface AuditInput {
  actorUserId?: string;
  action: AuditAction;
  entityType: string;
  entityId: string;
  before?: unknown;
  after?: unknown;
  reason?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  requestId?: string | null;
}

export const writeAuditLog = async (input: AuditInput) => {
  return prisma.auditLog.create({
    data: {
      actorUserId: input.actorUserId,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      before: input.before as object | undefined,
      after: input.after as object | undefined,
      reason: input.reason,
      ipAddress: input.ipAddress ?? undefined,
      userAgent: input.userAgent ?? undefined,
      requestId: input.requestId ?? undefined,
    },
  });
};
