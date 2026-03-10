import Image from "next/image"
import Link from "next/link"
import { getCategories, getStrapiImageUrl } from "@/lib/strapi"
import type { CategoryRowData } from "@/lib/strapi-types"
import { EmptyCartBoxArt } from "@/components/ui/empty-cart-box-art"

interface CategoryItem {
  title: string
  subtitle: string
  link: string
  accentColor: string
  imageUrl?: string
}

const CATEGORY_BADGE_COLORS = ["#E70009", "#FBD000"] as const

const FALLBACK_ITEMS: CategoryItem[] = [
  {
    title: "Decks",
    subtitle: "Street and park setups",
    link: "/products?category=Decks",
    accentColor: "#E70009",
  },
  {
    title: "Apparel",
    subtitle: "Daily wear and skate fits",
    link: "/products?category=Apparel",
    accentColor: "#FBD000",
  },
  {
    title: "Wheels",
    subtitle: "Grip, speed, and control",
    link: "/products?category=Wheels",
    accentColor: "#6B8CFF",
  },
  {
    title: "Gear",
    subtitle: "Trucks, tools, and extras",
    link: "/products?category=Gear",
    accentColor: "#00AA00",
  },
]

function normalizeItems(items: CategoryRowData["items"]): CategoryItem[] {
  if (!Array.isArray(items) || items.length === 0) return FALLBACK_ITEMS

  const parsed = items
    .map((item, index) => {
      const obj = item as Record<string, unknown>
      const title = typeof obj?.title === "string" ? obj.title.trim() : ""
      if (!title) return null

      const subtitle = typeof obj?.subtitle === "string" ? obj.subtitle.trim() : ""
      const rawLink = typeof obj?.link === "string"
        ? obj.link.trim()
        : typeof obj?.url === "string"
          ? obj.url.trim()
          : ""
      const link = rawLink
        ? rawLink
        : `/products?category=${encodeURIComponent(title)}`
      const rawAccentColor = typeof obj?.accentColor === "string"
        ? obj.accentColor.trim()
        : typeof obj?.accent_color === "string"
          ? obj.accent_color.trim()
          : ""
      const accentColor = rawAccentColor
        ? rawAccentColor
        : FALLBACK_ITEMS[index % FALLBACK_ITEMS.length].accentColor

      return {
        title,
        subtitle: subtitle || "Explore products",
        link,
        accentColor,
      }
    })
    .filter((item): item is CategoryItem => Boolean(item))

  return parsed.length > 0 ? parsed : FALLBACK_ITEMS
}

function getAccentTextColor(accentColor: string): string {
  const normalized = accentColor.toLowerCase()
  if (normalized === "#fbd000" || normalized === "#ffffff") return "#111111"
  return "#ffffff"
}

function normalizeLookupKey(value: string): string {
  return value.trim().toLowerCase()
}

function extractCategoryHints(link: string): string[] {
  try {
    const url = new URL(link, "http://localhost")
    const type = url.searchParams.get("type")
    const category = url.searchParams.get("category")
    return [type, category]
      .filter((value): value is string => Boolean(value))
      .map((value) => normalizeLookupKey(decodeURIComponent(value)))
  } catch {
    return []
  }
}

function resolveCategoryImageUrl(
  item: CategoryItem,
  byTitle: Map<string, string>,
  bySlug: Map<string, string>,
): string | undefined {
  const titleKey = normalizeLookupKey(item.title)
  const fromTitle = byTitle.get(titleKey)
  if (fromTitle) return fromTitle

  const hints = extractCategoryHints(item.link)
  for (const hint of hints) {
    const fromHint = byTitle.get(hint) || bySlug.get(hint)
    if (fromHint) return fromHint
  }

  return undefined
}

function resolveCategorySlug(
  item: CategoryItem,
  byTitle: Map<string, string>,
  bySlug: Map<string, string>,
): string | undefined {
  const titleKey = normalizeLookupKey(item.title)
  const fromTitle = byTitle.get(titleKey)
  if (fromTitle) return fromTitle

  const hints = extractCategoryHints(item.link)
  for (const hint of hints) {
    const fromHint = byTitle.get(hint) || bySlug.get(hint)
    if (fromHint) return fromHint
  }

  return undefined
}

interface DynamicCategoryRowProps {
  data: CategoryRowData
}

export async function DynamicCategoryRow({ data }: DynamicCategoryRowProps) {
  const title = data.title?.trim() || "CATEGORY"
  const items = normalizeItems(data.items).slice(0, 8)

  let categoryList: Awaited<ReturnType<typeof getCategories>>["data"] = []
  let categoryImageByTitle = new Map<string, string>()
  let categoryImageBySlug = new Map<string, string>()
  let categorySlugByTitle = new Map<string, string>()
  let categorySlugBySlug = new Map<string, string>()

  try {
    const categoryResponse = await getCategories()
    categoryList = Array.isArray(categoryResponse?.data)
      ? categoryResponse.data
      : []

    categoryImageByTitle = new Map(
      categoryList
        .filter((category) => Boolean(category.thumbnail))
        .map((category) => [
          normalizeLookupKey(category.title),
          getStrapiImageUrl(category.thumbnail, "medium"),
        ]),
    )

    categoryImageBySlug = new Map(
      categoryList
        .filter((category) => Boolean(category.thumbnail))
        .map((category) => [
          normalizeLookupKey(category.slug),
          getStrapiImageUrl(category.thumbnail, "medium"),
        ]),
    )

    categorySlugByTitle = new Map(
      categoryList.map((category) => [
        normalizeLookupKey(category.title),
        category.slug,
      ]),
    )

    categorySlugBySlug = new Map(
      categoryList.map((category) => [
        normalizeLookupKey(category.slug),
        category.slug,
      ]),
    )
  } catch {
    categoryImageByTitle = new Map()
    categoryImageBySlug = new Map()
    categorySlugByTitle = new Map()
    categorySlugBySlug = new Map()
  }

  const enrichedItems = items.map((item) => {
    const categorySlug = resolveCategorySlug(
      item,
      categorySlugByTitle,
      categorySlugBySlug,
    )

    return {
      ...item,
      link: categorySlug
        ? `/products?category=${encodeURIComponent(categorySlug)}`
        : item.link,
      imageUrl: resolveCategoryImageUrl(item, categoryImageByTitle, categoryImageBySlug),
    }
  })

  const liveCategoryItems: CategoryItem[] = categoryList.slice(0, 8).map((category, index) => ({
    title: category.title,
    subtitle: "Explore products",
    link: `/products?category=${encodeURIComponent(category.slug)}`,
    accentColor: FALLBACK_ITEMS[index % FALLBACK_ITEMS.length].accentColor,
    imageUrl: category.thumbnail
      ? getStrapiImageUrl(category.thumbnail, "medium")
      : undefined,
  }))

  const displayItems = liveCategoryItems.length > 0 ? liveCategoryItems : enrichedItems

  return (
    <section className="bg-[#F1EEE8] py-12">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-5 inline-flex items-center border-4 border-black bg-black px-4 py-2 shadow-[4px_4px_0_#FBD000]">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#FBD000]">
            {`* ${title.toUpperCase()}`}
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {displayItems.map((item, index) => (
            <Link
              key={`${item.title}-${item.link}`}
              href={item.link}
              className="group relative h-44 overflow-hidden border-4 border-black bg-[#E6E6E6] shadow-[4px_4px_0_#0A0A0A] transition-[transform,box-shadow] duration-200 [will-change:transform] hover:z-10 hover:-translate-y-1 hover:scale-[1.015] hover:shadow-[4px_4px_0_#CE1126,8px_8px_0_#002868] focus-visible:z-10 focus-visible:-translate-y-1 focus-visible:scale-[1.015] focus-visible:shadow-[4px_4px_0_#CE1126,8px_8px_0_#002868]"
            >
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={`${item.title} category`}
                  fill
                  sizes="(max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-200 group-hover:scale-105"
                />
              ) : (
                <EmptyCartBoxArt />
              )}

              <div className="absolute bottom-3 left-3">
                <span
                  className="w-fit border border-black px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em]"
                  style={{
                    backgroundColor:
                      CATEGORY_BADGE_COLORS[index % CATEGORY_BADGE_COLORS.length],
                    color: getAccentTextColor(
                      CATEGORY_BADGE_COLORS[index % CATEGORY_BADGE_COLORS.length],
                    ),
                  }}
                >
                  {item.title}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
