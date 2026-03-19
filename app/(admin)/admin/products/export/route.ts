import { NextResponse } from "next/server"
import {
  filterAdminProducts,
  serializeProductsToCsv,
  sortAdminProducts,
  type AdminProductActiveState,
  type AdminProductSort,
} from "@/lib/admin"
import { getAdminProducts } from "@/lib/admin-data"
import { createClient } from "@/lib/supabase/server"

function normalizeSort(value: string | null): AdminProductSort {
  const normalized = (value ?? "NEWEST").toUpperCase()
  return normalized === "NAME" || normalized === "PRICE" || normalized === "STOCK"
    ? normalized
    : "NEWEST"
}

function normalizeActiveState(value: string | null): AdminProductActiveState {
  const normalized = (value ?? "ALL").toUpperCase()
  return normalized === "ACTIVE" || normalized === "INACTIVE" ? normalized : "ALL"
}

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return new NextResponse("Unauthorized", { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const ids = searchParams
    .get("ids")
    ?.split(",")
    .map((value) => value.trim())
    .filter(Boolean) ?? []

  const allProducts = await getAdminProducts()
  const filteredProducts = sortAdminProducts(
    filterAdminProducts(allProducts, {
      search: searchParams.get("q")?.trim() ?? "",
      category: (searchParams.get("category") ?? "ALL").toLowerCase(),
      brand: (searchParams.get("brand") ?? "ALL").toLowerCase(),
      badge: (searchParams.get("badge") ?? "ALL").toUpperCase(),
      activeState: normalizeActiveState(searchParams.get("state")),
      sort: normalizeSort(searchParams.get("sort")),
    }),
    normalizeSort(searchParams.get("sort")),
  ).filter((product) => (ids.length > 0 ? ids.includes(product.id) : true))

  const csv = serializeProductsToCsv(filteredProducts)
  const fileName = `goofy-products-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  })
}
