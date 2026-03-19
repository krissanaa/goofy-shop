import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"
import { sanitizeSearchTerm } from "@/lib/shop"

export async function GET(request: NextRequest) {
  try {
    const q = sanitizeSearchTerm(request.nextUrl.searchParams.get("q"))
    const limit = Math.min(
      Math.max(Number(request.nextUrl.searchParams.get("limit") ?? "12"), 1),
      20,
    )

    let query = supabase
      .from("products")
      .select("id, slug, name, category, price, images, brand, description")
      .eq("active", true)

    if (q) {
      query = query.or(
        `name.ilike.%${q}%,brand.ilike.%${q}%,description.ilike.%${q}%`,
      )
    }

    const { data, error } = await query
      .order("created_at", { ascending: false })
      .limit(limit)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      data: {
        items: data || [],
      },
    })
  } catch {
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    )
  }
}
