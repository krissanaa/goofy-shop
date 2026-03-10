import { NextRequest } from "next/server";
import { getProducts } from "@/lib/strapi";
import { ok, withApiHandler } from "@/lib/server/response";

export const dynamic = "force-dynamic";

export const GET = withApiHandler(async (_request: NextRequest) => {
  const response = await getProducts({ revalidate: 0 });

  return ok({
    items: response.data.map((product) => ({
      id: product.id,
      slug: product.slug,
      name: product.name,
      category: product.category?.title ?? "Product",
      price: product.price,
    })),
  });
});
