import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ScrollMotionSection } from "@/components/FadeSection"
import { Footer } from "@/components/footer"
import { GoofyButton } from "@/components/GoofyButton"
import PhysicsHero from "@/components/PhysicsHero"
import {
  HomeCategoryShowcase,
  type HomeCategoryData,
  type HomeCategoryKey,
  type HomeCategoryVariant,
  type HomeCategoryProduct,
} from "@/components/homepage/category-showcase"
import {
  FromTheStreets,
  type FromTheStreetsStory,
} from "@/components/homepage/from-the-streets"
import {
  FindYourSpot,
  type FindYourSpotItem,
} from "@/components/homepage/find-your-spot"
import { HomepageMotionShell } from "@/components/homepage/homepage-motion-shell"
import { HomepageLoader } from "@/components/HomepageLoader"
import { LenisProvider } from "@/components/LenisProvider"
import { LiveDropBanner } from "@/components/home/LiveDropBanner"
import { HeroSlider } from "@/components/homepage/hero-slider"
import { LatestVideoMixed } from "@/components/homepage/latest-video-mixed"
import { NewArrivalsSlider } from "@/components/homepage/new-arrivals-slider"
import { ReadyToSkate } from "@/components/homepage/ready-to-skate"
import { NavbarServer } from "@/components/navbar-server"
import { ScrollProgressBar } from "@/components/ScrollProgressBar"
import { SectionDivider } from "@/components/SectionDivider"
import { StaggerList } from "@/components/StaggerList"
import { TopMarquee } from "@/components/top-marquee"
import { SearchCommand } from "@/components/search-command"
import { defaultSeoDescription, defaultSeoTitle } from "@/config/defaults"
import { getHomepageContent } from "@/lib/homepage-content.server"
import { supabase } from "@/lib/supabase"

type GenericRow = Record<string, unknown>

type ProductRow = GenericRow & {
  slug?: string
  name?: string
  price?: number | string
  stock?: number | string
  badge?: string
  category?: string
}

const TOP_MARQUEE_TEXT =
    "First Skate Shop in Laos · New Drop Every Week · ຮ້ານສະເກັດທຳອິດໃນລາວ · Free Shipping Over ₭500,000 · Vientiane Street Culture · Shop · Community · Drops"

const FEATURED_GOOFY_VIDEO_URL = "https://www.youtube.com/watch?v=2WapgjbfXNM"

const HOMEPAGE_CATEGORY_TOPICS: Array<{
  key: HomeCategoryKey
  name: string
  slug: string
  layoutVariant?: HomeCategoryVariant
  backgroundImage?: string | null
  href?: string
}> = [
  { key: "decks", name: "DECKS", slug: "deck", layoutVariant: "hero" },
  { key: "trucks", name: "TRUCKS", slug: "truck", layoutVariant: "stack" },
  { key: "wheels", name: "WHEELS", slug: "wheel", layoutVariant: "stack" },
  { key: "shoes", name: "SHOES", slug: "shoe", layoutVariant: "landscape" },
  { key: "apparel", name: "APPAREL", slug: "apparel", layoutVariant: "wide" },
]

const HOMEPAGE_CATEGORY_TOPIC_BY_KEY = new Map(
    HOMEPAGE_CATEGORY_TOPICS.map((topic) => [topic.key, topic]),
)

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: defaultSeoTitle,
    description: defaultSeoDescription,
    openGraph: {
      title: defaultSeoTitle,
      description: defaultSeoDescription,
      type: "website",
    },
  }
}

function getString(
    record: GenericRow | null | undefined,
    keys: string[],
    fallback = "",
) {
  if (!record) return fallback

  for (const key of keys) {
    const value = record[key]
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim()
    }
  }

  return fallback
}

function getNumber(
    record: GenericRow | null | undefined,
    keys: string[],
    fallback = 0,
) {
  if (!record) return fallback

  for (const key of keys) {
    const value = record[key]
    if (typeof value === "number" && Number.isFinite(value)) {
      return value
    }

    if (typeof value === "string" && value.trim().length > 0) {
      const parsed = Number(value)
      if (Number.isFinite(parsed)) {
        return parsed
      }
    }
  }

  return fallback
}

function getImage(
    record: GenericRow | null | undefined,
    keys = [
      "image",
      "image_url",
      "hero_image",
      "desktop_image",
      "cover_image",
      "thumbnail",
      "photo",
      "images",
    ],
) {
  if (!record) return null

  for (const key of keys) {
    const value = record[key]

    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim()
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        if (typeof item === "string" && item.trim().length > 0) {
          return item.trim()
        }

        if (item && typeof item === "object") {
          const nested = getString(item as GenericRow, ["url", "src", "image"])
          if (nested) return nested
        }
      }
    }

    if (value && typeof value === "object") {
      const nested = getString(value as GenericRow, ["url", "src", "image"])
      if (nested) return nested
    }
  }

  return null
}

function formatDisplayDate(value?: string | null) {
  if (!value) return "March 2026"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "March 2026"

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date)
}

function formatIssueDate(value?: string | null) {
  if (!value) return "12.03.2026"

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "12.03.2026"

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
      .format(date)
      .replace(/\//g, ".")
}

function estimateReadTime(post: GenericRow) {
  const explicit = getNumber(post, ["read_time", "read_minutes"], 0)
  if (explicit > 0) return `${explicit} min read`

  const body = getString(post, ["content", "body", "excerpt", "summary"])
  if (!body) return "4 min read"

  const words = body.split(/\s+/).filter(Boolean).length
  return `${Math.max(2, Math.ceil(words / 200))} min read`
}

function getExcerpt(post: GenericRow) {
  const explicit = getString(post, ["excerpt", "summary", "description", "dek"])
  if (explicit) return explicit

  const body = getString(post, ["content", "body"])
  if (!body) {
    return "Vientiane street culture, local sessions, and new community stories."
  }

  return body.length > 130 ? `${body.slice(0, 127).trim()}...` : body
}

function slugifyValue(value: string) {
  return value
      .trim()
      .toLowerCase()
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
}

function formatCategoryName(value: string) {
  const slug = slugifyValue(value)
  if (!slug) return "CATEGORY"

  return slug
      .split("-")
      .filter(Boolean)
      .map((part) => part.toUpperCase())
      .join(" ")
}

function getCategorySlug(value: string) {
  const normalized = value.trim().toLowerCase()

  if (normalized.includes("deck")) return "deck"
  if (normalized.includes("truck")) return "truck"
  if (normalized.includes("wheel")) return "wheel"
  if (normalized.includes("shoe")) return "shoe"
  if (normalized.includes("apparel")) return "apparel"

  return slugifyValue(value) || "category"
}

function normalizeCategoryKey(value: string) {
  const normalized = value.trim().toLowerCase()

  if (normalized.includes("deck")) return "decks"
  if (normalized.includes("truck")) return "trucks"
  if (normalized.includes("wheel")) return "wheels"
  if (normalized.includes("shoe")) return "shoes"
  if (normalized.includes("apparel")) return "apparel"

  const slug = slugifyValue(value)
  if (!slug) return null

  return slug.endsWith("s") ? slug : `${slug}s`
}

function buildProductCard(product: ProductRow, index: number): HomeCategoryProduct | null {
  const category = getString(product, ["category"], "deck")
  const categoryKey = normalizeCategoryKey(category)
  if (!categoryKey) return null

  const categoryTopic = HOMEPAGE_CATEGORY_TOPIC_BY_KEY.get(categoryKey)
  const categoryLabel = categoryTopic?.name ?? formatCategoryName(category)
  const slug = getString(product, ["slug"], `product-${index}`)
  const stock = Math.max(0, getNumber(product, ["stock"], 0))
  const price = getNumber(product, ["price"], 0)
  const badgeSeed = ["NEW", "HOT", "SALE", "COLLAB", "DROP"][index % 5]
  const badge = getString(product, ["badge"], badgeSeed).toUpperCase()
  const edition =
      badge === "COLLAB" || badge === "DROP"
          ? `Edition ${String((index % 40) + 1).padStart(2, "0")}`
          : `${stock} in stock`

  return {
    id: `${slug}-${index}`,
    slug,
    name: getString(product, ["name"], "Untitled Product"),
    category,
    categoryLabel,
    image: getImage(product),
    price,
    stock,
    badge: ["NEW", "HOT", "SALE", "COLLAB", "DROP"].includes(badge)
        ? badge
        : badgeSeed,
    edition,
    href: `/product/${slug}`,
  }
}

function buildHomepageProducts(products: ProductRow[]): HomeCategoryProduct[] {
  return products
      .map((product, index) => buildProductCard(product, index))
      .filter((product): product is HomeCategoryProduct => product !== null)
}

function buildCategoryData(products: HomeCategoryProduct[]): HomeCategoryData[] {
  const productsByCategory = new Map<HomeCategoryKey, HomeCategoryProduct[]>()

  for (const product of products) {
    const categoryKey = normalizeCategoryKey(product.category)
    if (!categoryKey) continue

    const current = productsByCategory.get(categoryKey) ?? []
    current.push(product)
    productsByCategory.set(categoryKey, current)
  }

  const extraKeys = Array.from(productsByCategory.keys())
      .filter((key) => !HOMEPAGE_CATEGORY_TOPIC_BY_KEY.has(key))
      .sort((left, right) => left.localeCompare(right))

  const orderedKeys = [
    ...HOMEPAGE_CATEGORY_TOPICS.map((topic) => topic.key),
    ...extraKeys,
  ]

  return orderedKeys.map((key) => {
    const topic = HOMEPAGE_CATEGORY_TOPIC_BY_KEY.get(key)
    const categoryProducts = productsByCategory.get(key) ?? []
    const sampleProduct = categoryProducts[0]
    const fallbackSource = sampleProduct?.category ?? key

    return {
      key,
      name: topic?.name ?? sampleProduct?.categoryLabel ?? formatCategoryName(fallbackSource),
      slug: topic?.slug ?? getCategorySlug(fallbackSource),
      href: topic?.href,
      layoutVariant: topic?.layoutVariant,
      backgroundImage: topic?.backgroundImage ?? sampleProduct?.image ?? null,
      image: sampleProduct?.image ?? null,
      products: categoryProducts,
    }
  })
}

function getStoryMeta(post: GenericRow, fallbackIndex: number) {
  const title = getString(post, ["title", "name"], `Story ${fallbackIndex + 1}`)
  const slug = getString(post, ["slug"], `story-${fallbackIndex + 1}`)

  return {
    title,
    slug,
    href: `/news/${slug}`,
    category: getString(post, ["category", "type", "tag"], "Story").toUpperCase(),
    author: getString(post, ["author", "author_name", "writer"], "Goofy Editorial"),
    date: formatDisplayDate(getString(post, ["published_at", "created_at"])),
    readTime: estimateReadTime(post),
    image: getImage(post),
    excerpt: getExcerpt(post),
  }
}

function getSpotMeta(spot: GenericRow, fallbackIndex: number) {
  return {
    name: getString(spot, ["name", "title"], `Spot ${fallbackIndex + 1}`),
    type: getString(spot, ["type", "category", "spot_type"], "Skate Spot").toUpperCase(),
    image: getImage(spot),
  }
}

function getYouTubeId(url: string) {
  if (!url) return ""

  try {
    const parsed = new URL(url)

    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.replace("/", "")
    }

    if (parsed.searchParams.get("v")) {
      return parsed.searchParams.get("v") || ""
    }

    const parts = parsed.pathname.split("/")
    return parts[parts.length - 1] || ""
  } catch {
    return ""
  }
}

function SectionHeading({
                          label,
                          title,
                          actionLabel,
                          actionHref,
                          inverse = false,
                        }: {
  label: string
  title: string
  actionLabel: string
  actionHref: string
  inverse?: boolean
}) {
  return (
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p
              className={`goofy-mono text-[9px] uppercase tracking-[0.22em] ${
                  inverse ? "text-white/38" : "text-[var(--gray)]"
              }`}
          >
            {label}
          </p>
          <h2
              className={`goofy-display mt-2 text-[clamp(38px,6vw,74px)] leading-[0.86] ${
                  inverse ? "text-[var(--white)]" : "text-[var(--black)]"
              }`}
          >
            {title}
          </h2>
        </div>

        <GoofyButton
            href={actionHref}
            variant="ghost"
            className={`px-0 py-0 no-underline ${
                inverse
                    ? "text-white/60 hover:text-[var(--gold)]"
                    : "text-black/56 hover:text-[var(--black)]"
            }`}
        >
          {actionLabel}
        </GoofyButton>
      </div>
  )
}

function CommunityCard({ post }: { post?: GenericRow }) {
  if (!post) {
    return (
        <div className="space-y-4">
          <div className="aspect-[3/2] bg-[#d8d3cb]" />
          <div className="space-y-2">
            <p className="goofy-mono text-[9px] uppercase tracking-[0.18em] text-[var(--gold)]">
              Story
            </p>
            <h3 className="goofy-display text-[34px] leading-[0.88] text-[var(--black)]">
              Placeholder Story
            </h3>
          </div>
        </div>
    )
  }

  const story = getStoryMeta(post, 0)

  return (
      <Link href={story.href} className="group block space-y-4">
        <div className="relative aspect-[3/2] overflow-hidden bg-[#d7d1c8]">
          {story.image ? (
              <Image
                  src={story.image}
                  alt={story.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover grayscale-[25%] transition duration-700 group-hover:scale-[1.04] group-hover:grayscale-0"
              />
          ) : (
              <div className="absolute inset-0 bg-[linear-gradient(135deg,#d9d3cb,#c7bfb3)]" />
          )}
        </div>
        <div className="space-y-3">
          <p className="goofy-mono text-[9px] uppercase tracking-[0.18em] text-[var(--gold)]">
            {story.category}
          </p>
          <h3 className="goofy-display text-[36px] leading-[0.88] text-[var(--black)]">
            {story.title}
          </h3>
          <p className="goofy-mono line-clamp-2 text-[10px] uppercase tracking-[0.14em] text-black/52">
            {story.excerpt}
          </p>
          <div className="flex items-center justify-between gap-4">
          <span className="goofy-mono text-[9px] uppercase tracking-[0.18em] text-black/42">
            {story.date}
          </span>
            <span className="goofy-mono text-[9px] uppercase tracking-[0.18em] text-[var(--black)]">
            Read →
          </span>
          </div>
        </div>
      </Link>
  )
}

function SpotCard({ spot, index }: { spot?: GenericRow; index: number }) {
  if (!spot) {
    return (
        <div className="relative aspect-[2/3] bg-[#d7d1c8]">
          <div className="absolute inset-0 goofy-card-overlay" />
        </div>
    )
  }

  const meta = getSpotMeta(spot, index)

  return (
      <Link href="/skateparks" className="group relative block aspect-[2/3] overflow-hidden">
        {meta.image ? (
            <Image
                src={meta.image}
                alt={meta.name}
                fill
                sizes="(max-width: 1024px) 100vw, 25vw"
                className="object-cover grayscale-[50%] transition duration-700 group-hover:scale-[1.03] group-hover:grayscale-0"
            />
        ) : (
            <div className="absolute inset-0 bg-[linear-gradient(135deg,#171717,#050505)]" />
        )}
        <div className="absolute inset-0 goofy-card-overlay" />
        <div className="absolute inset-x-0 bottom-0 z-10 p-5">
          <p className="goofy-mono text-[8px] uppercase tracking-[0.18em] text-[var(--gold)]">
            {meta.type}
          </p>
          <h3 className="goofy-display mt-3 text-[34px] leading-[0.86] text-[var(--white)]">
            {meta.name}
          </h3>
          <span className="goofy-mono mt-3 inline-block translate-y-4 text-[9px] uppercase tracking-[0.18em] text-[var(--gold)] opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          View Spot →
        </span>
        </div>
      </Link>
  )
}

export default async function HomePage() {
  const [
    bannerRes,
    postsRes,
    productsRes,
    videoRes,
    parksRes,
    homepageContent,
  ] =
      await Promise.all([
        supabase
            .from("banners")
            .select("*")
            .eq("active", true)
            .order("created_at", { ascending: false })
            .limit(1),
        supabase
            .from("posts")
            .select("*")
            .eq("published", true)
            .order("published_at", { ascending: false })
            .limit(6),
        supabase
            .from("products")
            .select("*")
            .eq("active", true)
            .order("created_at", { ascending: false })
            .limit(20),
        supabase
            .from("videos")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(1),
        supabase
            .from("skateparks")
            .select("*")
            .order("created_at", { ascending: false })
            .limit(4),
        getHomepageContent(),
      ])

  const bannerRows = bannerRes.data ?? []
  const postsRows = postsRes.data ?? []

  let productRows = productsRes.data ?? []
  if (!productRows.length && productsRes.error) {
    const fallbackProducts = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20)
    productRows = (fallbackProducts.data ?? []) as ProductRow[]
  }

  let videoRows = videoRes.data ?? []
  if (!videoRows.length && videoRes.error) {
    const fallbackVideo = await supabase
        .from("videos")
        .select("*")
        .order("published_date", { ascending: false })
        .limit(1)
    videoRows = fallbackVideo.data ?? []
  }

  let parkRows = parksRes.data ?? []
  if (!parkRows.length && parksRes.error) {
    const fallbackParks = await supabase.from("skateparks").select("*").limit(4)
    parkRows = fallbackParks.data ?? []
  }

  const banner = (bannerRows[0] ?? null) as GenericRow | null
  const heroImage = getImage(banner)
  const heroBannerLabel = getString(
      banner,
      ["title", "headline", "name"],
      "Street Issue",
  )

  const magazineStories =
      postsRows.length >= 6
          ? (postsRows.slice(3, 6) as GenericRow[])
          : (postsRows.slice(0, 3) as GenericRow[])
  const visibleMagazineStories = magazineStories.filter(Boolean)
  const fromTheStreetsStories: FromTheStreetsStory[] = (postsRows.slice(
      0,
      3,
  ) as GenericRow[]).map((post, index) => {
    const story = getStoryMeta(post, index)
    const fallbackTags = ["FEATURE", "STORY", "SPOTLIGHT"]

    return {
      id: story.slug,
      title: story.title,
      date: formatIssueDate(getString(post, ["published_at", "created_at"])),
      tag: story.category === "STORY" ? fallbackTags[index] ?? "STORY" : story.category,
      image: story.image,
      href: story.href,
    }
  })
  const findYourSpotItems: FindYourSpotItem[] = (parkRows as GenericRow[])
      .slice(0, 4)
      .map((park, index) => {
        const name = getString(park, ["name", "title"], `Spot ${index + 1}`)
        const locationLabel = getString(park, ["city", "address"], "Vientiane, Laos")
        const directMapUrl = getString(park, [
          "map_url",
          "google_maps_url",
          "maps_url",
          "link",
          "url",
        ])

        return {
          id: getString(park, ["id"], `park-${index + 1}`),
          name,
          mapUrl:
              directMapUrl ||
              `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${name}, ${locationLabel}`,
              )}`,
          image: getImage(park, ["photo", "image", "image_url", "thumbnail"]),
        }
      })

  const homepageProducts = buildHomepageProducts(productRows as ProductRow[])
  const newArrivalProducts = homepageProducts
      .filter((product) => product.badge === "NEW" || product.badge === "HOT")
      .slice(0, 8)
  const categoryData = buildCategoryData(homepageProducts)

  const latestVideo = (videoRows[0] ?? null) as GenericRow | null
  const videoTitle = getString(latestVideo, ["title", "name"], "Latest Video")
  const videoDescription = getExcerpt(latestVideo ?? {})
  const videoUrl = homepageContent.featuredVideo.videoUrl || FEATURED_GOOFY_VIDEO_URL
  const videoPlaybackSrc = homepageContent.featuredVideo.videoUrl || FEATURED_GOOFY_VIDEO_URL
  const videoId = getYouTubeId(videoUrl)
  const videoThumbnail = videoId
      ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
      : getImage(latestVideo)
  const parallaxBackdrop =
      heroImage ||
      homepageContent.heroSlides[0]?.rightImage ||
      fromTheStreetsStories[0]?.image ||
      findYourSpotItems[0]?.image ||
      homepageContent.readyToSkate.backgroundImage ||
      null

  return (
      <main className="relative min-h-screen overflow-x-clip bg-transparent transition-colors duration-500">
        <LenisProvider>
          <HomepageLoader>
            <HomepageMotionShell parallaxImage={parallaxBackdrop}>
              {/* ── Scroll progress bar ── */}
              <ScrollProgressBar />

              <TopMarquee text={homepageContent.topMarqueeText || TOP_MARQUEE_TEXT} />

              <NavbarServer topOffset={24} />

              <div className="relative z-10 pt-[76px]">
                {/* ── Hero: full depth parallax ── */}
                <div data-homepage-depth="2.1">
                  <HeroSlider fallbackSlides={homepageContent.heroSlides} />
                </div>

                {/* ── Physics section ── */}
                <div data-homepage-depth="0.9">
                  <ScrollMotionSection distance={84} exitDistance={22}>
                    <PhysicsHero />
                  </ScrollMotionSection>
                </div>

                {/* ── Live drop banner ── */}
                <div data-homepage-depth="0.7">
                  <ScrollMotionSection distance={108} exitDistance={28}>
                    <LiveDropBanner />
                  </ScrollMotionSection>
                </div>

                {/* ── Section divider ── */}
                <SectionDivider variant="diamond" />

                {/* ══════════════════════════════════════════
                NEW ARRIVALS — horizontal scrub (pin mode)
                The NewArrivalsSlider now has its own pin internally,
                so we use a lighter ScrollMotionSection wrapper
                ══════════════════════════════════════════ */}
                {newArrivalProducts.length > 0 ? (
                    <div data-homepage-depth="1.1">
                      <ScrollMotionSection distance={100} exitDistance={30}>
                        <NewArrivalsSlider products={newArrivalProducts} />
                      </ScrollMotionSection>
                    </div>
                ) : null}

                <SectionDivider variant="fade" />

                {/* ── Category showcase ── */}
                <div data-homepage-depth="1.2">
                  <ScrollMotionSection distance={148} exitDistance={42}>
                    <HomeCategoryShowcase categories={categoryData} />
                  </ScrollMotionSection>
                </div>

                <SectionDivider variant="line" />

                {/* ── Magazine stories strip ── */}
                {visibleMagazineStories.length > 0 ? (
                    <div data-homepage-depth="1.5">
                      <ScrollMotionSection distance={172} exitDistance={48}>
                        <section className="bg-transparent">
                          <StaggerList
                              delay={0.08}
                              className={`grid gap-[2px] ${
                                  visibleMagazineStories.length === 1
                                      ? "grid-cols-1"
                                      : visibleMagazineStories.length === 2
                                          ? "md:grid-cols-[1.35fr_1fr]"
                                          : "md:grid-cols-[2fr_1fr_1fr]"
                              }`}
                          >
                            {visibleMagazineStories.map((post, index) => {
                              const story = getStoryMeta(post, index)

                              return (
                                  <Link
                                      key={story.slug}
                                      href={story.href}
                                      className="group relative block min-h-[280px] overflow-hidden md:h-[400px]"
                                  >
                                    {story.image ? (
                                        <Image
                                            src={story.image}
                                            alt={story.title}
                                            fill
                                            sizes={
                                              visibleMagazineStories.length === 1
                                                  ? "100vw"
                                                  : index === 0
                                                      ? "(max-width: 1024px) 100vw, 50vw"
                                                      : "(max-width: 1024px) 100vw, 25vw"
                                            }
                                            className="homepage-media-fade object-cover grayscale transition duration-700 group-hover:scale-[1.03] group-hover:grayscale-0"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 bg-[linear-gradient(135deg,#171717,#060606)]" />
                                    )}
                                    <div className="absolute inset-0 goofy-card-overlay" />
                                    <div className="absolute inset-x-0 bottom-0 z-10 p-5">
                                      <p className="goofy-mono text-[8px] uppercase tracking-[0.18em] text-white/54">
                                        {story.category}
                                      </p>
                                      <h3
                                          className={`goofy-display mt-3 leading-[0.86] text-[var(--white)] ${
                                              index === 0
                                                  ? "text-[clamp(32px,4.5vw,56px)]"
                                                  : "text-[clamp(24px,2.8vw,36px)]"
                                          }`}
                                      >
                                        {story.title}
                                      </h3>
                                      <span className="goofy-btn mt-5 bg-[var(--white)] text-[var(--black)] opacity-0 transition-all duration-300 group-hover:opacity-100">
                                Read More {"->"}
                              </span>
                                    </div>
                                  </Link>
                              )
                            })}
                          </StaggerList>
                        </section>
                      </ScrollMotionSection>
                    </div>
                ) : null}

                <SectionDivider variant="diamond" />

                {/* ── From the Streets ── */}
                <div data-homepage-depth="1.15">
                  <ScrollMotionSection distance={162} exitDistance={46}>
                    <FromTheStreets
                        stories={fromTheStreetsStories}
                        fallbackStories={homepageContent.fallbackStories}
                    />
                  </ScrollMotionSection>
                </div>

                <SectionDivider variant="fade" />

                {/* ── Find Your Spot ── */}
                <div data-homepage-depth="0.95">
                  <ScrollMotionSection distance={156} exitDistance={42}>
                    <FindYourSpot
                        spots={findYourSpotItems}
                        fallbackSpots={homepageContent.fallbackSpots}
                    />
                  </ScrollMotionSection>
                </div>

                <SectionDivider variant="line" />

                {/* ══════════════════════════════════════════
                VIDEO SECTION — cinematic strip reveal
                Uses its own internal GSAP scrub for the
                strip width/borderRadius animation
                ══════════════════════════════════════════ */}
                <div data-homepage-depth="1.1">
                  <ScrollMotionSection distance={120} exitDistance={34}>
                    <LatestVideoMixed
                        title={videoTitle}
                        description={videoDescription}
                        href={videoUrl || undefined}
                        image={videoThumbnail}
                        metaLabel={homepageContent.featuredVideo.metaLabel}
                        videoSrc={videoPlaybackSrc || undefined}
                        primaryButtonLabel={homepageContent.featuredVideo.primaryButtonLabel}
                        primaryButtonHref={homepageContent.featuredVideo.primaryButtonHref}
                        secondaryButtonLabel={homepageContent.featuredVideo.secondaryButtonLabel}
                        secondaryButtonHref={homepageContent.featuredVideo.secondaryButtonHref}
                        footerHint={homepageContent.featuredVideo.footerHint}
                    />
                  </ScrollMotionSection>
                </div>

                <SectionDivider variant="diamond" />

                {/* ══════════════════════════════════════════
                READY TO SKATE — full parallax CTA
                Has its own internal scroll-driven opacity
                ══════════════════════════════════════════ */}
                <div data-homepage-depth="1.25">
                  <ScrollMotionSection distance={80} exitDistance={20}>
                    <ReadyToSkate content={homepageContent.readyToSkate} />
                  </ScrollMotionSection>
                </div>
              </div>

              {/* ── Footer ── */}
              <div data-homepage-depth="0.55">
                <ScrollMotionSection distance={96} exitDistance={18}>
                  <Footer />
                </ScrollMotionSection>
              </div>
              <SearchCommand />
            </HomepageMotionShell>
          </HomepageLoader>
        </LenisProvider>
      </main>
  )
}