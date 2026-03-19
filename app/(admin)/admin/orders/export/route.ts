import { NextResponse } from "next/server"
import {
  filterOrders,
  serializeOrdersToCsv,
  type AdminOrderDateRange,
  type AdminOrderFilters,
} from "@/lib/admin"
import { getAdminOrders } from "@/lib/admin-data"
import { createClient } from "@/lib/supabase/server"

function normalizeDateRange(value: string | null): AdminOrderDateRange {
  const normalized = (value ?? "ALL").toUpperCase()

  if (
    normalized === "TODAY" ||
    normalized === "THIS_WEEK" ||
    normalized === "THIS_MONTH" ||
    normalized === "CUSTOM"
  ) {
    return normalized
  }

  return "ALL"
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

  const filters: AdminOrderFilters = {
    search: searchParams.get("q")?.trim() ?? "",
    status: (searchParams.get("status") ?? "ALL").toUpperCase(),
    payment: (searchParams.get("payment") ?? "ALL").toUpperCase(),
    dateRange: normalizeDateRange(searchParams.get("date")),
    from: searchParams.get("from")?.trim() ?? "",
    to: searchParams.get("to")?.trim() ?? "",
  }

  const allOrders = await getAdminOrders()
  const filteredOrders = filterOrders(allOrders, filters).filter((order) =>
    ids.length > 0 ? ids.includes(order.id) : true,
  )

  const csv = serializeOrdersToCsv(filteredOrders)
  const fileName = `goofy-orders-${new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  })
}
