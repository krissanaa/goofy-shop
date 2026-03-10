import { NextRequest } from "next/server";
import { ApiError } from "@/lib/server/errors";
import { requireAuth } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { ok, withApiHandler } from "@/lib/server/response";
import { cartItemUpdateSchema } from "@/lib/server/schemas";
import { releaseStock, reserveStock } from "@/lib/server/services/inventory";
import { parseBody } from "@/lib/server/validation";

export const dynamic = "force-dynamic";

export const PATCH = withApiHandler(async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
  const user = await requireAuth(request);
  const payload = await parseBody(request, cartItemUpdateSchema);
  const { id } = await context.params;

  const item = await prisma.cartItem.findUnique({
    where: { id },
    include: {
      cart: true,
    },
  });

  if (!item || item.cart.userId !== user.id) {
    throw new ApiError(404, "NOT_FOUND", "Cart item not found.");
  }

  if (item.reservationId) {
    await releaseStock(item.reservationId);
  }

  const ttlMinutes = item.cart.dropEventId
    ? (await prisma.dropRule.findUnique({ where: { dropEventId: item.cart.dropEventId } }))?.reservationTtlMinutes ?? 5
    : 15;

  const reservation = await reserveStock({
    variantId: item.variantId,
    qty: payload.qty,
    userId: user.id,
    ttlMinutes,
    dropEventId: item.cart.dropEventId ?? undefined,
    idempotencyKey: `cart-item:${item.id}:qty:${payload.qty}`,
  });

  const updated = await prisma.cartItem.update({
    where: { id: item.id },
    data: {
      quantity: payload.qty,
      reservationId: reservation.id,
    },
  });

  return ok({
    itemId: updated.id,
    qty: updated.quantity,
    reservationId: updated.reservationId,
    reservationExpiresAt: reservation.expiresAt,
  });
});

export const DELETE = withApiHandler(async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
  const user = await requireAuth(request);
  const { id } = await context.params;

  const item = await prisma.cartItem.findUnique({
    where: { id },
    include: {
      cart: true,
    },
  });

  if (!item || item.cart.userId !== user.id) {
    throw new ApiError(404, "NOT_FOUND", "Cart item not found.");
  }

  if (item.reservationId) {
    await releaseStock(item.reservationId);
  }

  await prisma.cartItem.delete({
    where: { id: item.id },
  });

  return ok({
    deleted: true,
    releasedReservationId: item.reservationId,
  });
});
