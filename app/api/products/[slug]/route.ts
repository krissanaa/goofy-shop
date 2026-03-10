import { NextRequest } from "next/server";
import { ApiError } from "@/lib/server/errors";
import { prisma } from "@/lib/server/prisma";
import { ok, withApiHandler } from "@/lib/server/response";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async (_request: NextRequest, context: { params: Promise<{ slug: string }> }) => {
  const { slug } = await context.params;
  const now = new Date();

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      media: {
        orderBy: { sortOrder: "asc" },
      },
      categories: {
        include: { category: true },
      },
      variants: {
        where: { isActive: true },
        include: {
          inventory: true,
          prices: {
            where: {
              isActive: true,
              startsAt: { lte: now },
              OR: [{ endsAt: null }, { endsAt: { gt: now } }],
            },
            orderBy: { startsAt: "desc" },
            take: 1,
          },
          media: {
            orderBy: { sortOrder: "asc" },
          },
        },
      },
      reviews: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
    },
  });

  if (!product || !product.isActive) {
    throw new ApiError(404, "NOT_FOUND", "Product not found.");
  }

  return ok({
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    brand: product.brand,
    categories: product.categories.map((relation) => ({
      id: relation.category.id,
      slug: relation.category.slug,
      name: relation.category.name,
    })),
    media: product.media.map((media) => ({
      id: media.id,
      type: media.type,
      url: media.url,
      altText: media.altText,
    })),
    variants: product.variants.map((variant) => ({
      id: variant.id,
      sku: variant.sku,
      title: variant.title,
      size: variant.size,
      color: variant.color,
      attributes: variant.attributes,
      available: variant.inventory?.available ?? 0,
      onHand: variant.inventory?.onHand ?? 0,
      price: variant.prices[0]?.amount ?? null,
      currency: variant.prices[0]?.currency ?? null,
      media: variant.media.map((media) => ({
        id: media.id,
        type: media.type,
        url: media.url,
        altText: media.altText,
      })),
    })),
    reviews: product.reviews.map((review) => ({
      id: review.id,
      rating: review.rating,
      title: review.title,
      body: review.body,
      verifiedPurchase: review.verifiedPurchase,
      createdAt: review.createdAt,
    })),
  });
});
