import { NextRequest } from "next/server";
import { ApiError } from "@/lib/server/errors";
import { requireAuth } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { applyRateLimit } from "@/lib/server/rate-limit";
import { getClientIp } from "@/lib/server/request";
import { ok, withApiHandler } from "@/lib/server/response";
import { cartItemCreateSchema } from "@/lib/server/schemas";
import { reserveStock, releaseStock } from "@/lib/server/services/inventory";
import { parseBody } from "@/lib/server/validation";

export const dynamic = "force-dynamic";

export const POST = withApiHandler(async (request: NextRequest) => {
  const user = await requireAuth(request);
  const payload = await parseBody(request, cartItemCreateSchema);
  const ip = getClientIp(request) ?? "unknown";

  applyRateLimit(`cart-item:${user.id}:${ip}`, 50, 60_000);

  const cart = await prisma.cart.findFirst({
    where: {
      id: payload.cartId,
      userId: user.id,
      status: "ACTIVE",
    },
  });

  if (!cart) {
    throw new ApiError(404, "NOT_FOUND", "Cart not found.");
  }

  if (payload.dropEventId && cart.dropEventId !== payload.dropEventId) {
    await prisma.cart.update({
      where: { id: cart.id },
      data: { dropEventId: payload.dropEventId },
    });
  }

  const variant = await prisma.productVariant.findFirst({
    where: {
      id: payload.variantId,
      isActive: true,
    },
    include: {
      inventory: true,
      prices: {
        where: {
          isActive: true,
          startsAt: { lte: new Date() },
          OR: [{ endsAt: null }, { endsAt: { gt: new Date() } }],
        },
        orderBy: { startsAt: "desc" },
        take: 1,
      },
    },
  });

  if (!variant || !variant.inventory) {
    throw new ApiError(404, "NOT_FOUND", "Variant not available.");
  }

  const activePrice = variant.prices[0];
  if (!activePrice) {
    throw new ApiError(409, "CONFLICT", "Active price not configured.");
  }

  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_variantId: {
        cartId: cart.id,
        variantId: payload.variantId,
      },
    },
  });

  if (existingItem?.reservationId) {
    await releaseStock(existingItem.reservationId);
  }

  const ttlMinutes = payload.dropEventId
    ? (await prisma.dropRule.findUnique({ where: { dropEventId: payload.dropEventId } }))?.reservationTtlMinutes ?? 5
    : 15;

  const reservation = await reserveStock({
    variantId: payload.variantId,
    qty: payload.qty,
    userId: user.id,
    ttlMinutes,
    dropEventId: payload.dropEventId,
    idempotencyKey: `cart:${cart.id}:variant:${payload.variantId}:qty:${payload.qty}`,
  });

  const item = await prisma.cartItem.upsert({
    where: {
      cartId_variantId: {
        cartId: cart.id,
        variantId: payload.variantId,
      },
    },
    create: {
      cartId: cart.id,
      variantId: payload.variantId,
      quantity: payload.qty,
      unitPrice: activePrice.amount,
      currency: activePrice.currency,
      reservationId: reservation.id,
    },
    update: {
      quantity: payload.qty,
      unitPrice: activePrice.amount,
      currency: activePrice.currency,
      reservationId: reservation.id,
    },
  });

  return ok({
    itemId: item.id,
    cartId: item.cartId,
    reservationId: reservation.id,
    reservationExpiresAt: reservation.expiresAt,
  });
});
