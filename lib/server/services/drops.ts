import { DropEntryStatus, OrderStatus, ReservationStatus } from "@prisma/client";
import { randomUUID } from "crypto";
import { ApiError } from "@/lib/server/errors";
import { prisma } from "@/lib/server/prisma";
import { createCheckoutSession } from "@/lib/server/services/checkout";
import { releaseStock, reserveStock } from "@/lib/server/services/inventory";
import { enforceRiskPolicy } from "@/lib/server/services/risk";

const assertDropLive = (drop: { startsAt: Date; endsAt: Date }) => {
  const now = new Date();
  if (now < drop.startsAt) {
    throw new ApiError(409, "DROP_NOT_STARTED", "This drop has not started yet.");
  }
  if (now > drop.endsAt) {
    throw new ApiError(409, "SOLD_OUT", "This drop has ended.");
  }
};

export const getActiveDrop = async () => {
  const now = new Date();
  return prisma.dropEvent.findFirst({
    where: {
      status: "LIVE",
      startsAt: { lte: now },
      endsAt: { gt: now },
    },
    include: {
      rule: true,
      variants: {
        include: {
          variant: {
            include: {
              product: true,
              inventory: true,
            },
          },
        },
      },
    },
    orderBy: { startsAt: "asc" },
  });
};

export const enterDropQueue = async (params: {
  dropEventId: string;
  userId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}) => {
  const drop = await prisma.dropEvent.findUnique({
    where: { id: params.dropEventId },
    include: { rule: true },
  });

  if (!drop) {
    throw new ApiError(404, "NOT_FOUND", "Drop not found.");
  }

  assertDropLive(drop);

  if (drop.rule?.botProtectionEnabled) {
    await enforceRiskPolicy({
      userId: params.userId,
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      dropEventId: params.dropEventId,
    });
  }

  const status = drop.rule?.queueEnabled ? DropEntryStatus.WAITING : DropEntryStatus.ALLOWED;
  const entryToken = randomUUID();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

  const entry = await prisma.dropEntry.upsert({
    where: {
      dropEventId_userId: {
        dropEventId: params.dropEventId,
        userId: params.userId,
      },
    },
    create: {
      dropEventId: params.dropEventId,
      userId: params.userId,
      status,
      entryToken,
      expiresAt,
      ipAddress: params.ipAddress ?? undefined,
      userAgent: params.userAgent ?? undefined,
    },
    update: {
      status,
      entryToken,
      expiresAt,
      ipAddress: params.ipAddress ?? undefined,
      userAgent: params.userAgent ?? undefined,
    },
  });

  return entry;
};

const assertQueueIfRequired = async (params: { dropEventId: string; userId: string; entryToken?: string }) => {
  const drop = await prisma.dropEvent.findUnique({
    where: { id: params.dropEventId },
    include: { rule: true },
  });

  if (!drop) {
    throw new ApiError(404, "NOT_FOUND", "Drop not found.");
  }

  assertDropLive(drop);

  if (!drop.rule?.queueEnabled) {
    return;
  }

  if (!params.entryToken) {
    throw new ApiError(409, "QUEUE_REQUIRED", "Queue entry token is required.");
  }

  const entry = await prisma.dropEntry.findFirst({
    where: {
      dropEventId: params.dropEventId,
      userId: params.userId,
      entryToken: params.entryToken,
      status: { in: [DropEntryStatus.ALLOWED, DropEntryStatus.WAITING] },
      expiresAt: { gt: new Date() },
    },
  });

  if (!entry) {
    throw new ApiError(409, "QUEUE_REQUIRED", "Queue token is missing or expired.");
  }

  if (entry.status === DropEntryStatus.WAITING) {
    // In a production queue, this transition is controlled by allocator workers.
    await prisma.dropEntry.update({
      where: { id: entry.id },
      data: { status: DropEntryStatus.ALLOWED, allowedAt: new Date() },
    });
  }
};

const assertDropLimit = async (params: {
  dropEventId: string;
  userId: string;
  variantId: string;
  requestedQty: number;
}) => {
  const dropVariant = await prisma.dropVariant.findFirst({
    where: {
      dropEventId: params.dropEventId,
      variantId: params.variantId,
    },
    include: {
      dropEvent: { include: { rule: true } },
    },
  });

  if (!dropVariant) {
    throw new ApiError(404, "NOT_FOUND", "Variant is not part of this drop.");
  }

  const defaultLimit = dropVariant.dropEvent.rule?.maxUnitsPerUser ?? 1;
  const perUserLimit = dropVariant.perUserLimit ?? defaultLimit;

  const [paidQty, reservedQty] = await Promise.all([
    prisma.orderItem.aggregate({
      where: {
        variantId: params.variantId,
        order: {
          userId: params.userId,
          dropEventId: params.dropEventId,
          status: { in: [OrderStatus.PAID, OrderStatus.FULFILLING, OrderStatus.SHIPPED, OrderStatus.COMPLETED] },
        },
      },
      _sum: { quantity: true },
    }),
    prisma.stockReservation.aggregate({
      where: {
        variantId: params.variantId,
        userId: params.userId,
        dropEventId: params.dropEventId,
        status: ReservationStatus.ACTIVE,
        expiresAt: { gt: new Date() },
      },
      _sum: { quantity: true },
    }),
  ]);

  const alreadyUsed = (paidQty._sum.quantity ?? 0) + (reservedQty._sum.quantity ?? 0);
  if (alreadyUsed + params.requestedQty > perUserLimit) {
    throw new ApiError(409, "LIMIT_EXCEEDED", "Purchase limit reached for this drop.");
  }
};

export const reserveDropStock = async (params: {
  dropEventId: string;
  userId: string;
  variantId: string;
  qty: number;
  entryToken?: string;
  idempotencyKey?: string;
}) => {
  const drop = await prisma.dropEvent.findUnique({
    where: { id: params.dropEventId },
    include: { rule: true },
  });

  if (!drop) {
    throw new ApiError(404, "NOT_FOUND", "Drop not found.");
  }

  assertDropLive(drop);
  await assertQueueIfRequired({
    dropEventId: params.dropEventId,
    userId: params.userId,
    entryToken: params.entryToken,
  });
  await assertDropLimit({
    dropEventId: params.dropEventId,
    userId: params.userId,
    variantId: params.variantId,
    requestedQty: params.qty,
  });

  return reserveStock({
    variantId: params.variantId,
    qty: params.qty,
    userId: params.userId,
    ttlMinutes: drop.rule?.reservationTtlMinutes ?? 5,
    dropEventId: params.dropEventId,
    idempotencyKey: params.idempotencyKey,
  });
};

export const releaseDropReservation = async (params: {
  dropEventId: string;
  userId: string;
  reservationId: string;
}) => {
  const reservation = await prisma.stockReservation.findFirst({
    where: {
      id: params.reservationId,
      dropEventId: params.dropEventId,
      userId: params.userId,
    },
  });

  if (!reservation) {
    throw new ApiError(404, "NOT_FOUND", "Reservation not found.");
  }

  return releaseStock(reservation.id);
};

export const checkoutDropReservation = async (params: {
  dropEventId: string;
  userId: string;
  reservationId: string;
  successUrl: string;
  cancelUrl: string;
  idempotencyKey: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}) => {
  const reservation = await prisma.stockReservation.findFirst({
    where: {
      id: params.reservationId,
      dropEventId: params.dropEventId,
      userId: params.userId,
      status: ReservationStatus.ACTIVE,
      expiresAt: { gt: new Date() },
    },
    include: {
      variant: {
        include: {
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
      },
    },
  });

  if (!reservation) {
    throw new ApiError(409, "RESERVATION_EXPIRED", "Reservation is invalid or expired.");
  }

  const activePrice = reservation.variant.prices[0];
  if (!activePrice) {
    throw new ApiError(409, "CONFLICT", "Active price not found for reserved variant.");
  }

  const cart = await prisma.cart.create({
    data: {
      userId: params.userId,
      dropEventId: params.dropEventId,
      currency: activePrice.currency,
      status: "ACTIVE",
      items: {
        create: {
          variantId: reservation.variantId,
          quantity: reservation.quantity,
          unitPrice: activePrice.amount,
          currency: activePrice.currency,
          reservationId: reservation.id,
        },
      },
    },
  });

  return createCheckoutSession({
    cartId: cart.id,
    userId: params.userId,
    successUrl: params.successUrl,
    cancelUrl: params.cancelUrl,
    idempotencyKey: params.idempotencyKey,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
  });
};
