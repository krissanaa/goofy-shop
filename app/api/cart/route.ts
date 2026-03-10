import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { ok, withApiHandler } from "@/lib/server/response";
import { cartCreateSchema } from "@/lib/server/schemas";
import { parseBody } from "@/lib/server/validation";

export const dynamic = "force-dynamic";

export const POST = withApiHandler(async (request: NextRequest) => {
  const user = await requireAuth(request);
  const payload = await parseBody(request, cartCreateSchema);

  if (payload.cartId) {
    const existingById = await prisma.cart.findFirst({
      where: {
        id: payload.cartId,
        userId: user.id,
      },
      include: {
        items: true,
      },
    });

    if (existingById) {
      return ok(existingById);
    }
  }

  const existing = await prisma.cart.findFirst({
    where: {
      userId: user.id,
      status: "ACTIVE",
      dropEventId: null,
    },
    orderBy: { updatedAt: "desc" },
    include: {
      items: true,
    },
  });

  if (existing) {
    return ok(existing);
  }

  const created = await prisma.cart.create({
    data: {
      userId: user.id,
      status: "ACTIVE",
      currency: "USD",
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7),
    },
    include: { items: true },
  });

  return ok(created, { status: 201 });
});
