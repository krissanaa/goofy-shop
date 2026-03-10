import { Prisma } from "@prisma/client";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/server/prisma";
import { productListQuerySchema } from "@/lib/server/schemas";
import { ok, withApiHandler } from "@/lib/server/response";
import { parseSearchParams } from "@/lib/server/validation";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async (request: NextRequest) => {
  const query = parseSearchParams(request, productListQuerySchema);
  const now = new Date();

  const where: Prisma.ProductWhereInput = {
    isActive: true,
  };

  const variantConditions: Prisma.ProductVariantWhereInput[] = [];

  if (query.category) {
    where.categories = {
      some: {
        category: {
          slug: query.category,
        },
      },
    };
  }

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
    ];
  }

  if (query.inStock) {
    variantConditions.push({
      inventory: {
        available: { gt: 0 },
      },
    });
  }

  if (query.priceMin !== undefined || query.priceMax !== undefined) {
    const amount: Prisma.IntFilter = {};
    if (query.priceMin !== undefined) {
      amount.gte = query.priceMin;
    }
    if (query.priceMax !== undefined) {
      amount.lte = query.priceMax;
    }

    variantConditions.push({
      prices: {
        some: {
          isActive: true,
          startsAt: { lte: now },
          OR: [{ endsAt: null }, { endsAt: { gt: now } }],
          amount,
        },
      },
    });
  }

  if (variantConditions.length > 0) {
    where.variants = {
      some: {
        AND: variantConditions,
      },
    };
  }

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    query.sort === "newest"
      ? { createdAt: "desc" }
      : {
          variants: {
            _count: "desc",
          },
        };

  const products = await prisma.product.findMany({
    where,
    orderBy,
    ...(query.cursor ? { cursor: { id: query.cursor }, skip: 1 } : {}),
    take: (query.limit ?? 24) + 1,
    include: {
      media: {
        orderBy: { sortOrder: "asc" },
      },
      categories: {
        include: {
          category: true,
        },
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
        },
      },
    },
  });

  const hasNext = products.length > (query.limit ?? 24);
  const items = hasNext ? products.slice(0, query.limit ?? 24) : products;
  const nextCursor = hasNext ? items[items.length - 1]?.id : null;

  return ok({
    items: items.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      brand: product.brand,
      categories: product.categories.map((relation) => relation.category.name),
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
        available: variant.inventory?.available ?? 0,
        onHand: variant.inventory?.onHand ?? 0,
        price: variant.prices[0]?.amount ?? null,
        currency: variant.prices[0]?.currency ?? null,
      })),
    })),
    nextCursor,
  });
});
