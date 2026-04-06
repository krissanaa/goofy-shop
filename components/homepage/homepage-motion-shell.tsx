"use client"

import { useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(ScrollTrigger, useGSAP)

interface HomepageMotionShellProps {
  children: React.ReactNode
  parallaxImage?: string | null
}

export function HomepageMotionShell({
  children,
  parallaxImage,
}: HomepageMotionShellProps) {
  const shellRef = useRef<HTMLDivElement | null>(null)
  const parallaxRef = useRef<HTMLDivElement | null>(null)

  useGSAP(
    () => {
      if (!shellRef.current || !parallaxRef.current) return

      const media = gsap.matchMedia()

      media.add("(min-width: 768px)", () => {
        gsap.to(parallaxRef.current, {
          y: 100,
          ease: "none",
          scrollTrigger: {
            trigger: shellRef.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 1.8,
          },
        })

        const layers = gsap.utils.toArray<HTMLElement>(
          "[data-homepage-depth]",
          shellRef.current,
        )

        layers.forEach((layer) => {
          const depth = Number(layer.dataset.homepageDepth ?? "1")
          const travel = Math.max(12, depth * 22)

          gsap.fromTo(
            layer,
            { y: travel * -0.18 },
            {
              y: travel,
              ease: "none",
              scrollTrigger: {
                trigger: layer,
                start: "top bottom",
                end: "bottom top",
                scrub: 1.8,
              },
            },
          )
        })
      })

      return () => media.revert()
    },
    { scope: shellRef, dependencies: [parallaxImage] },
  )

  return (
    <div
      ref={shellRef}
      className="dark homepage-theme-shell homepage-seamless-canvas relative min-h-screen overflow-x-clip bg-[#050505] text-white"
      data-theme="dark"
    >
      <div className="pointer-events-none fixed inset-0 -z-20 overflow-hidden">
        <div
          ref={parallaxRef}
          className="absolute inset-[-8%] scale-[1.08] bg-cover bg-center opacity-[0.54]"
          style={
            parallaxImage
              ? {
                  backgroundImage: `url(${parallaxImage})`,
                }
              : undefined
          }
        />
        <div className="absolute inset-0 bg-[#050505]/74" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(240,180,41,0.12),transparent_34%),linear-gradient(180deg,rgba(5,5,5,0.18)_0%,rgba(5,5,5,0.98)_100%)]" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.28)_1px,transparent_0)] [background-size:15px_15px]" />
      </div>

      {children}
    </div>
  )
}
