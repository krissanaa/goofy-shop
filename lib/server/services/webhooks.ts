// @ts-nocheck
import { OrderStatus, PaymentStatus } from "@prisma/client";
import Stripe from "stripe";
import { ApiError } from "@/lib/server/errors";
import { getIdempotentResponse, storeIdempotentResponse } from "@/lib/server/idempotency";
import { prisma } from "@/lib/server/prisma";
import { commitStock, releaseOrderReservations } from "@/lib/server/services/inventory";

const markStripeEventProcessed = async (eventId: string) => {
  await storeIdempotentResponse({
    scope: "stripe_event",
    key: eventId,
    responseCode: 200,
    responseBody: { processed: true },
    ttlMinutes: 60 * 24 * 7,
  });
};

const isStripeEventProcessed = async (eventId: string) => {
  const existing = await getIdempotentResponse("stripe_event", eventId);
  return Boolean(existing);
};

const getOrderIdFromSession = (session: Stripe.Checkout.Session): string | null => {
  if (!session.metadata) {
    return null;
  }

  return session.metadata.orderId ?? null;
};

export const handleStripeEvent = async (event: Stripe.Event) => {
  if (await isStripeEventProcessed(event.id)) {
    return { deduplicated: true };
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = getOrderIdFromSession(session);

      if (!orderId) {
        throw new ApiError(400, "INVALID_REQUEST", "checkout.session.completed is missing order metadata.");
      }

      await prisma.$transaction(async (tx) => {
        await tx.order.updateMany({
          where: {
            id: orderId,
            status: OrderStatus.PENDING,
          },
          data: {
            status: OrderStatus.PAID,
            paidAt: new Date(),
          },
        });

        await tx.payment.updateMany({
          where: { checkoutSessionId: session.id },
          data: {
            status: PaymentStatus.SUCCEEDED,
            paidAt: new Date(),
            paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
            metadata: {
              eventId: event.id,
            },
          },
        });
      });

      await commitStock(orderId);
      await markStripeEventProcessed(event.id);

      return { orderId, status: "PAID" };
    }

    case "checkout.session.expired": {
      const session = event.data.object as Stripe.Checkout.Session;
      const orderId = getOrderIdFromSession(session);
      if (!orderId) {
        await markStripeEventProcessed(event.id);
        return { skipped: true };
      }

      await prisma.$transaction(async (tx) => {
        await tx.order.updateMany({
          where: {
            id: orderId,
            status: OrderStatus.PENDING,
          },
          data: {
            status: OrderStatus.CANCELED,
            canceledAt: new Date(),
            cancelReason: "Checkout session expired",
          },
        });

        await tx.payment.updateMany({
          where: { checkoutSessionId: session.id },
          data: {
            status: PaymentStatus.EXPIRED,
            failureMessage: "Stripe checkout session expired",
          },
        });
      });

      await releaseOrderReservations(orderId);
      await markStripeEventProcessed(event.id);
      return { orderId, status: "CANCELED" };
    }

    case "payment_intent.payment_failed": {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      const payment = await prisma.payment.findFirst({
        where: {
          paymentIntentId: paymentIntent.id,
        },
        select: {
          orderId: true,
        },
      });

      if (!payment) {
        await markStripeEventProcessed(event.id);
        return { skipped: true };
      }

      await prisma.$transaction(async (tx) => {
        await tx.payment.updateMany({
          where: { paymentIntentId: paymentIntent.id },
          data: {
            status: PaymentStatus.FAILED,
            failureCode: paymentIntent.last_payment_error?.code ?? undefined,
            failureMessage: paymentIntent.last_payment_error?.message ?? "Payment failed",
          },
        });

        await tx.order.updateMany({
          where: {
            id: payment.orderId,
            status: OrderStatus.PENDING,
          },
          data: {
            status: OrderStatus.CANCELED,
            canceledAt: new Date(),
            cancelReason: "Payment failed",
          },
        });
      });

      await releaseOrderReservations(payment.orderId);
      await markStripeEventProcessed(event.id);
      return { orderId: payment.orderId, status: "CANCELED" };
    }

    case "charge.refunded": {
      const charge = event.data.object as Stripe.Charge;
      if (!charge.payment_intent || typeof charge.payment_intent !== "string") {
        await markStripeEventProcessed(event.id);
        return { skipped: true };
      }
      const paymentIntentId = charge.payment_intent;

      const payment = await prisma.payment.findFirst({
        where: {
          paymentIntentId,
        },
        select: { orderId: true },
      });

      if (!payment) {
        await markStripeEventProcessed(event.id);
        return { skipped: true };
      }

      await prisma.$transaction(async (tx) => {
        await tx.payment.updateMany({
          where: { paymentIntentId },
          data: {
            status: PaymentStatus.REFUNDED,
            refundedAt: new Date(),
          },
        });

        await tx.order.updateMany({
          where: {
            id: payment.orderId,
            status: { in: [OrderStatus.PAID, OrderStatus.FULFILLING, OrderStatus.SHIPPED, OrderStatus.COMPLETED] },
          },
          data: {
            status: OrderStatus.REFUNDED,
            refundedAt: new Date(),
          },
        });
      });

      await markStripeEventProcessed(event.id);
      return { orderId: payment.orderId, status: "REFUNDED" };
    }

    default:
      await markStripeEventProcessed(event.id);
      return { ignored: true };
  }
};
