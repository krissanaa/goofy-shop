import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@/lib/server/errors";
import { withApiHandler } from "@/lib/server/response";
import { handleStripeEvent } from "@/lib/server/services/webhooks";
import { stripe } from "@/lib/server/stripe";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const POST = withApiHandler(async (request: NextRequest) => {
  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    throw new ApiError(400, "INVALID_REQUEST", "Missing stripe-signature header.");
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new ApiError(500, "INTERNAL_ERROR", "Missing STRIPE_WEBHOOK_SECRET configuration.");
  }

  const payload = await request.text();
  const event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);

  await handleStripeEvent(event);
  return NextResponse.json({ received: true });
});
