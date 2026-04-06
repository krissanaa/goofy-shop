"use client"

import Image from "next/image"
import Link from "next/link"
import { type MouseEvent, useState } from "react"
import { motion } from "framer-motion"
import { useCart } from "@/hooks/use-cart"
import type { HomeCategoryProduct } from "@/components/homepage/category-showcase"

interface NewArrivalsSliderProps {
  products: HomeCategoryProduct[]
}

const CATEGORY_BACKGROUNDS: Record<string, string> = {
  DECKS: "linear-gradient(135deg, #20170A 0%, #080808 100%)",
  TRUCKS: "linear-gradient(135deg, #0B1220 0%, #080808 100%)",
  WHEELS: "linear-gradient(135deg, #130C1C 0%, #080808 100%)",
  SHOES: "linear-gradient(135deg, #091510 0%, #080808 100%)",
  APPAREL: "linear-gradient(135deg, #150D18 0%, #080808 100%)",
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value)
}

function getFallbackBackground(product: HomeCategoryProduct) {
  return (
    CATEGORY_BACKGROUNDS[product.categoryLabel] ??
    "linear-gradient(135deg, #141414 0%, #050505 100%)"
  )
}

function getRibbonLabel(product: HomeCategoryProduct) {
  const badge = product.badge.toUpperCase()

  if (badge === "NEW") return "JUST DROPPED"
  if (badge === "HOT") return "HOT PICK"
  if (badge === "SALE") return "PRICE CUT"
  if (badge === "DROP") return "LIMITED DROP"
  if (badge === "COLLAB") return "COLLAB ISSUE"

  return "FRESH STOCK"
}

function getSku(product: HomeCategoryProduct, index: number) {
  const parts = product.slug
    .split("-")
    .filter(Boolean)
    .slice(0, 3)
    .map((part) => part.slice(0, 2).toUpperCase())

  const core = parts.length > 0 ? parts.join("") : "GF"
  return `GF-${core}-${String(index + 1).padStart(3, "0")}`
}

function getOptionLabels(product: HomeCategoryProduct) {
  const category = product.categoryLabel.toUpperCase()

  if (category.includes("DECK")) return ['8.0"', '8.25"', '8.5"', '8.75"']
  if (category.includes("TRUCK")) return ["139", "144", "149", "159"]
  if (category.includes("WHEEL")) return ["52MM", "54MM", "56MM", "58MM"]
  if (category.includes("SHOE")) return ["US 8", "US 9", "US 10", "US 11"]
  if (category.includes("APPAREL")) return ["S", "M", "L", "XL"]

  return ["STD", "PRO", "TEAM", "DLX"]
}

function getRotationClass(index: number) {
  const rotations = ["rotate-[4deg]", "-rotate-[3deg]", "rotate-[2deg]", "-rotate-[4deg]"]
  return rotations[index % rotations.length]
}

const editorialEase = [0.16, 1, 0.3, 1] as const

const revealContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.08,
    },
  },
}

const revealItem = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: editorialEase,
    },
  },
}

export function NewArrivalsSlider({ products }: NewArrivalsSliderProps) {
  const { addItem } = useCart()
  const [addingId, setAddingId] = useState<string | null>(null)

  const handleAddToCart = (
    event: MouseEvent<HTMLButtonElement>,
    product: HomeCategoryProduct,
  ) => {
    event.preventDefault()
    event.stopPropagation()

    if (product.stock <= 0) return

    setAddingId(product.id)
    addItem({
      productId: product.slug,
      name: product.name,
      category: product.categoryLabel,
      image: product.image || "/placeholder.jpg",
      price: product.price,
      quantity: 1,
      maxStock: Math.max(product.stock, 1),
    })

    window.setTimeout(() => {
      setAddingId((current) => (current === product.id ? null : current))
    }, 900)
  }

  return (
    <section className="relative overflow-hidden bg-transparent px-4 py-24 text-black transition-colors duration-500 dark:text-white md:px-12">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.42)_0%,rgba(245,245,245,0)_100%)] transition-colors duration-500 dark:bg-[linear-gradient(180deg,#050505_0%,#0a0a0c_100%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.07] mix-blend-overlay [background-image:radial-gradient(circle_at_20%_20%,rgba(0,0,0,0.8)_0.6px,transparent_0.8px)] [background-size:9px_9px] transition-colors duration-500 dark:[background-image:radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.9)_0.6px,transparent_0.8px)]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-48 bg-[radial-gradient(circle_at_top,rgba(240,180,41,0.14),transparent_62%)]" />

      <div className="mx-auto max-w-[1480px]">
        <div className="relative z-10 flex items-end justify-between gap-5">
          <div className="space-y-3">
            <p className="goofy-mono text-[10px] uppercase tracking-[0.3em] text-[#B98300] transition-colors duration-500 dark:text-[#F0B429]">
              JUST LANDED // FRESH WOOD
            </p>
            <h2 className="goofy-display text-[clamp(42px,6vw,80px)] italic leading-[0.84] text-black transition-colors duration-500 dark:text-white">
              New Arrivals
            </h2>
          </div>

          <Link
            href="/shop"
            className="font-mono text-[10px] font-bold uppercase tracking-[0.3em] text-black/68 transition-colors duration-300 hover:text-black dark:text-white dark:hover:text-[#F0B429]"
          >
            Shop All -{">"}
          </Link>
        </div>

        <motion.div
          variants={revealContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="relative z-10 mt-14 flex snap-x gap-8 overflow-x-auto px-2 py-6 [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none" }}
        >
          {products.map((product, index) => (
            <motion.article
              key={product.id}
              variants={revealItem}
              className="w-[306px] shrink-0 snap-start md:w-[328px]"
            >
              <div className="group/card [perspective:1200px]">
                <div
                  className={`${getRotationClass(index)} transition-transform duration-500 ease-[cubic-bezier(0.175,0.885,0.32,1.275)] group-hover/card:rotate-0 group-hover/card:scale-[1.05]`}
                >
                  <div className="relative h-[440px] w-full transition-transform duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] [transform-style:preserve-3d] group-hover/card:[transform:rotateY(180deg)]">
                    <div className="absolute inset-0 overflow-hidden rounded-[4px] border-2 border-[#050505] bg-[#F4F0EB] shadow-[-8px_8px_0px_#F0B429] [backface-visibility:hidden]">
                      <Link
                        href={product.href}
                        aria-label={product.name}
                        className="absolute inset-0 z-10"
                      />

                      <div className="absolute left-[-36px] top-[18px] z-20 rotate-[-45deg] border border-dashed border-black/20 bg-[#F0B429] px-10 py-1 goofy-mono text-[11px] font-bold uppercase tracking-[0.18em] text-black">
                        {getRibbonLabel(product)}
                      </div>

                      <div className="flex h-full flex-col justify-between">
                        <div className="relative h-[260px] overflow-hidden border-b-2 border-[#050505] bg-white">
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              fill
                              sizes="(max-width: 768px) 306px, 328px"
                              className="object-cover transition duration-700 group-hover/card:scale-[1.04]"
                            />
                          ) : (
                            <div
                              className="absolute inset-0"
                              style={{ background: getFallbackBackground(product) }}
                            />
                          )}
                        </div>

                        <div className="flex flex-1 flex-col justify-between p-4">
                          <div>
                            <p className="goofy-mono text-[10px] uppercase tracking-[0.12em] text-black/60">
                              SKU: {getSku(product, index)}
                            </p>
                            <h3 className="mt-1 text-[24px] leading-none text-[#050505] goofy-display italic uppercase">
                              {product.name}
                            </h3>
                          </div>

                          <div className="flex items-end justify-between gap-4">
                            <p className="goofy-mono text-[20px] font-bold text-[#050505]">
                              {formatPrice(product.price)}
                            </p>
                            <span className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#050505] text-[#050505] transition-colors duration-300 group-hover/card:bg-[#050505] group-hover/card:text-[#F4F0EB]">
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M21 2v6h-6" />
                                <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                <path d="M3 2v6h6" />
                              </svg>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="absolute inset-0 flex rounded-[4px] border-2 border-[#050505] bg-[#F0B429] p-6 shadow-[8px_8px_0px_#050505] [backface-visibility:hidden] [transform:rotateY(180deg)]">
                      <div className="flex w-full flex-col">
                        <h3 className="border-b-4 border-[#050505] pb-2 text-[30px] leading-none text-[#050505] goofy-display italic uppercase">
                          Select
                          <br />
                          Setup
                        </h3>

                        <div className="mt-6 grid grid-cols-2 gap-2">
                          {getOptionLabels(product).map((option, optionIndex) => {
                            const isActive = optionIndex === 1
                            const isMuted = optionIndex === 3 && product.stock < 3

                            return (
                              <div
                                key={`${product.id}-${option}`}
                                className={`grid min-h-12 place-items-center border-2 text-[18px] uppercase transition-colors ${
                                  isActive
                                    ? "border-[#050505] bg-[#050505] text-[#F0B429]"
                                    : isMuted
                                      ? "border-dashed border-black/30 text-black/35"
                                      : "border-[#050505] bg-transparent text-[#050505]"
                                }`}
                              >
                                {option}
                              </div>
                            )
                          })}
                        </div>

                        <div className="mt-auto space-y-3">
                          <div className="grid grid-cols-2 gap-2 goofy-mono text-[10px] uppercase tracking-[0.16em] text-black/72">
                            <span>Type: {product.categoryLabel}</span>
                            <span className="text-right">
                              {product.stock > 0 ? `${product.stock} in stock` : "sold out"}
                            </span>
                          </div>

                          <button
                            type="button"
                            onClick={(event) => handleAddToCart(event, product)}
                            disabled={product.stock <= 0}
                            className="w-full bg-[#050505] px-4 py-4 goofy-mono text-[14px] font-bold uppercase tracking-[0.2em] text-[#F4F0EB] transition-colors hover:bg-white hover:text-[#050505] disabled:cursor-not-allowed disabled:bg-black/35 disabled:text-black/40"
                          >
                            {product.stock <= 0
                              ? "Sold Out"
                              : addingId === product.id
                                ? "Added +"
                                : "Add To Cart +"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
