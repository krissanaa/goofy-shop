import { RiskAction, RiskSeverity, RiskType } from "@prisma/client";
import { ApiError } from "@/lib/server/errors";
import { prisma } from "@/lib/server/prisma";

interface RiskInput {
  userId: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  dropEventId?: string;
  orderId?: string;
}

const threshold = {
  attempts2m: 4,
  failedPayments24h: 3,
  distinctCards24h: 3,
  sameIpDropUsers24h: 3,
};

export const evaluateCheckoutRisk = async (input: RiskInput) => {
  const now = new Date();
  const twoMinutesAgo = new Date(now.getTime() - 2 * 60 * 1000);
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [attempts2m, failedPayments24h] = await Promise.all([
    prisma.order.count({
      where: {
        userId: input.userId,
        createdAt: { gte: twoMinutesAgo },
      },
    }),
    prisma.payment.count({
      where: {
        status: "FAILED",
        createdAt: { gte: twentyFourHoursAgo },
        order: { userId: input.userId },
      },
    }),
  ]);

  const payments24h = await prisma.payment.findMany({
    where: {
      createdAt: { gte: twentyFourHoursAgo },
      order: { userId: input.userId },
      providerPaymentId: { not: null },
    },
    select: { providerPaymentId: true },
  });

  const distinctCards24h = new Set(
    payments24h
      .map((payment) => payment.providerPaymentId)
      .filter((value): value is string => Boolean(value)),
  ).size;

  let sameIpDropUsers24h = 0;
  if (input.ipAddress && input.dropEventId) {
    const dropEntries = await prisma.dropEntry.findMany({
      where: {
        dropEventId: input.dropEventId,
        ipAddress: input.ipAddress,
        createdAt: { gte: twentyFourHoursAgo },
      },
      select: { userId: true },
      distinct: ["userId"],
    });

    sameIpDropUsers24h = dropEntries.length;
  }

  const riskEvents: Array<{
    type: RiskType;
    score: number;
    severity: RiskSeverity;
    reason: string;
  }> = [];

  if (attempts2m > threshold.attempts2m) {
    riskEvents.push({
      type: RiskType.CHECKOUT_VELOCITY,
      score: 35,
      severity: RiskSeverity.HIGH,
      reason: `Checkout attempts in 2m exceeded threshold (${attempts2m}).`,
    });
  }

  if (distinctCards24h > threshold.distinctCards24h) {
    riskEvents.push({
      type: RiskType.DISTINCT_CARDS,
      score: 25,
      severity: RiskSeverity.HIGH,
      reason: `Distinct cards in 24h exceeded threshold (${distinctCards24h}).`,
    });
  }

  if (sameIpDropUsers24h > threshold.sameIpDropUsers24h) {
    riskEvents.push({
      type: RiskType.SHARED_IP_LIMITED_DROP,
      score: 25,
      severity: RiskSeverity.MEDIUM,
      reason: `Shared IP drop purchasers exceeded threshold (${sameIpDropUsers24h}).`,
    });
  }

  if (failedPayments24h > threshold.failedPayments24h) {
    riskEvents.push({
      type: RiskType.FAILED_PAYMENTS,
      score: 30,
      severity: RiskSeverity.HIGH,
      reason: `Failed payments in 24h exceeded threshold (${failedPayments24h}).`,
    });
  }

  const totalScore = riskEvents.reduce((sum, event) => sum + event.score, 0);
  const action: RiskAction =
    totalScore >= 90 ? RiskAction.REQUIRE_REVIEW : totalScore >= 70 ? RiskAction.SOFT_BLOCK : RiskAction.NONE;

  if (riskEvents.length > 0) {
    await prisma.riskEvent.createMany({
      data: riskEvents.map((event) => ({
        userId: input.userId,
        orderId: input.orderId,
        dropEventId: input.dropEventId,
        type: event.type,
        severity: event.severity,
        score: event.score,
        action,
        reason: event.reason,
        ipAddress: input.ipAddress ?? undefined,
        userAgent: input.userAgent ?? undefined,
      })),
    });
  }

  return {
    score: totalScore,
    action,
  };
};

export const enforceRiskPolicy = async (input: RiskInput) => {
  const result = await evaluateCheckoutRisk(input);

  if (result.action === RiskAction.SOFT_BLOCK) {
    throw new ApiError(
      429,
      "RATE_LIMITED",
      "Checkout is temporarily blocked for security review. Please retry in a few minutes.",
    );
  }

  if (result.action === RiskAction.REQUIRE_REVIEW) {
    throw new ApiError(
      403,
      "FORBIDDEN",
      "Checkout requires manual review. Please contact support with your order details.",
    );
  }
};
