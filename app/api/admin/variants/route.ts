import { NextRequest } from "next/server";
import { AuditAction, Prisma } from "@prisma/client";
import { requireRole } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { ok, withApiHandler } from "@/lib/server/response";
import { adminVariantCreateSchema } from "@/lib/server/schemas";
import { writeAuditLog } from "@/lib/server/services/audit";
import { parseBody } from "@/lib/server/validation";

export const dynamic = "force-dynamic";

export const POST = withApiHandler(async (request: NextRequest) => {
  const user = await requireRole(request, ["STAFF", "ADMIN"]);
  const payload = await parseBody(request, adminVariantCreateSchema);

  const created = await prisma.$transaction(async (tx) => {
    const variant = await tx.productVariant.create({
      data: {
        productId: payload.productId,
        sku: payload.sku,
        title: payload.title,
        size: payload.size,
        color: payload.color,
        attributes: payload.attributes as Prisma.InputJsonValue | undefined,
      },
    });

    const inventory = await tx.inventory.create({
      data: {
        variantId: variant.id,
        onHand: payload.onHand,
        reserved: 0,
        available: payload.onHand,
      },
    });

    const price = await tx.price.create({
      data: {
        variantId: variant.id,
        amount: payload.price,
        currency: payload.currency.toUpperCase(),
        isActive: true,
      },
    });

    return {
      variant,
      inventory,
      price,
    };
  });

  await writeAuditLog({
    actorUserId: user.id,
    action: AuditAction.VARIANT_CREATE,
    entityType: "ProductVariant",
    entityId: created.variant.id,
    after: created,
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });

  return ok(created, { status: 201 });
});
