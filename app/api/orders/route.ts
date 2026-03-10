import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { ok, withApiHandler } from "@/lib/server/response";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async (request: NextRequest) => {
  const user = await requireAuth(request);
  const limit = Math.min(Math.max(Number(request.nextUrl.searchParams.get("limit") ?? "20"), 1), 100);
  const cursor = request.nextUrl.searchParams.get("cursor");

  const orders = await prisma.order.findMany({
    where: {
      userId: user.id,
    },
    orderBy: { createdAt: "desc" },
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    take: limit + 1,
    include: {
      payments: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      shipments: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      items: true,
    },
  });

  const hasNext = orders.length > limit;
  const items = hasNext ? orders.slice(0, limit) : orders;
  const nextCursor = hasNext ? items[items.length - 1]?.id : null;

  return ok({
    items: items.map((order) => ({
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      grandTotal: order.grandTotal,
      currency: order.currency,
      createdAt: order.createdAt,
      itemCount: order.items.length,
      paymentStatus: order.payments[0]?.status ?? null,
      shipmentStatus: order.shipments[0]?.status ?? null,
    })),
    nextCursor,
  });
});
