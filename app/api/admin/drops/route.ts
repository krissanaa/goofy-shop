import { NextRequest } from "next/server";
import { AuditAction, DropStatus } from "@prisma/client";
import { requireRole } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { ok, withApiHandler } from "@/lib/server/response";
import { adminDropCreateSchema } from "@/lib/server/schemas";
import { writeAuditLog } from "@/lib/server/services/audit";
import { parseBody } from "@/lib/server/validation";

export const dynamic = "force-dynamic";

export const POST = withApiHandler(async (request: NextRequest) => {
  const user = await requireRole(request, ["ADMIN"]);
  const payload = await parseBody(request, adminDropCreateSchema);

  const created = await prisma.dropEvent.create({
    data: {
      slug: payload.slug,
      name: payload.name,
      description: payload.description,
      startsAt: new Date(payload.startsAt),
      endsAt: new Date(payload.endsAt),
      queueEnabled: payload.queueEnabled,
      status: DropStatus.SCHEDULED,
      createdById: user.id,
      rule: {
        create: {
          maxUnitsPerUser: payload.rule.maxUnitsPerUser,
          reservationTtlMinutes: payload.rule.reservationTtlMinutes,
          cartTimeoutMinutes: payload.rule.cartTimeoutMinutes,
          queueEnabled: payload.rule.queueEnabled,
          botProtectionEnabled: payload.rule.botProtectionEnabled,
        },
      },
      variants: {
        create: payload.variants.map((variant) => ({
          variantId: variant.variantId,
          allocation: variant.allocation,
          perUserLimit: variant.perUserLimit,
        })),
      },
    },
    include: {
      rule: true,
      variants: true,
    },
  });

  await writeAuditLog({
    actorUserId: user.id,
    action: AuditAction.DROP_CREATE,
    entityType: "DropEvent",
    entityId: created.id,
    after: created,
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });

  return ok(created, { status: 201 });
});
