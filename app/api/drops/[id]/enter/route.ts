import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { applyRateLimit } from "@/lib/server/rate-limit";
import { getClientIp } from "@/lib/server/request";
import { ok, withApiHandler } from "@/lib/server/response";
import { dropEnterSchema } from "@/lib/server/schemas";
import { enterDropQueue } from "@/lib/server/services/drops";
import { parseBody } from "@/lib/server/validation";

export const dynamic = "force-dynamic";

export const POST = withApiHandler(async (request: NextRequest, context: { params: Promise<{ id: string }> }) => {
  const user = await requireAuth(request);
  const payload = await parseBody(request, dropEnterSchema);
  const { id } = await context.params;
  const ip = getClientIp(request) ?? "unknown";

  applyRateLimit(`drop-enter:${id}:${user.id}:${ip}`, 30, 60_000);

  const entry = await enterDropQueue({
    dropEventId: id,
    userId: user.id,
    ipAddress: ip,
    userAgent: payload.userAgent ?? request.headers.get("user-agent"),
  });

  return ok({
    entryToken: entry.entryToken,
    status: entry.status,
    queuePosition: entry.queuePosition,
    expiresAt: entry.expiresAt,
  });
});
