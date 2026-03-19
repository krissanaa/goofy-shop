export const ADMIN_DROP_STATUSES = ["UPCOMING", "LIVE", "ENDED"] as const
export const ADMIN_POST_CATEGORIES = [
  "NEWS",
  "EVENT",
  "SPOT",
  "INTERVIEW",
  "TRICK",
] as const

type GenericRow = Record<string, unknown>

export interface AdminDrop {
  id: string
  slug: string
  title: string
  status: string
  description: string
  dropDate: string | null
  endDate: string | null
  coverImage: string | null
  teaserImage: string | null
  isFeatured: boolean
  productsCount: number
  notifySignups: number
  productIds: string[]
  createdAt: string | null
  raw: GenericRow
}

export interface AdminPost {
  id: string
  slug: string
  title: string
  category: string
  excerpt: string
  content: string
  coverImage: string | null
  published: boolean
  publishedAt: string | null
  createdAt: string | null
  raw: GenericRow
}

function normalizeAdminPostCategory(value: string | null): string {
  const normalized = (value ?? "").trim().toUpperCase()

  if (normalized === "SPOTLIGHT") {
    return "SPOT"
  }

  if (normalized === "FEATURE" || normalized === "STORY") {
    return "NEWS"
  }

  if (normalized === "NEWS" || normalized === "EVENT" || normalized === "SPOT" || normalized === "INTERVIEW" || normalized === "TRICK") {
    return normalized
  }

  return "NEWS"
}

export interface AdminBanner {
  id: string
  title: string
  tag: string
  imageUrl: string | null
  ctaText: string
  ctaLink: string
  order: number
  active: boolean
  raw: GenericRow
}

export interface AdminSettingsData {
  shopName: string
  shopTagline: string
  shopEmail: string
  shopPhone: string
  shopAddress: string
  logoUrl: string
  bankName: string
  bankAccountName: string
  bankAccountNumber: string
  paymentQrUrl: string
  paymentInstructions: string
  freeShippingThreshold: number
  shippingFee: number
  estimatedDeliveryDays: string
  supportedCities: string[]
  notificationEmail: string
  lineNotifyToken: string
  defaultLowStockThreshold: number
  notifyStockBelow: number
  instagram: string
  facebook: string
  tiktok: string
  youtube: string
  lineId: string
}

function asString(value: unknown): string | null {
  if (typeof value === "string") {
    const normalized = value.trim()
    return normalized.length > 0 ? normalized : null
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value)
  }

  return null
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

function asBoolean(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value
  }

  if (typeof value === "string") {
    return value === "true" || value === "1"
  }

  if (typeof value === "number") {
    return value > 0
  }

  return false
}

function pickString(row: GenericRow, keys: string[]): string | null {
  for (const key of keys) {
    const value = asString(row[key])
    if (value) {
      return value
    }
  }

  return null
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : []
}

function asStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((entry) => asString(entry))
      .filter((entry): entry is string => Boolean(entry))
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(",")
      .map((entry) => entry.trim())
      .filter(Boolean)
  }

  return []
}

function extractDropProductIds(row: GenericRow): string[] {
  const directIds = asArray(row.product_ids ?? row.productIds)
    .map((entry) => asString(entry))
    .filter((entry): entry is string => Boolean(entry))

  if (directIds.length > 0) {
    return directIds
  }

  return asArray(row.drop_event_products)
    .flatMap((entry) => {
      if (!entry || typeof entry !== "object") {
        return []
      }

      const relation = entry as GenericRow
      const productId = asString(relation.product_id ?? relation.productId)
      return productId ? [productId] : []
    })
}

export function normalizeAdminDrop(row: GenericRow): AdminDrop {
  const productIds = extractDropProductIds(row)

  return {
    id: pickString(row, ["id"]) ?? crypto.randomUUID(),
    slug: pickString(row, ["slug"]) ?? "drop",
    title: pickString(row, ["title", "name"]) ?? "Untitled Drop",
    status: (pickString(row, ["status"]) ?? "UPCOMING").toUpperCase(),
    description: pickString(row, ["description", "body", "summary"]) ?? "",
    dropDate: pickString(row, ["drop_date", "release_date", "start_date"]),
    endDate: pickString(row, ["end_date", "expires_at"]),
    coverImage: pickString(row, ["cover_image", "image", "image_url"]),
    teaserImage: pickString(row, ["teaser_image", "thumbnail"]),
    isFeatured: asBoolean(row.is_featured ?? row.featured),
    productsCount: asNumber(row.products_count ?? row.product_count) ?? productIds.length,
    notifySignups: asNumber(row.notify_signups ?? row.notify_count ?? row.notifySignups) ?? 0,
    productIds,
    createdAt: pickString(row, ["created_at"]),
    raw: row,
  }
}

export function normalizeAdminPost(row: GenericRow): AdminPost {
  return {
    id: pickString(row, ["id"]) ?? crypto.randomUUID(),
    slug: pickString(row, ["slug"]) ?? "post",
    title: pickString(row, ["title", "name"]) ?? "Untitled Post",
    category: normalizeAdminPostCategory(pickString(row, ["category", "tag", "type"])),
    excerpt: pickString(row, ["excerpt", "summary", "description"]) ?? "",
    content: pickString(row, ["content", "body"]) ?? "",
    coverImage: pickString(row, ["cover_image", "image", "image_url", "thumbnail"]),
    published: asBoolean(row.published),
    publishedAt: pickString(row, ["published_at", "created_at"]),
    createdAt: pickString(row, ["created_at"]),
    raw: row,
  }
}

export function normalizeAdminBanner(row: GenericRow): AdminBanner {
  return {
    id: pickString(row, ["id"]) ?? crypto.randomUUID(),
    title: pickString(row, ["title"]) ?? "Untitled Banner",
    tag: pickString(row, ["tag"]) ?? "Featured",
    imageUrl: pickString(row, ["image_url", "image", "desktop_image"]),
    ctaText: pickString(row, ["cta_text"]) ?? "Explore",
    ctaLink: pickString(row, ["cta_link"]) ?? "/shop",
    order: asNumber(row.order) ?? 0,
    active: asBoolean(row.active),
    raw: row,
  }
}

export const DEFAULT_ADMIN_SETTINGS: AdminSettingsData = {
  shopName: "GOOFY. Skate",
  shopTagline: "",
  shopEmail: "",
  shopPhone: "",
  shopAddress: "",
  logoUrl: "",
  bankName: "",
  bankAccountName: "",
  bankAccountNumber: "",
  paymentQrUrl: "",
  paymentInstructions: "",
  freeShippingThreshold: 500000,
  shippingFee: 0,
  estimatedDeliveryDays: "",
  supportedCities: [],
  notificationEmail: "",
  lineNotifyToken: "",
  defaultLowStockThreshold: 3,
  notifyStockBelow: 3,
  instagram: "",
  facebook: "",
  tiktok: "",
  youtube: "",
  lineId: "",
}

export function normalizeAdminSettings(rows: GenericRow[]): AdminSettingsData {
  const settings = { ...DEFAULT_ADMIN_SETTINGS }

  for (const row of rows) {
    const key = pickString(row, ["key", "name", "slug"])
    const value =
      typeof row.value === "object" && row.value !== null && !Array.isArray(row.value)
        ? (row.value as Record<string, unknown>)
        : row

    if (key === "shop_info" || !key) {
      settings.shopName =
        asString(value.shopName ?? value.shop_name ?? value.shopName ?? value.name) ??
        settings.shopName
      settings.shopTagline =
        asString(value.shopTagline ?? value.shop_tagline ?? value.tagline) ?? settings.shopTagline
      settings.shopEmail =
        asString(value.shopEmail ?? value.shop_email ?? value.email) ?? settings.shopEmail
      settings.shopPhone =
        asString(value.shopPhone ?? value.shop_phone ?? value.phone) ?? settings.shopPhone
      settings.shopAddress =
        asString(value.shopAddress ?? value.shop_address ?? value.address) ?? settings.shopAddress
      settings.logoUrl =
        asString(value.logoUrl ?? value.logo_url ?? value.logo) ?? settings.logoUrl
    }

    if (key === "bank_transfer" || !key) {
      settings.bankName = asString(value.bankName ?? value.bank_name) ?? settings.bankName
      settings.bankAccountName =
        asString(value.bankAccountName ?? value.bank_account_name) ?? settings.bankAccountName
      settings.bankAccountNumber =
        asString(value.bankAccountNumber ?? value.bank_account_number ?? value.bank_account) ??
        settings.bankAccountNumber
      settings.paymentQrUrl =
        asString(
          value.paymentQrUrl ??
            value.payment_qr_url ??
            value.bank_qr_url ??
            value.qr_code_url ??
            value.qr_code,
        ) ??
        settings.paymentQrUrl
      settings.paymentInstructions =
        asString(value.paymentInstructions ?? value.payment_instructions ?? value.instructions) ??
        settings.paymentInstructions
    }

    if (key === "shipping" || !key) {
      settings.freeShippingThreshold =
        asNumber(value.freeShippingThreshold ?? value.free_shipping_threshold) ??
        settings.freeShippingThreshold
      settings.shippingFee =
        asNumber(value.shippingFee ?? value.shipping_fee ?? value.shipping_cost) ??
        settings.shippingFee
      settings.estimatedDeliveryDays =
        asString(
          value.estimatedDeliveryDays ??
            value.estimated_delivery_days ??
            value.delivery_days ??
            value.shippingNote ??
            value.shipping_note,
        ) ?? settings.estimatedDeliveryDays
      settings.supportedCities =
        asStringArray(value.supportedCities ?? value.supported_cities).length > 0
          ? asStringArray(value.supportedCities ?? value.supported_cities)
          : settings.supportedCities
    }

    if (key === "social_links" || !key) {
      settings.instagram =
        asString(value.instagram ?? value.instagram_url) ?? settings.instagram
      settings.facebook =
        asString(value.facebook ?? value.facebook_url) ?? settings.facebook
      settings.tiktok = asString(value.tiktok ?? value.tiktok_url) ?? settings.tiktok
      settings.youtube = asString(value.youtube ?? value.youtube_url) ?? settings.youtube
      settings.lineId = asString(value.lineId ?? value.line_id) ?? settings.lineId
    }

    if (key === "notifications" || !key) {
      settings.notificationEmail =
        asString(value.notificationEmail ?? value.notification_email ?? value.admin_email) ??
        settings.notificationEmail
      settings.lineNotifyToken =
        asString(value.lineNotifyToken ?? value.line_notify_token) ?? settings.lineNotifyToken
      settings.defaultLowStockThreshold =
        asNumber(
          value.defaultLowStockThreshold ??
            value.default_low_stock_threshold ??
            value.low_stock_threshold,
        ) ??
        settings.defaultLowStockThreshold
      settings.notifyStockBelow =
        asNumber(
          value.notifyStockBelow ?? value.notify_stock_below ?? value.low_stock_threshold,
        ) ??
        settings.notifyStockBelow
    }

    if (key === "shipping" || !key) {
      settings.notificationEmail =
        asString(value.notificationEmail ?? value.notification_email ?? value.admin_email) ??
        settings.notificationEmail
      settings.defaultLowStockThreshold =
        asNumber(
          value.defaultLowStockThreshold ??
            value.default_low_stock_threshold ??
            value.low_stock_threshold,
        ) ??
        settings.defaultLowStockThreshold
      settings.notifyStockBelow =
        asNumber(
          value.notifyStockBelow ?? value.notify_stock_below ?? value.low_stock_threshold,
        ) ??
        settings.notifyStockBelow
    }
  }

  return settings
}

export function filterAdminDrops(drops: AdminDrop[], search: string) {
  const query = search.trim().toLowerCase()
  if (!query) return drops

  return drops.filter((drop) =>
    [drop.title, drop.slug, drop.status].join(" ").toLowerCase().includes(query),
  )
}

export function filterAdminPosts(posts: AdminPost[], search: string) {
  const query = search.trim().toLowerCase()
  if (!query) return posts

  return posts.filter((post) =>
    [post.title, post.slug, post.category].join(" ").toLowerCase().includes(query),
  )
}

export function filterAdminBanners(banners: AdminBanner[], search: string) {
  const query = search.trim().toLowerCase()
  if (!query) return banners

  return banners.filter((banner) =>
    [banner.title, banner.tag, banner.ctaText, banner.ctaLink]
      .join(" ")
      .toLowerCase()
      .includes(query),
  )
}

export function formatAdminDateTimeInput(value: string | null): string {
  if (!value) {
    return ""
  }

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return ""
  }

  const year = parsed.getFullYear()
  const month = String(parsed.getMonth() + 1).padStart(2, "0")
  const day = String(parsed.getDate()).padStart(2, "0")
  const hours = String(parsed.getHours()).padStart(2, "0")
  const minutes = String(parsed.getMinutes()).padStart(2, "0")

  return `${year}-${month}-${day}T${hours}:${minutes}`
}
