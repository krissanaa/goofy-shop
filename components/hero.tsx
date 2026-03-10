"use client"

import Image from "next/image"
import Link from "next/link"
import { useState, useEffect } from "react"
import { ArrowRight, Star, Sparkles } from "lucide-react"

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
    <section className="pixel-bg relative min-h-[90vh] w-full overflow-hidden bg-background">
      {/* Background images — bright, not dark */}
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
            className="object-cover opacity-20"
            priority={i === 0}
          />
        </div>
      ))}

      {/* Light gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />

      {/* Content */}
      <div className="relative z-10 flex h-full min-h-[90vh] max-w-7xl mx-auto flex-col items-center justify-center px-6 py-32 text-center lg:px-12">

        {/* Season badge */}
        <div className="mario-badge mario-badge-yellow mb-8">
          <Star className="h-3 w-3 fill-current" />
          SS26 Collection
        </div>

        {/* Main headline */}
        <h1 className="max-w-4xl font-black leading-[0.92] tracking-tighter text-foreground" style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)' }}>
          BUILT FOR THE{' '}
          <span className="text-primary">STREETS</span>.
        </h1>
        <h2 className="mt-2 font-black leading-[0.92] tracking-tighter" style={{ fontSize: 'clamp(2.5rem, 7vw, 5.5rem)', color: '#049cd8' }}>
          WORN BY THE CULTURE.
        </h2>

        {/* Sub copy */}
        <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
          Premium skate hardware and streetwear essentials.
          Limited drops, exclusive collabs, zero compromises.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link href="/drop" className="mario-btn mario-btn-red">
            <Sparkles className="h-4 w-4" />
            Shop the Drop
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="#products" className="mario-btn mario-btn-outline">
            Explore Collection
          </Link>
        </div>

        {/* Stats row */}
        <div className="mt-16 flex items-center gap-6 sm:gap-10">
          {[
            { value: '500+', label: 'Products', color: '#e52521' },
            { value: '12K+', label: 'Skaters', color: '#049cd8' },
            { value: '100%', label: 'Authentic', color: '#43b047' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-black tracking-tighter sm:text-3xl" style={{ color: stat.color }}>{stat.value}</p>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Slide dots */}
        <div className="mt-10 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-3 w-3 border-2 border-foreground transition-all ${i === current ? 'bg-primary border-primary' : 'bg-transparent'}`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
