"use client"

import { useEffect } from "react"

import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

import { FC } from "@/components/home/homepage-shared"
import type { GoofyHomepageProps } from "@/components/home/homepage-types"
import { CtaSection } from "@/components/home/sections/cta-section"
import { CategoryEditorialTransitionSection } from "@/components/home/sections/category-editorial-transition"
import { FeaturedHorizontalSection } from "@/components/home/sections/featured-horizontal-section"
import { FooterSection } from "@/components/home/sections/footer-section"
import { HeroSection } from "@/components/home/sections/hero-section"
import { StickyNav } from "@/components/home/sections/sticky-nav"
import { VideoExpandSection } from "@/components/home/sections/video-expand-section"
import { S3FromTheStreets } from "./S3FromTheStreets"

gsap.registerPlugin(ScrollTrigger)

export function GoofyHomepage({
    products,
    stories,
    videoTitle,
    videoDescription,
    videoThumbnail,
    videoUrl,
    heroImage,
    heroSlides,
}: GoofyHomepageProps) {
    useEffect(() => {
        let lenis: InstanceType<(typeof import("lenis"))["default"]> | null = null
        let ticker: ((time: number) => void) | null = null
        let refreshTimer: ReturnType<typeof setTimeout> | null = null

        if (typeof window === "undefined") return
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

        const init = async () => {
            try {
                const { default: Lenis } = await import("lenis")
                const instance = new Lenis({
                    duration: 1.2,
                    easing: (value: number) => Math.min(1, 1.001 - Math.pow(2, -10 * value)),
                    smoothWheel: true,
                })
                lenis = instance
                instance.on("scroll", ScrollTrigger.update)
                ticker = (time: number) => instance.raf(time * 1000)
                gsap.ticker.add(ticker)
                gsap.ticker.lagSmoothing(0)
                refreshTimer = setTimeout(() => ScrollTrigger.refresh(), 100)
            } catch {}
        }

        init()

        return () => {
            if (refreshTimer) clearTimeout(refreshTimer)
            if (ticker) gsap.ticker.remove(ticker)
            if (lenis) lenis.destroy()
        }
    }, [])

    useEffect(() => {
        const timer = setTimeout(() => {
            ScrollTrigger.refresh(true)
        }, 500)

        return () => {
            clearTimeout(timer)
            ScrollTrigger.getAll().forEach((trigger) => trigger.kill())
        }
    }, [])

    return (
        <div className="overflow-x-hidden" style={{ fontFamily: FC, background: "#f5f2ed" }}>
            <StickyNav />
            <HeroSection heroImage={heroImage} heroSlides={heroSlides} />
            <FeaturedHorizontalSection products={products} />
            <S3FromTheStreets stories={stories} />
            <VideoExpandSection title={videoTitle} thumbnail={videoThumbnail} url={videoUrl} description={videoDescription} />
            <CategoryEditorialTransitionSection />
            <CtaSection />
            <FooterSection />
        </div>
    )
}
