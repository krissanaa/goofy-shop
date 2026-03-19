"use client"

import Image from "next/image"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"

interface ProductGalleryProps {
  name: string
  images: string[]
}

export function ProductGallery({ name, images }: ProductGalleryProps) {
  const safeImages = images.length > 0 ? images : ["/placeholder.jpg"]
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (safeImages.length <= 1) {
        return
      }

      if (event.key === "ArrowRight") {
        setSelectedImage((current) => (current + 1) % safeImages.length)
      }

      if (event.key === "ArrowLeft") {
        setSelectedImage((current) =>
          current === 0 ? safeImages.length - 1 : current - 1,
        )
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [safeImages.length])

  return (
    <div className="grid gap-4 lg:grid-cols-[84px_minmax(0,1fr)]">
      <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:flex-col lg:overflow-x-visible">
        {safeImages.map((image, index) => {
          const isActive = selectedImage === index

          return (
            <button
              key={`${image}-${index}`}
              type="button"
              onClick={() => setSelectedImage(index)}
              className={`relative h-20 w-20 shrink-0 overflow-hidden border-2 bg-[#111] transition-transform hover:scale-[1.05] ${
                isActive ? "border-[var(--gold)]" : "border-[var(--bordw)]"
              }`}
              aria-label={`Show ${name} image ${index + 1}`}
            >
              <Image
                src={image}
                alt={`${name} thumbnail ${index + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          )
        })}
      </div>

      <div className="order-1 overflow-hidden border border-[var(--bordw)] bg-[#111] lg:order-2">
        <motion.div
          key={safeImages[selectedImage]}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative aspect-square w-full overflow-hidden md:aspect-[4/5]"
        >
          <Image
            src={safeImages[selectedImage]}
            alt={`${name} image ${selectedImage + 1}`}
            fill
            priority={selectedImage === 0}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </motion.div>
      </div>
    </div>
  )
}
