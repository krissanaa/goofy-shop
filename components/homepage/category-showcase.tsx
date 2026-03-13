import Image from "next/image"
import Link from "next/link"

export type HomeCategoryKey = string
export type HomeCategoryVariant = "hero" | "stack" | "landscape" | "wide"

export interface HomeCategoryProduct {
  id: string
  slug: string
  name: string
  category: string
  categoryLabel: string
  image: string | null
  price: number
  stock: number
  badge: string
  edition: string
  href: string
}

export interface HomeCategoryData {
  key: HomeCategoryKey
  name: string
  slug: string
  href?: string
  layoutVariant?: HomeCategoryVariant
  backgroundImage?: string | null
  image: string | null
  products: HomeCategoryProduct[]
}

const CATEGORY_TINTS: Record<string, string> = {
  decks: "rgba(240,180,41,0.26)",
  trucks: "rgba(61,97,167,0.22)",
  wheels: "rgba(110,62,173,0.2)",
  shoes: "rgba(34,112,82,0.2)",
  apparel: "rgba(124,68,142,0.18)",
}

const FALLBACK_TINTS = [
  "rgba(240,180,41,0.22)",
  "rgba(61,97,167,0.18)",
  "rgba(110,62,173,0.18)",
  "rgba(34,112,82,0.18)",
  "rgba(124,68,142,0.16)",
  "rgba(167,96,61,0.18)",
]

const LAYOUT_CLASS_BY_VARIANT: Record<HomeCategoryVariant, string> = {
  hero: "lg:col-span-7 lg:row-span-2",
  stack: "lg:col-span-5",
  landscape: "lg:col-span-4",
  wide: "lg:col-span-8",
}

function getBackgroundImage(
  category: HomeCategoryData,
  featuredProduct?: HomeCategoryProduct,
) {
  return category.backgroundImage ?? featuredProduct?.image ?? category.image ?? null
}

function getCategoryTint(key: string, index: number) {
  return CATEGORY_TINTS[key] ?? FALLBACK_TINTS[index % FALLBACK_TINTS.length]
}

function getLayoutConfig(index: number, override?: HomeCategoryVariant) {
  if (override) {
    return {
      variant: override,
      className: LAYOUT_CLASS_BY_VARIANT[override],
    }
  }

  if (index === 0) {
    return {
      variant: "hero" as const,
      className: LAYOUT_CLASS_BY_VARIANT.hero,
    }
  }

  if (index === 1 || index === 2) {
    return {
      variant: "stack" as const,
      className: LAYOUT_CLASS_BY_VARIANT.stack,
    }
  }

  const cycle = (index - 3) % 3
  if (cycle === 1) {
    return {
      variant: "wide" as const,
      className: LAYOUT_CLASS_BY_VARIANT.wide,
    }
  }

  return {
    variant: "landscape" as const,
    className: LAYOUT_CLASS_BY_VARIANT.landscape,
  }
}

function getTitleClassName(variant: HomeCategoryVariant) {
  if (variant === "hero") return "text-[clamp(88px,9vw,126px)]"
  if (variant === "wide") return "text-[clamp(60px,5vw,86px)]"
  if (variant === "landscape") return "text-[clamp(54px,4.5vw,76px)]"
  return "text-[clamp(58px,5vw,82px)]"
}

function getWatermarkClassName(variant: HomeCategoryVariant) {
  if (variant === "hero") {
    return "right-[10%] top-1/2 text-[clamp(110px,12vw,190px)]"
  }

  if (variant === "wide") {
    return "right-[6%] top-1/2 text-[clamp(96px,9vw,160px)]"
  }

  if (variant === "landscape") {
    return "right-[8%] top-1/2 text-[clamp(92px,8vw,148px)]"
  }

  return "right-[7%] top-1/2 text-[clamp(92px,8vw,148px)]"
}

function getCardPaddingClassName(variant: HomeCategoryVariant) {
  if (variant === "hero") return "justify-between p-6 md:p-8 lg:p-10"
  return "justify-between p-5 md:p-6"
}

function getCardHeightClassName(variant: HomeCategoryVariant) {
  if (variant === "hero") return "min-h-[480px] sm:min-h-[540px] lg:min-h-0"
  if (variant === "wide") return "min-h-[210px] sm:min-h-[230px] lg:min-h-0"
  if (variant === "landscape") return "min-h-[210px] sm:min-h-[230px] lg:min-h-0"
  return "min-h-[230px] sm:min-h-[250px] lg:min-h-0"
}

function getImageSizes(variant: HomeCategoryVariant) {
  return variant === "hero"
    ? "(max-width: 1024px) 100vw, 58vw"
    : "(max-width: 1024px) 100vw, 42vw"
}

function CategoryCard({
  category,
  index,
  totalCount,
  variant,
  className,
}: {
  category: HomeCategoryData
  index: number
  totalCount: number
  variant: HomeCategoryVariant
  className?: string
}) {
  const featuredProduct = category.products[0]
  const buttonLabel = "Browse Products ->"
  const cardHref = category.href ?? `/shop?category=${category.slug}`
  const tint = getCategoryTint(category.key, index)
  const backgroundImage = getBackgroundImage(category, featuredProduct)
  const titleClassName = getTitleClassName(variant)
  const watermarkClassName = getWatermarkClassName(variant)
  const contentClassName = getCardPaddingClassName(variant)
  const cardHeightClassName = getCardHeightClassName(variant)
  const titleLeadingClassName =
    variant === "hero" ? "leading-[0.76]" : "leading-[0.78]"

  return (
    <Link
      href={cardHref}
      className={`group relative isolate z-0 block overflow-hidden border border-[var(--bordw)] bg-[#080808] transition-[transform,z-index] duration-300 hover:z-30 focus-visible:z-30 ${cardHeightClassName} ${className ?? ""}`}
    >
      {backgroundImage ? (
        <Image
          src={backgroundImage}
          alt={category.name}
          fill
          priority={variant === "hero"}
          sizes={getImageSizes(variant)}
          className={`object-cover transition duration-700 group-hover:scale-[1.04] ${
            category.backgroundImage
              ? "opacity-[0.24] saturate-[0.85]"
              : "opacity-[0.18] saturate-[0.75]"
          }`}
        />
      ) : null}

      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `radial-gradient(circle at 22% 18%, ${tint} 0%, transparent 46%), linear-gradient(180deg, rgba(255,255,255,0.01), rgba(0,0,0,0.18)), linear-gradient(180deg, #0b0b0b 0%, #040404 100%)`,
        }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,4,4,0.08),rgba(4,4,4,0.32)_44%,rgba(4,4,4,0.94)_100%)] transition duration-300 group-hover:bg-[linear-gradient(180deg,rgba(4,4,4,0.12),rgba(4,4,4,0.4)_44%,rgba(4,4,4,0.97)_100%)]" />

      <span className="absolute right-5 top-5 z-20 goofy-mono text-[8px] uppercase tracking-[0.22em] text-white/18">
        {String(index + 1).padStart(2, "0")} / {String(totalCount).padStart(2, "0")}
      </span>

      <div
        className={`pointer-events-none absolute z-10 -translate-y-1/2 goofy-display uppercase leading-none text-white/[0.04] ${watermarkClassName}`}
      >
        {category.name}
      </div>

      <div className={`absolute inset-0 z-20 flex h-full flex-col ${contentClassName}`}>
        <div className="flex h-full flex-col justify-between">
          <div />
          <div>
            <h3
              className={`goofy-display text-[var(--white)] ${titleClassName} ${titleLeadingClassName}`}
            >
              {category.name}
            </h3>
            <span className="relative z-30 mt-4 inline-flex w-fit border border-white/16 bg-black/40 text-[var(--white)] opacity-100 transition-all duration-300 hover:border-white hover:bg-white hover:text-[var(--black)] md:translate-y-3 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100">
              {buttonLabel}
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

export function HomeCategoryShowcase({
  categories,
}: {
  categories: HomeCategoryData[]
}) {
  const displayCategories = categories.filter((category) => Boolean(category?.key))

  if (displayCategories.length === 0) return null

  return (
    <section className="bg-[var(--black)] px-5 py-10 text-[var(--white)] md:px-8 md:py-12 xl:px-10">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-4 flex items-center justify-between gap-4">
          <p className="goofy-mono text-[9px] uppercase tracking-[0.24em] text-white/36">
            Shop by Category
          </p>

          <Link
            href="/shop"
            className="goofy-mono text-[9px] uppercase tracking-[0.18em] text-white/50 transition-colors hover:text-[var(--gold)]"
          >
            View Full Shop {"->"}
          </Link>
        </div>

        <div className="grid gap-[2px] lg:grid-flow-dense lg:grid-cols-12 lg:auto-rows-[minmax(180px,auto)]">
          {displayCategories.map((category, index) => {
            const layout = getLayoutConfig(index, category.layoutVariant)

            return (
              <CategoryCard
                key={`${category.key}-${index}`}
                category={category}
                index={index}
                totalCount={displayCategories.length}
                variant={layout.variant}
                className={layout.className}
              />
            )
          })}
        </div>
      </div>
    </section>
  )
}
