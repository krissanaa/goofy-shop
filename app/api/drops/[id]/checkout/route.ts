import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { applyRateLimit } from "@/lib/server/rate-limit";
import { getClientIp } from "@/lib/server/request";
import { ok, withApiHandler } from "@/lib/server/response";
import { dropCheckoutSchema } from "@/lib/server/schemas";
import { checkoutDropReservation } from "@/lib/server/services/drops";
import { parseBody } from "@/lib/server/validation";

export const dynamic = "force-dynamic";

export const POST = withApiHandler(async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
  const user = await requireAuth(request);
  const payload = await parseBody(request, dropCheckoutSchema);
  const { id } = await context.params;
  const ip = getClientIp(request) ?? "unknown";

  applyRateLimit(`drop-checkout:${id}:${user.id}:${ip}`, 8, 60_000);

  const result = await checkoutDropReservation({
    dropEventId: id,
    userId: user.id,
    reservationId: payload.reservationId,
    successUrl: payload.successUrl,
    cancelUrl: payload.cancelUrl,
    idempotencyKey: payload.idempotencyKey,
    ipAddress: ip,
    userAgent: request.headers.get("user-agent"),
  });

  return ok(result);
});
