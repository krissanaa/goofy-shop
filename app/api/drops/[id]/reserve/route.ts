import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { applyRateLimit } from "@/lib/server/rate-limit";
import { getClientIp } from "@/lib/server/request";
import { ok, withApiHandler } from "@/lib/server/response";
import { dropReserveSchema } from "@/lib/server/schemas";
import { reserveDropStock } from "@/lib/server/services/drops";
import { parseBody } from "@/lib/server/validation";

export const dynamic = "force-dynamic";

export const POST = withApiHandler(async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
  const user = await requireAuth(request);
  const payload = await parseBody(request, dropReserveSchema);
  const { id } = await context.params;
  const ip = getClientIp(request) ?? "unknown";

  applyRateLimit(`drop-reserve:${id}:${user.id}:${ip}`, 20, 60_000);

  const reservation = await reserveDropStock({
    dropEventId: id,
    userId: user.id,
    variantId: payload.variantId,
    qty: payload.qty,
    entryToken: payload.entryToken,
    idempotencyKey: payload.idempotencyKey ?? `drop:${id}:user:${user.id}:variant:${payload.variantId}:qty:${payload.qty}`,
  });

  return ok({
    reservationId: reservation.id,
    status: reservation.status,
    quantity: reservation.quantity,
    expiresAt: reservation.expiresAt,
  });
});
