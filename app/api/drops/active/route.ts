import { NextRequest } from "next/server";
import { ok, withApiHandler } from "@/lib/server/response";
import { getActiveDrop } from "@/lib/server/services/drops";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async (_request: NextRequest) => {
  const drop = await getActiveDrop();

  if (!drop) {
    return ok({ active: false, drop: null });
  }

  return ok({
    active: true,
    drop: {
      id: drop.id,
      slug: drop.slug,
      name: drop.name,
      description: drop.description,
      startsAt: drop.startsAt,
      endsAt: drop.endsAt,
      queueEnabled: drop.rule?.queueEnabled ?? drop.queueEnabled,
      reservationTtlMinutes: drop.rule?.reservationTtlMinutes ?? 5,
      variants: drop.variants.map((variant) => ({
        variantId: variant.variantId,
        allocation: variant.allocation,
        perUserLimit: variant.perUserLimit,
        sku: variant.variant.sku,
        productName: variant.variant.product.name,
        available: variant.variant.inventory?.available ?? 0,
      })),
    },
  });
});
