import { OrderStatus, Prisma } from "@prisma/client";
import { NextRequest } from "next/server";
import { requireRole } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { ok, withApiHandler } from "@/lib/server/response";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async (request: NextRequest) => {
  await requireRole(request, ["STAFF", "ADMIN"]);

  const status = request.nextUrl.searchParams.get("status");
  const from = request.nextUrl.searchParams.get("from");
  const to = request.nextUrl.searchParams.get("to");
  const userId = request.nextUrl.searchParams.get("userId");
  const dropEventId = request.nextUrl.searchParams.get("dropEventId");
  const cursor = request.nextUrl.searchParams.get("cursor");
  const limit = Math.min(Math.max(Number(request.nextUrl.searchParams.get("limit") ?? "50"), 1), 100);

  const where: Prisma.OrderWhereInput = {};
  if (status && Object.values(OrderStatus).includes(status as OrderStatus)) {
    where.status = status as OrderStatus;
  }
  if (userId) where.userId = userId;
  if (dropEventId) where.dropEventId = dropEventId;
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    take: limit + 1,
    include: {
      items: true,
      payments: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      shipments: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      user: {
        select: { id: true, email: true, name: true },
      },
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
      user: order.user,
      grandTotal: order.grandTotal,
      currency: order.currency,
      dropEventId: order.dropEventId,
      createdAt: order.createdAt,
      paymentStatus: order.payments[0]?.status ?? null,
      shipmentStatus: order.shipments[0]?.status ?? null,
      itemCount: order.items.length,
    })),
    nextCursor,
  });
});
