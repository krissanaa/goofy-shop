import { OrderStatus } from "@prisma/client";
import { NextRequest } from "next/server";
import { requireRole } from "@/lib/server/auth";
import { prisma } from "@/lib/server/prisma";
import { ok, withApiHandler } from "@/lib/server/response";

export const dynamic = "force-dynamic";

const rangeStart = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000);

export const GET = withApiHandler(async (request: NextRequest) => {
  await requireRole(request, ["STAFF", "ADMIN"]);

  const [todayRevenue, revenue7d, revenue30d, ordersByStatus, carts7d, orders7d] = await Promise.all([
    prisma.order.aggregate({
      where: {
        status: { in: [OrderStatus.PAID, OrderStatus.FULFILLING, OrderStatus.SHIPPED, OrderStatus.COMPLETED] },
        createdAt: { gte: rangeStart(1) },
      },
      _sum: { grandTotal: true },
    }),
    prisma.order.aggregate({
      where: {
        status: { in: [OrderStatus.PAID, OrderStatus.FULFILLING, OrderStatus.SHIPPED, OrderStatus.COMPLETED] },
        createdAt: { gte: rangeStart(7) },
      },
      _sum: { grandTotal: true },
    }),
    prisma.order.aggregate({
      where: {
        status: { in: [OrderStatus.PAID, OrderStatus.FULFILLING, OrderStatus.SHIPPED, OrderStatus.COMPLETED] },
        createdAt: { gte: rangeStart(30) },
      },
      _sum: { grandTotal: true },
    }),
    prisma.order.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.cart.count({
      where: {
        createdAt: { gte: rangeStart(7) },
      },
    }),
    prisma.order.count({
      where: {
        createdAt: { gte: rangeStart(7) },
      },
    }),
  ]);

  const orderStatusMap = ordersByStatus.reduce<Record<string, number>>((acc, item) => {
    acc[item.status] = item._count._all;
    return acc;
  }, {});

  const conversionPurchase = carts7d > 0 ? Number(((orders7d / carts7d) * 100).toFixed(2)) : 0;

  return ok({
    revenue: {
      today: todayRevenue._sum.grandTotal ?? 0,
      last7d: revenue7d._sum.grandTotal ?? 0,
      last30d: revenue30d._sum.grandTotal ?? 0,
    },
    orders: {
      pending: orderStatusMap.PENDING ?? 0,
      paid: orderStatusMap.PAID ?? 0,
      fulfilling: orderStatusMap.FULFILLING ?? 0,
      shipped: orderStatusMap.SHIPPED ?? 0,
      completed: orderStatusMap.COMPLETED ?? 0,
      canceled: orderStatusMap.CANCELED ?? 0,
      refunded: orderStatusMap.REFUNDED ?? 0,
    },
    conversion: {
      addToCart: 100,
      checkoutStart: 0,
      purchase: conversionPurchase,
    },
  });
});
