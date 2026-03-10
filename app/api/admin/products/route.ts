import { NextRequest } from "next/server";
import { AuditAction } from "@prisma/client";
import { requireRole } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { ok, withApiHandler } from "@/lib/server/response";
import { adminProductCreateSchema } from "@/lib/server/schemas";
import { writeAuditLog } from "@/lib/server/services/audit";
import { parseBody } from "@/lib/server/validation";

export const dynamic = "force-dynamic";

export const POST = withApiHandler(async (request: NextRequest) => {
  const user = await requireRole(request, ["STAFF", "ADMIN"]);
  const payload = await parseBody(request, adminProductCreateSchema);

  const created = await prisma.product.create({
    data: {
      slug: payload.slug,
      name: payload.name,
      description: payload.description,
      brand: payload.brand,
      isDropProduct: payload.isDropProduct,
      categories: {
        create: payload.categoryIds.map((categoryId) => ({
          categoryId,
        })),
      },
    },
    include: {
      categories: true,
    },
  });

  await writeAuditLog({
    actorUserId: user.id,
    action: AuditAction.PRODUCT_CREATE,
    entityType: "Product",
    entityId: created.id,
    after: created,
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });

  return ok(created, { status: 201 });
});
