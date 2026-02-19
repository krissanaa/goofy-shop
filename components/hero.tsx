"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

const slides = [
  { src: "/images/hero-1.jpg", alt: "Streetwear collection hero" },
  { src: "/images/hero-2.jpg", alt: "Skateboard hardware close-up" },
]

export function Hero() {
  const [current, setCurrent] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length)
    }, 6000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {slides.map((slide, i) => (
        <div
          key={slide.src}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === current ? 1 : 0 }}
        >
          <Image
            src={slide.src}
            alt={slide.alt}
            fill
            className="object-cover"
            priority={i === 0}
          />
        </div>
      ))}

      {/* Overlay */}
      <div className="absolute inset-0 bg-background/70" />

      {/* Content */}
      <div className="relative z-10 flex h-full flex-col items-start justify-end px-6 pb-24 lg:px-16 lg:pb-32 max-w-7xl mx-auto">
        <p className="mb-4 text-xs font-medium uppercase tracking-[0.3em] text-primary">
          SS26 Collection
        </p>
        <h1 className="max-w-3xl text-5xl font-bold leading-[0.95] tracking-tighter text-foreground sm:text-7xl lg:text-8xl text-balance">
          Built for the streets.
          <br />
          Worn by the culture.
        </h1>
        <p className="mt-6 max-w-md text-base leading-relaxed text-muted-foreground">
          Premium skate hardware and streetwear essentials. Limited drops, exclusive collabs, zero compromises.
        </p>
        <div className="mt-8 flex flex-wrap gap-4">
          <Button asChild size="lg" className="rounded-none px-8 py-6 text-sm font-bold uppercase tracking-widest">
            <Link href="/drop">
              Shop the Drop
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="rounded-none border-foreground/20 px-8 py-6 text-sm font-bold uppercase tracking-widest text-foreground hover:bg-foreground/10">
            <Link href="#products">Explore Collection</Link>
          </Button>
        </div>

        {/* Slide indicators */}
        <div className="mt-12 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-0.5 transition-all duration-500 ${i === current ? 'w-12 bg-primary' : 'w-6 bg-foreground/30'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
