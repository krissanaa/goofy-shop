// @ts-nocheck
import { OrderStatus, PaymentProvider, PaymentStatus, ReservationStatus } from "@prisma/client";
import { ApiError } from "@/lib/server/errors";
import { getIdempotentResponse, storeIdempotentResponse } from "@/lib/server/idempotency";
import { prisma } from "@/lib/server/prisma";
import { enforceRiskPolicy } from "@/lib/server/services/risk";
import { stripe } from "@/lib/server/stripe";

interface CheckoutInput {
  cartId: string;
  userId: string;
  successUrl: string;
  cancelUrl: string;
  idempotencyKey: string;
  ipAddress?: string | null;
  userAgent?: string | null;
}

const makeOrderNumber = () => {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const dd = String(now.getUTCDate()).padStart(2, "0");
  const random = Math.floor(Math.random() * 9000 + 1000);
  return `GS-${yyyy}${mm}${dd}-${random}`;
};

export const createCheckoutSession = async (input: CheckoutInput) => {
  if (!input.idempotencyKey) {
    throw new ApiError(400, "INVALID_REQUEST", "idempotencyKey is required.");
  }

  const cached = await getIdempotentResponse("checkout", input.idempotencyKey);
  if (cached?.responseBody && typeof cached.responseBody === "object") {
    return cached.responseBody as {
      orderId: string;
      orderNumber: string;
      checkoutSessionId: string;
      checkoutUrl: string | null;
    };
  }

  await enforceRiskPolicy({
    userId: input.userId,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  });

  const cart = await prisma.cart.findFirst({
    where: {
      id: input.cartId,
      userId: input.userId,
      status: "ACTIVE",
    },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: true,
            },
          },
          reservation: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new ApiError(400, "INVALID_REQUEST", "Cart is empty or unavailable.");
  }

  const expiredReservation = cart.items.find(
    (item) =>
      item.reservation &&
      (item.reservation.status !== ReservationStatus.ACTIVE || item.reservation.expiresAt <= new Date()),
  );
  if (expiredReservation) {
    throw new ApiError(409, "RESERVATION_EXPIRED", "One or more cart reservations have expired.");
  }

  const subtotal = cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shippingTotal = 0;
  const taxTotal = 0;
  const discountTotal = 0;
  const grandTotal = subtotal + shippingTotal + taxTotal - discountTotal;
  const orderNumber = makeOrderNumber();

  const order = await prisma.$transaction(async (tx) => {
    const created = await tx.order.create({
      data: {
        orderNumber,
        userId: input.userId,
        cartId: cart.id,
        status: OrderStatus.PENDING,
        currency: cart.currency,
        subtotal,
        shippingTotal,
        taxTotal,
        discountTotal,
        grandTotal,
        email: "customer@example.com",
        idempotencyKey: input.idempotencyKey,
        dropEventId: cart.dropEventId,
        items: {
          create: cart.items.map((item) => ({
            variantId: item.variantId,
            productName: item.variant.product.name,
            variantTitle: item.variant.title,
            sku: item.variant.sku,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            lineTotal: item.unitPrice * item.quantity,
          })),
        },
      },
    });

    const reservationIds = cart.items
      .map((item) => item.reservationId)
      .filter((value): value is string => Boolean(value));

    if (reservationIds.length > 0) {
      await tx.stockReservation.updateMany({
        where: {
          id: { in: reservationIds },
          status: ReservationStatus.ACTIVE,
        },
        data: {
          orderId: created.id,
        },
      });
    }

    return created;
  });

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    success_url: input.successUrl,
    cancel_url: input.cancelUrl,
    customer_email: undefined,
    metadata: {
      orderId: order.id,
      orderNumber: order.orderNumber,
      userId: input.userId,
    },
    line_items: cart.items.map((item) => ({
      quantity: item.quantity,
      price_data: {
        currency: cart.currency.toLowerCase(),
        unit_amount: item.unitPrice,
        product_data: {
          name: item.variant.product.name,
          metadata: {
            sku: item.variant.sku,
            variantId: item.variantId,
          },
        },
      },
    })),
  });

  await prisma.payment.create({
    data: {
      orderId: order.id,
      provider: PaymentProvider.STRIPE,
      checkoutSessionId: session.id,
      paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
      status: PaymentStatus.PENDING,
      amount: order.grandTotal,
      currency: order.currency,
      idempotencyKey: input.idempotencyKey,
      metadata: {
        stripeSessionId: session.id,
      },
    },
  });

  await prisma.cart.update({
    where: { id: cart.id },
    data: {
      status: "CHECKED_OUT",
    },
  });

  const response = {
    orderId: order.id,
    orderNumber: order.orderNumber,
    checkoutSessionId: session.id,
    checkoutUrl: session.url,
  };

  await storeIdempotentResponse({
    scope: "checkout",
    key: input.idempotencyKey,
    payload: {
      cartId: input.cartId,
      userId: input.userId,
    },
    responseCode: 200,
    responseBody: response,
    ttlMinutes: 30,
  });

  return response;
};
