import { NextResponse } from "next/server"
import { getAdminNotifyEntries } from "@/lib/admin-data"
import { createClient } from "@/lib/supabase/server"

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
  const dropId = searchParams.get("id")?.trim() ?? ""
  const entries = (await getAdminNotifyEntries()).filter((entry) =>
    dropId ? entry.dropId === dropId : true,
  )

  const csv = [
    ["drop_title", "phone", "email", "created_at"].join(","),
    ...entries.map((entry) =>
      [
        escapeCsv(entry.dropTitle),
        escapeCsv(entry.phone),
        escapeCsv(entry.email),
        escapeCsv(entry.createdAt ?? ""),
      ].join(","),
    ),
  ].join("\n")

  const fileName = `goofy-drop-notify-${dropId || new Date().toISOString().slice(0, 10)}.csv`

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  })
}
