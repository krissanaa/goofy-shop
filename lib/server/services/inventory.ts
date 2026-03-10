import { InventoryAdjustmentReason, Prisma, ReservationStatus } from "@prisma/client";
import { ApiError } from "@/lib/server/errors";
import { prisma } from "@/lib/server/prisma";

interface ReserveStockInput {
  variantId: string;
  qty: number;
  userId: string;
  ttlMinutes: number;
  dropEventId?: string;
  orderId?: string;
  idempotencyKey?: string;
}

const releaseExpiredForVariant = async (tx: Prisma.TransactionClient, variantId: string, now: Date) => {
  const expired = await tx.stockReservation.findMany({
    where: {
      variantId,
      status: ReservationStatus.ACTIVE,
      expiresAt: { lt: now },
    },
    orderBy: { createdAt: "asc" },
  });

  if (expired.length === 0) {
    return 0;
  }

  const expiredQty = expired.reduce((sum, reservation) => sum + reservation.quantity, 0);
  const inventory = await tx.inventory.findUnique({
    where: { variantId },
    select: { id: true, onHand: true, reserved: true },
  });

  if (!inventory) {
    return 0;
  }

  const nextReserved = Math.max(0, inventory.reserved - expiredQty);
  await tx.inventory.update({
    where: { id: inventory.id },
    data: {
      reserved: nextReserved,
      available: inventory.onHand - nextReserved,
    },
  });

  await tx.stockReservation.updateMany({
    where: { id: { in: expired.map((r) => r.id) } },
    data: {
      status: ReservationStatus.EXPIRED,
      releasedAt: now,
    },
  });

  return expired.length;
};

export const reserveStock = async (input: ReserveStockInput) => {
  if (!Number.isInteger(input.qty) || input.qty <= 0) {
    throw new ApiError(400, "INVALID_REQUEST", "Quantity must be a positive integer.");
  }

  return prisma.$transaction(async (tx) => {
    if (input.idempotencyKey) {
      const existing = await tx.stockReservation.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
      });

      if (existing && existing.status === ReservationStatus.ACTIVE) {
        return existing;
      }
    }

    await tx.$executeRaw`
      SELECT 1
      FROM "Inventory"
      WHERE "variantId" = ${input.variantId}
      FOR UPDATE
    `;

    const now = new Date();
    await releaseExpiredForVariant(tx, input.variantId, now);

    const inventory = await tx.inventory.findUnique({
      where: { variantId: input.variantId },
    });

    if (!inventory || inventory.available < input.qty) {
      throw new ApiError(409, "SOLD_OUT", "Insufficient available inventory.");
    }

    const nextReserved = inventory.reserved + input.qty;
    await tx.inventory.update({
      where: { id: inventory.id },
      data: {
        reserved: nextReserved,
        available: inventory.onHand - nextReserved,
      },
    });

    return tx.stockReservation.create({
      data: {
        variantId: input.variantId,
        userId: input.userId,
        orderId: input.orderId,
        dropEventId: input.dropEventId,
        quantity: input.qty,
        status: ReservationStatus.ACTIVE,
        expiresAt: new Date(now.getTime() + input.ttlMinutes * 60 * 1000),
        idempotencyKey: input.idempotencyKey,
      },
    });
  });
};

export const releaseStock = async (reservationId: string, reason: InventoryAdjustmentReason = "DROP_RELEASE") => {
  return prisma.$transaction(async (tx) => {
    const reservation = await tx.stockReservation.findUnique({
      where: { id: reservationId },
    });

    if (!reservation) {
      throw new ApiError(404, "NOT_FOUND", "Reservation not found.");
    }

    if (reservation.status !== ReservationStatus.ACTIVE) {
      return reservation;
    }

    await tx.$executeRaw`
      SELECT 1
      FROM "Inventory"
      WHERE "variantId" = ${reservation.variantId}
      FOR UPDATE
    `;

    const inventory = await tx.inventory.findUnique({
      where: { variantId: reservation.variantId },
    });

    if (!inventory) {
      throw new ApiError(409, "CONFLICT", "Inventory row missing for reservation.");
    }

    const nextReserved = Math.max(0, inventory.reserved - reservation.quantity);
    await tx.inventory.update({
      where: { id: inventory.id },
      data: {
        reserved: nextReserved,
        available: inventory.onHand - nextReserved,
      },
    });

    const updated = await tx.stockReservation.update({
      where: { id: reservation.id },
      data: {
        status: ReservationStatus.RELEASED,
        releasedAt: new Date(),
      },
    });

    await tx.inventoryAdjustment.create({
      data: {
        inventoryId: inventory.id,
        variantId: reservation.variantId,
        delta: 0,
        reason,
        referenceType: "RESERVATION_RELEASE",
        referenceId: reservation.id,
      },
    });

    return updated;
  });
};

export const commitStock = async (orderId: string) => {
  return prisma.$transaction(async (tx) => {
    const reservations = await tx.stockReservation.findMany({
      where: {
        orderId,
        status: ReservationStatus.ACTIVE,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: "asc" },
    });

    if (reservations.length === 0) {
      throw new ApiError(409, "RESERVATION_EXPIRED", "No active reservations available to commit.");
    }

    for (const reservation of reservations) {
      await tx.$executeRaw`
        SELECT 1
        FROM "Inventory"
        WHERE "variantId" = ${reservation.variantId}
        FOR UPDATE
      `;

      const inventory = await tx.inventory.findUnique({
        where: { variantId: reservation.variantId },
      });

      if (!inventory) {
        throw new ApiError(409, "CONFLICT", "Inventory row missing during commit.");
      }

      if (inventory.reserved < reservation.quantity || inventory.onHand < reservation.quantity) {
        throw new ApiError(409, "CONFLICT", "Inventory mismatch during stock commit.");
      }

      const nextOnHand = inventory.onHand - reservation.quantity;
      const nextReserved = inventory.reserved - reservation.quantity;

      await tx.inventory.update({
        where: { id: inventory.id },
        data: {
          onHand: nextOnHand,
          reserved: nextReserved,
          available: nextOnHand - nextReserved,
        },
      });

      await tx.stockReservation.update({
        where: { id: reservation.id },
        data: {
          status: ReservationStatus.COMMITTED,
          committedAt: new Date(),
        },
      });

      await tx.inventoryAdjustment.create({
        data: {
          inventoryId: inventory.id,
          variantId: reservation.variantId,
          delta: -reservation.quantity,
          reason: InventoryAdjustmentReason.PURCHASE,
          referenceType: "ORDER",
          referenceId: orderId,
        },
      });
    }

    return { committed: reservations.length };
  });
};

export const releaseOrderReservations = async (orderId: string) => {
  const reservations = await prisma.stockReservation.findMany({
    where: {
      orderId,
      status: ReservationStatus.ACTIVE,
    },
    select: { id: true },
  });

  for (const reservation of reservations) {
    await releaseStock(reservation.id, InventoryAdjustmentReason.CANCELED_ORDER);
  }

  return { released: reservations.length };
};
