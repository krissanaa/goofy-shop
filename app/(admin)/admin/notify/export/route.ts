import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAdminNotifyEntries } from "@/lib/admin-data"

function escapeCsv(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`
  }

  return value
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
  const dropFilter = searchParams.get("drop")?.trim() || "ALL"
  const entries = (await getAdminNotifyEntries()).filter((entry) =>
    dropFilter === "ALL" ? true : (entry.dropId ?? "") === dropFilter,
  )

  const csv = [
    ["drop_name", "phone", "email", "signed_up_at"].join(","),
    ...entries.map((entry) =>
      [
        escapeCsv(entry.dropTitle),
        escapeCsv(entry.phone),
        escapeCsv(entry.email),
        escapeCsv(entry.createdAt ?? ""),
      ].join(","),
    ),
  ].join("\n")

  const fileName =
    dropFilter === "ALL"
      ? `goofy-notify-list-${new Date().toISOString().slice(0, 10)}.csv`
      : `goofy-notify-list-${dropFilter}.csv`

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  })
}
