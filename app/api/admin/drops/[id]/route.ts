import { NextRequest } from "next/server";
import { AuditAction } from "@prisma/client";
import { ApiError } from "@/lib/server/errors";
import { requireRole } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { ok, withApiHandler } from "@/lib/server/response";
import { adminDropUpdateSchema } from "@/lib/server/schemas";
import { writeAuditLog } from "@/lib/server/services/audit";
import { parseBody } from "@/lib/server/validation";

export const dynamic = "force-dynamic";

export const PATCH = withApiHandler(async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
  const user = await requireRole(request, ["ADMIN"]);
  const payload = await parseBody(request, adminDropUpdateSchema);
  const { id } = await context.params;

  const existing = await prisma.dropEvent.findUnique({
    where: { id },
    include: {
      rule: true,
      variants: true,
    },
  });

  if (!existing) {
    throw new ApiError(404, "NOT_FOUND", "Drop event not found.");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const event = await tx.dropEvent.update({
      where: { id },
      data: {
        slug: payload.slug,
        name: payload.name,
        description: payload.description,
        startsAt: payload.startsAt ? new Date(payload.startsAt) : undefined,
        endsAt: payload.endsAt ? new Date(payload.endsAt) : undefined,
        queueEnabled: payload.queueEnabled,
      },
      include: {
        rule: true,
        variants: true,
      },
    });

    if (payload.rule) {
      await tx.dropRule.upsert({
        where: { dropEventId: id },
        create: {
          dropEventId: id,
          maxUnitsPerUser: payload.rule.maxUnitsPerUser ?? 1,
          reservationTtlMinutes: payload.rule.reservationTtlMinutes ?? 5,
          cartTimeoutMinutes: payload.rule.cartTimeoutMinutes ?? 5,
          queueEnabled: payload.rule.queueEnabled ?? true,
          botProtectionEnabled: payload.rule.botProtectionEnabled ?? true,
        },
        update: {
          maxUnitsPerUser: payload.rule.maxUnitsPerUser,
          reservationTtlMinutes: payload.rule.reservationTtlMinutes,
          cartTimeoutMinutes: payload.rule.cartTimeoutMinutes,
          queueEnabled: payload.rule.queueEnabled,
          botProtectionEnabled: payload.rule.botProtectionEnabled,
        },
      });
    }

    if (payload.variants) {
      await tx.dropVariant.deleteMany({
        where: { dropEventId: id },
      });

      await tx.dropVariant.createMany({
        data: payload.variants.map((variant) => ({
          dropEventId: id,
          variantId: variant.variantId,
          allocation: variant.allocation,
          perUserLimit: variant.perUserLimit,
        })),
      });
    }

    return tx.dropEvent.findUnique({
      where: { id },
      include: {
        rule: true,
        variants: true,
      },
    });
  });

  await writeAuditLog({
    actorUserId: user.id,
    action: AuditAction.DROP_UPDATE,
    entityType: "DropEvent",
    entityId: id,
    before: existing,
    after: updated,
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });

  return ok(updated);
});
