import { NextRequest } from "next/server";
import { AuditAction, OrderStatus, ShipmentStatus } from "@prisma/client";
import { ApiError } from "@/lib/server/errors";
import { requireRole } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { ok, withApiHandler } from "@/lib/server/response";
import { adminOrderStatusSchema } from "@/lib/server/schemas";
import { writeAuditLog } from "@/lib/server/services/audit";
import { releaseOrderReservations } from "@/lib/server/services/inventory";
import { parseBody } from "@/lib/server/validation";

export const dynamic = "force-dynamic";

export const PATCH = withApiHandler(async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
  const user = await requireRole(request, ["STAFF", "ADMIN"]);
  const payload = await parseBody(request, adminOrderStatusSchema);
  const { id } = await context.params;

  const existing = await prisma.order.findUnique({
    where: { id },
  });
  if (!existing) {
    throw new ApiError(404, "NOT_FOUND", "Order not found.");
  }

  const updated = await prisma.$transaction(async (tx) => {
    const order = await tx.order.update({
      where: { id },
      data: {
        status: payload.status as OrderStatus,
        canceledAt: payload.status === "CANCELED" ? new Date() : null,
        refundedAt: payload.status === "REFUNDED" ? new Date() : null,
        fulfilledAt: payload.status === "COMPLETED" ? new Date() : existing.fulfilledAt,
        cancelReason: payload.reason,
      },
    });

    if (payload.trackingNumber) {
      const currentShipment = await tx.shipment.findFirst({
        where: { orderId: id },
        orderBy: { createdAt: "desc" },
      });

      if (currentShipment) {
        await tx.shipment.update({
          where: { id: currentShipment.id },
          data: {
            trackingNumber: payload.trackingNumber,
            status: payload.status === "SHIPPED" ? ShipmentStatus.IN_TRANSIT : currentShipment.status,
            shippedAt: payload.status === "SHIPPED" ? new Date() : currentShipment.shippedAt,
          },
        });
      } else {
        await tx.shipment.create({
          data: {
            orderId: id,
            trackingNumber: payload.trackingNumber,
            status: payload.status === "SHIPPED" ? ShipmentStatus.IN_TRANSIT : ShipmentStatus.LABEL_CREATED,
            shippedAt: payload.status === "SHIPPED" ? new Date() : null,
          },
        });
      }
    }

    return order;
  });

  if (payload.status === "CANCELED") {
    await releaseOrderReservations(id);
  }

  await writeAuditLog({
    actorUserId: user.id,
    action: AuditAction.ORDER_STATUS_CHANGE,
    entityType: "Order",
    entityId: id,
    before: existing,
    after: updated,
    reason: payload.reason,
    ipAddress: request.headers.get("x-forwarded-for"),
    userAgent: request.headers.get("user-agent"),
  });

  return ok(updated);
});
