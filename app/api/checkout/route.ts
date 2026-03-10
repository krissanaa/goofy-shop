import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { applyRateLimit } from "@/lib/server/rate-limit";
import { getClientIp } from "@/lib/server/request";
import { ok, withApiHandler } from "@/lib/server/response";
import { checkoutSchema } from "@/lib/server/schemas";
import { createCheckoutSession } from "@/lib/server/services/checkout";
import { parseBody } from "@/lib/server/validation";

export const dynamic = "force-dynamic";

export const POST = withApiHandler(async (request: NextRequest) => {
  const user = await requireAuth(request);
  const payload = await parseBody(request, checkoutSchema);
  const ip = getClientIp(request) ?? "unknown";

  applyRateLimit(`checkout:${user.id}:${ip}`, 12, 60_000);

  const checkout = await createCheckoutSession({
    cartId: payload.cartId,
    userId: user.id,
    successUrl: payload.successUrl,
    cancelUrl: payload.cancelUrl,
    idempotencyKey: payload.idempotencyKey,
    ipAddress: ip,
    userAgent: request.headers.get("user-agent"),
  });

  return ok(checkout);
});
