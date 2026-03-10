import { NextRequest } from "next/server";
import { AuditAction } from "@prisma/client";
import { ApiError } from "@/lib/server/errors";
import { requireRole } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { ok, withApiHandler } from "@/lib/server/response";
import { inventoryAdjustSchema } from "@/lib/server/schemas";
import { writeAuditLog } from "@/lib/server/services/audit";
import { parseBody } from "@/lib/server/validation";

export const dynamic = "force-dynamic";

export const POST = withApiHandler(async (request: NextRequest) => {
  const user = await requireRole(request, ["STAFF", "ADMIN"]);
  const payload = await parseBody(request, inventoryAdjustSchema);

  const result = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`
      SELECT 1
      FROM "Inventory"
      WHERE "variantId" = ${payload.variantId}
      FOR UPDATE
    `;

    const inventory = await tx.inventory.findUnique({
      where: { variantId: payload.variantId },
    });

    if (!inventory) {
      throw new ApiError(404, "NOT_FOUND", "Inventory row not found for this variant.");
    }

    const nextOnHand = inventory.onHand + payload.delta;
    if (nextOnHand < 0) {
      throw new ApiError(409, "CONFLICT", "Inventory onHand cannot become negative.");
    }

    const nextAvailable = nextOnHand - inventory.reserved;
    if (nextAvailable < 0) {
      throw new ApiError(409, "CONFLICT", "Inventory available cannot become negative.");
    }

    const updated = await tx.inventory.update({
      where: { id: inventory.id },
      data: {
        onHand: nextOnHand,
        available: nextAvailable,
      },
    });

    const adjustment = await tx.inventoryAdjustment.create({
      data: {
        inventoryId: inventory.id,
        variantId: payload.variantId,
        delta: payload.delta,
        reason: payload.reason,
        notes: payload.notes,
        createdById: user.id,
        referenceType: "ADMIN_ADJUSTMENT",
      },
    });

    return { updated, adjustment };
  });

  await writeAuditLog({
    actorUserId: user.id,
    action: AuditAction.INVENTORY_ADJUST,
    entityType: "Inventory",
    entityId: result.updated.id,
    after: result,
    reason: payload.notes,
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });

  return ok(result);
});
