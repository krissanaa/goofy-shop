import { NextRequest } from "next/server";
import { ApiError } from "@/lib/server/errors";
import { requireAuth } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { ok, withApiHandler } from "@/lib/server/response";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
  const user = await requireAuth(request);
  const { id } = await context.params;

  const order = await prisma.order.findFirst({
    where: {
      id,
      userId: user.id,
    },
    include: {
      items: true,
      payments: {
        orderBy: { createdAt: "desc" },
      },
      shipments: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!order) {
    throw new ApiError(404, "NOT_FOUND", "Order not found.");
  }

  return ok({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    currency: order.currency,
    subtotal: order.subtotal,
    taxTotal: order.taxTotal,
    shippingTotal: order.shippingTotal,
    discountTotal: order.discountTotal,
    grandTotal: order.grandTotal,
    createdAt: order.createdAt,
    paidAt: order.paidAt,
    items: order.items.map((item) => ({
      id: item.id,
      sku: item.sku,
      productName: item.productName,
      variantTitle: item.variantTitle,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      lineTotal: item.lineTotal,
    })),
    payments: order.payments.map((payment) => ({
      id: payment.id,
      status: payment.status,
      provider: payment.provider,
      checkoutSessionId: payment.checkoutSessionId,
      paidAt: payment.paidAt,
      failureMessage: payment.failureMessage,
    })),
    shipments: order.shipments.map((shipment) => ({
      id: shipment.id,
      status: shipment.status,
      carrier: shipment.carrier,
      trackingNumber: shipment.trackingNumber,
      shippedAt: shipment.shippedAt,
      deliveredAt: shipment.deliveredAt,
    })),
  });
});
