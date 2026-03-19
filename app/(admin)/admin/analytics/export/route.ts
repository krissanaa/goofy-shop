import { NextResponse } from "next/server"
import {
  getAdminAnalyticsData,
  serializeAnalyticsToCsv,
  type AdminAnalyticsRange,
} from "@/lib/admin-analytics"
import { createClient } from "@/lib/supabase/server"

function normalizeRange(value: string | null): AdminAnalyticsRange {
  const normalized = (value ?? "30D").toUpperCase()

  if (
    normalized === "TODAY" ||
    normalized === "7D" ||
    normalized === "30D" ||
    normalized === "90D" ||
    normalized === "CUSTOM"
  ) {
    return normalized
  }

  return "30D"
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
  const analytics = await getAdminAnalyticsData({
    range: normalizeRange(searchParams.get("range")),
    from: searchParams.get("from")?.trim() ?? "",
    to: searchParams.get("to")?.trim() ?? "",
  })

  const csv = serializeAnalyticsToCsv(analytics)
  const fileName = `goofy-analytics-${analytics.filters.from}-to-${analytics.filters.to}.csv`

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  })
}
