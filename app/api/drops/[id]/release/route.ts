import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { ok, withApiHandler } from "@/lib/server/response";
import { dropReleaseSchema } from "@/lib/server/schemas";
import { releaseDropReservation } from "@/lib/server/services/drops";
import { parseBody } from "@/lib/server/validation";

export const dynamic = "force-dynamic";

export const POST = withApiHandler(async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
  const user = await requireAuth(request);
  const payload = await parseBody(request, dropReleaseSchema);
  const { id } = await context.params;

  const reservation = await releaseDropReservation({
    dropEventId: id,
    userId: user.id,
    reservationId: payload.reservationId,
  });

  return ok({
    released: true,
    reservationId: reservation.id,
    status: reservation.status,
  });
});
