import { CategoryRowPanel, type CategoryRowPanelItem } from "@/components/category-row-panel"
import { getCategories, getStrapiImageUrl } from "@/lib/strapi"
import type { CategoryRowData } from "@/lib/strapi-types"

type DesiredCategoryKey =
  | "decks"
  | "wheels"
  | "apparel"
  | "trucks"
  | "gear"
  | "accessories"

interface CategoryItem {
  title: string
  subtitle: string
  link: string
  imageUrl?: string
}

const DESIRED_CATEGORIES: Array<{
  key: DesiredCategoryKey
  title: string
  subtitle: string
  fallbackImageUrl: string
}> = [
  {
    key: "decks",
    title: "DECKS",
    subtitle: "Street and park setups",
    fallbackImageUrl:
      "https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=1200&q=80",
  },
  {
    key: "wheels",
    title: "WHEELS",
    subtitle: "Grip, speed, and control",
    fallbackImageUrl:
      "https://images.unsplash.com/photo-1547447134-cd3f5c716030?auto=format&fit=crop&w=1200&q=80",
  },
  {
    key: "apparel",
    title: "APPAREL",
    subtitle: "Daily wear and skate fits",
    fallbackImageUrl:
      "https://images.unsplash.com/photo-1523398002811-999ca8dec234?auto=format&fit=crop&w=1200&q=80",
  },
  {
    key: "trucks",
    title: "TRUCKS",
    subtitle: "Precision turning hardware",
    fallbackImageUrl:
      "https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80",
  },
  {
    key: "gear",
    title: "GEAR",
    subtitle: "Tools, bags, and session extras",
    fallbackImageUrl:
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  },
  {
    key: "accessories",
    title: "ACCESSORIES",
    subtitle: "Pins, wax, grip, and add-ons",
    fallbackImageUrl:
      "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=1200&q=80",
  },
]

const CATEGORY_ALIASES: Record<DesiredCategoryKey, string[]> = {
  decks: ["deck", "decks"],
  wheels: ["wheel", "wheels"],
  apparel: ["apparel", "clothing", "wear"],
  trucks: ["truck", "trucks"],
  gear: ["gear", "hardware", "essentials"],
  accessories: ["accessory", "accessories"],
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

function normalizeItems(items: CategoryRowData["items"]): CategoryItem[] {
  if (!Array.isArray(items) || items.length === 0) return []

  return items
    .map((item) => {
      const obj = item as Record<string, unknown>
      const title = typeof obj?.title === "string" ? obj.title.trim() : ""
      if (!title) return null

      const subtitle = typeof obj?.subtitle === "string" ? obj.subtitle.trim() : ""
      const rawLink =
        typeof obj?.link === "string"
          ? obj.link.trim()
          : typeof obj?.url === "string"
            ? obj.url.trim()
            : ""

      return {
        title,
        subtitle: subtitle || "Explore products",
        link: rawLink || `/products?category=${encodeURIComponent(title)}`,
      }
    })
    .filter((item): item is CategoryItem => Boolean(item))
}

function matchesDesiredCategory(value: string, desiredKey: DesiredCategoryKey): boolean {
  return CATEGORY_ALIASES[desiredKey].includes(normalizeLookupKey(value))
}

function findConfiguredItem(
  desiredKey: DesiredCategoryKey,
  items: CategoryItem[],
): CategoryItem | undefined {
  return items.find((item) => {
    if (matchesDesiredCategory(item.title, desiredKey)) {
      return true
    }

    return extractCategoryHints(item.link).some((hint) =>
      matchesDesiredCategory(hint, desiredKey),
    )
  })
}

function findLiveCategory(
  desiredKey: DesiredCategoryKey,
  categories: Awaited<ReturnType<typeof getCategories>>["data"],
) {
  return categories.find(
    (category) =>
      matchesDesiredCategory(category.title, desiredKey) ||
      matchesDesiredCategory(category.slug, desiredKey),
  )
}

interface DynamicCategoryRowProps {
  data: CategoryRowData
}

export async function DynamicCategoryRow({ data }: DynamicCategoryRowProps) {
  const rawSectionTitle = data.title?.trim() || ""
  const sectionTitle =
    rawSectionTitle && rawSectionTitle.toUpperCase() !== "CATEGORY"
      ? rawSectionTitle
      : "SHOP BY CATEGORY"
  const configuredItems = normalizeItems(data.items)

  let categoryList: Awaited<ReturnType<typeof getCategories>>["data"] = []

  try {
    const categoryResponse = await getCategories()
    categoryList = Array.isArray(categoryResponse?.data)
      ? categoryResponse.data
      : []
  } catch {
    categoryList = []
  }

  const displayItems: CategoryRowPanelItem[] = DESIRED_CATEGORIES.map((desired) => {
    const configuredItem = findConfiguredItem(desired.key, configuredItems)
    const liveCategory = findLiveCategory(desired.key, categoryList)

    const imageUrl = liveCategory?.thumbnail
      ? getStrapiImageUrl(liveCategory.thumbnail, "medium")
      : desired.fallbackImageUrl

    return {
      key: desired.key,
      title: desired.title,
      subtitle: configuredItem?.subtitle || desired.subtitle,
      href: liveCategory
        ? `/products?category=${encodeURIComponent(liveCategory.slug)}`
        : `/products?category=${encodeURIComponent(desired.key)}`,
      imageUrl,
      imageAlt: liveCategory?.thumbnail?.alternativeText || `${desired.title} category`,
    }
  })

  return <CategoryRowPanel title={sectionTitle} items={displayItems} />
}
