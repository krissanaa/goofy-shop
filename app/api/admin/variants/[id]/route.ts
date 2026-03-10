import { NextRequest } from "next/server";
import { AuditAction, Prisma } from "@prisma/client";
import { ApiError } from "@/lib/server/errors";
import { requireRole } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { ok, withApiHandler } from "@/lib/server/response";
import { adminVariantUpdateSchema } from "@/lib/server/schemas";
import { writeAuditLog } from "@/lib/server/services/audit";
import { parseBody } from "@/lib/server/validation";

export const dynamic = "force-dynamic";

export const PATCH = withApiHandler(async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
  const user = await requireRole(request, ["STAFF", "ADMIN"]);
  const payload = await parseBody(request, adminVariantUpdateSchema);
  const { id } = await context.params;

  const existing = await prisma.productVariant.findUnique({
    where: { id },
    include: {
      prices: {
        orderBy: { startsAt: "desc" },
        take: 1,
      },
    },
  });

  if (!existing) {
    throw new ApiError(404, "NOT_FOUND", "Variant not found.");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const variant = await tx.productVariant.update({
      where: { id },
      data: {
        title: payload.title,
        size: payload.size,
        color: payload.color,
        attributes: payload.attributes as Prisma.InputJsonValue | undefined,
        isActive: payload.isActive,
      },
      include: {
        prices: {
          orderBy: { startsAt: "desc" },
          take: 1,
        },
      },
    });

    if (payload.price !== undefined) {
      await tx.price.updateMany({
        where: {
          variantId: id,
          isActive: true,
        },
        data: {
          isActive: false,
          endsAt: new Date(),
        },
      });

      await tx.price.create({
        data: {
          variantId: id,
          amount: payload.price,
          currency: payload.currency?.toUpperCase() ?? existing.prices[0]?.currency ?? "USD",
          isActive: true,
          startsAt: new Date(),
        },
      });
    }

    return tx.productVariant.findUnique({
      where: { id },
      include: {
        prices: {
          orderBy: { startsAt: "desc" },
          take: 1,
        },
      },
    });
  });

  await writeAuditLog({
    actorUserId: user.id,
    action: AuditAction.VARIANT_UPDATE,
    entityType: "ProductVariant",
    entityId: id,
    before: existing,
    after: updated,
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });

  return ok(updated);
});
