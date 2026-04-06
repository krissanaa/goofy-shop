"use client"

import Image from "next/image"
import Link from "next/link"
import { motion, type Variants } from "framer-motion"

export type HomeCategoryKey =
  | "decks"
  | "trucks"
  | "wheels"
  | "shoes"
  | "apparel"
  | (string & {})

export type HomeCategoryVariant = "hero" | "stack" | "landscape" | "wide"

export type HomeCategoryProduct = {
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

export type HomeCategoryData = {
  key: HomeCategoryKey
  name: string
  slug: string
  href?: string
  layoutVariant?: HomeCategoryVariant
  backgroundImage?: string | null
  image?: string | null
  products: HomeCategoryProduct[]
}

const FALLBACK_IMAGES: Record<string, string> = {
  decks:
    "https://images.unsplash.com/photo-1564982752979-3f7ba97481c6?auto=format&fit=crop&q=80&w=1200",
  trucks:
    "https://images.unsplash.com/photo-1620012253972-e1e3b62f43ce?auto=format&fit=crop&q=80&w=1200",
  wheels:
    "https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&q=80&w=1200",
  shoes:
    "https://images.unsplash.com/photo-1608231387042-66d1773070a5?auto=format&fit=crop&q=80&w=1200",
  apparel:
    "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&q=80&w=1200",
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
}

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 20 },
  },
}

function getCardLayout(category: HomeCategoryData, index: number) {
  if (category.key === "decks") {
    return {
      gridClasses: "md:col-span-6 md:row-span-2 min-h-[340px] md:min-h-[400px]",
      titleSize: "text-6xl md:text-[6rem]",
    }
  }

  if (category.key === "trucks") {
    return {
      gridClasses: "md:col-span-6 md:row-span-1 min-h-[160px] md:min-h-[200px]",
      titleSize: "text-5xl md:text-6xl",
    }
  }

  if (category.key === "wheels") {
    return {
      gridClasses: "md:col-span-6 md:row-span-1 min-h-[160px] md:min-h-[200px]",
      titleSize: "text-5xl md:text-6xl",
    }
  }

  if (category.key === "shoes") {
    return {
      gridClasses: "md:col-span-4 md:row-span-1 min-h-[160px] md:min-h-[200px]",
      titleSize: "text-5xl md:text-6xl",
    }
  }

  if (category.key === "apparel") {
    return {
      gridClasses: "md:col-span-8 md:row-span-1 min-h-[160px] md:min-h-[200px]",
      titleSize: "text-5xl md:text-6xl",
    }
  }

  if (category.layoutVariant === "hero") {
    return {
      gridClasses: "md:col-span-6 md:row-span-2 min-h-[340px] md:min-h-[400px]",
      titleSize: "text-6xl md:text-[6rem]",
    }
  }

  if (category.layoutVariant === "wide") {
    return {
      gridClasses: "md:col-span-8 md:row-span-1 min-h-[160px] md:min-h-[200px]",
      titleSize: "text-5xl md:text-6xl",
    }
  }

  if (category.layoutVariant === "landscape") {
    return {
      gridClasses: "md:col-span-4 md:row-span-1 min-h-[160px] md:min-h-[200px]",
      titleSize: "text-5xl md:text-6xl",
    }
  }

  return {
    gridClasses:
      index % 3 === 0
        ? "md:col-span-6 md:row-span-1 min-h-[180px] md:min-h-[220px]"
        : "md:col-span-3 md:row-span-1 min-h-[160px] md:min-h-[200px]",
    titleSize: "text-4xl md:text-5xl",
  }
}

function getCardImage(category: HomeCategoryData) {
  return (
    category.backgroundImage ??
    category.image ??
    category.products[0]?.image ??
    FALLBACK_IMAGES[category.key] ??
    FALLBACK_IMAGES.decks
  )
}

function getCardHref(category: HomeCategoryData) {
  return category.href ?? `/shop?category=${category.slug}`
}

function getCardNumber(index: number, total: number) {
  const current = String(index + 1).padStart(2, "0")
  const count = String(total).padStart(2, "0")
  return `${current} / ${count}`
}

export function HomeCategoryShowcase({
  categories,
}: {
  categories: HomeCategoryData[]
}) {
  if (!categories.length) return null

  return (
    <section className="relative z-10 w-full bg-transparent px-4 py-24 text-black transition-colors duration-500 dark:text-white md:px-12">
      <div className="mx-auto max-w-[1480px]">
        <div className="mb-8 flex items-end justify-between gap-4 goofy-mono text-[10px] uppercase tracking-widest text-black/48 transition-colors duration-500 dark:text-white/50">
          <span>Shop by Category</span>
          <Link
            href="/shop"
            className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-black/72 transition-colors duration-300 hover:text-black dark:text-white dark:hover:text-[#F0B429]"
          >
            View Full Shop -{">"}
          </Link>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 gap-4 md:grid-cols-12 md:grid-rows-3"
        >
          {categories.map((category, index) => {
            const { gridClasses, titleSize } = getCardLayout(category, index)
            const imageSrc = getCardImage(category)

            return (
              <motion.div
                key={`${category.key}-${category.slug}-${index}`}
                variants={itemVariants}
                className={gridClasses}
              >
                <Link
                  href={getCardHref(category)}
                  className="group relative block h-full w-full overflow-hidden rounded-md border border-black/10 bg-white/35 p-5 shadow-[0_16px_40px_rgba(5,5,5,0.08)] transition-colors duration-300 hover:border-[#F0B429] dark:border-white/10 dark:bg-[#0A0A0C] dark:shadow-none md:p-6"
                >
                  <div className="absolute inset-0 z-0 h-full w-full overflow-hidden">
                    <Image
                      src={imageSrc}
                      alt={category.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                      className="origin-center object-cover brightness-50 grayscale transition-all duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:scale-110 group-hover:brightness-90 group-hover:grayscale-0"
                    />
                    <div className="absolute inset-0 bg-black/52 transition-colors duration-500 group-hover:bg-black/18 dark:bg-black/40 dark:group-hover:bg-transparent" />
                  </div>

                  <div className="relative z-10 flex h-full flex-col justify-between">
                    <div className="self-end goofy-mono text-[10px] tracking-[0.2em] text-white/50 transition-colors duration-300 group-hover:text-[#F0B429]">
                      {getCardNumber(index, categories.length)}
                    </div>

                    <div className="mt-auto flex flex-col items-start gap-4 md:gap-5">
                      <h2
                        className={`max-w-[92%] leading-none text-white transition-all duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] group-hover:-skew-x-6 group-hover:scale-x-95 group-hover:scale-y-[1.7] group-hover:text-transparent group-hover:[-webkit-text-stroke:2.5px_#F0B429] ${titleSize} goofy-display uppercase tracking-tight`}
                      >
                        {category.name}
                      </h2>

                      <span className="inline-flex items-center gap-3 rounded-full border border-[#F0B429]/30 bg-white/88 px-3 py-1.5 translate-y-4 goofy-mono text-[10px] font-bold uppercase tracking-[0.24em] text-transparent opacity-0 backdrop-blur-[2px] transition-all duration-500 delay-100 group-hover:translate-y-0 group-hover:text-[#8a6200] group-hover:opacity-100 dark:bg-black/35 dark:group-hover:text-[#F0B429] md:px-4 md:py-2 md:text-xs">
                        Browse Products -{">"}
                      </span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

export default HomeCategoryShowcase
