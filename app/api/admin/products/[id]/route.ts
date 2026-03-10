import { NextRequest } from "next/server";
import { AuditAction } from "@prisma/client";
import { ApiError } from "@/lib/server/errors";
import { requireRole } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { ok, withApiHandler } from "@/lib/server/response";
import { adminProductUpdateSchema } from "@/lib/server/schemas";
import { writeAuditLog } from "@/lib/server/services/audit";
import { parseBody } from "@/lib/server/validation";

export const dynamic = "force-dynamic";

export const PATCH = withApiHandler(async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
  const user = await requireRole(request, ["STAFF", "ADMIN"]);
  const payload = await parseBody(request, adminProductUpdateSchema);
  const { id } = await context.params;

  const existing = await prisma.product.findUnique({
    where: { id },
    include: { categories: true },
  });

  if (!existing) {
    throw new ApiError(404, "NOT_FOUND", "Product not found.");
  }

  const updated = await prisma.$transaction(async (tx) => {
    if (payload.categoryIds) {
      await tx.productCategory.deleteMany({
        where: { productId: id },
      });
      if (payload.categoryIds.length > 0) {
        await tx.productCategory.createMany({
          data: payload.categoryIds.map((categoryId) => ({
            productId: id,
            categoryId,
          })),
        });
      }
    }

    return tx.product.update({
      where: { id },
      data: {
        slug: payload.slug,
        name: payload.name,
        description: payload.description,
        brand: payload.brand,
        isDropProduct: payload.isDropProduct,
      },
      include: { categories: true },
    });
  });

  await writeAuditLog({
    actorUserId: user.id,
    action: AuditAction.PRODUCT_UPDATE,
    entityType: "Product",
    entityId: id,
    before: existing,
    after: updated,
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });

  return ok(updated);
});
