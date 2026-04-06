"use client"

import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useLayoutEffect, useRef, type ReactNode } from "react"

gsap.registerPlugin(ScrollTrigger)

export function HomepageSmoothScroll({
  children,
}: {
  children: ReactNode
}) {
  const shellRef = useRef<HTMLDivElement | null>(null)
  const spacerRef = useRef<HTMLDivElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)

  useLayoutEffect(() => {
    const shell = shellRef.current
    const spacer = spacerRef.current
    const content = contentRef.current

    if (!shell || !spacer || !content) {
      return
    }

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
    const isMobile = window.matchMedia("(max-width: 1023px)").matches

    if (prefersReducedMotion || isMobile) {
      shell.classList.remove("is-smooth-active")
      spacer.style.removeProperty("height")
      gsap.set(content, { clearProps: "transform" })
      return
    }

    let targetY = window.scrollY
    let currentY = targetY
    let frameId = 0

    const setHeight = () => {
      spacer.style.height = `${content.scrollHeight}px`
    }

    const update = () => {
      currentY += (targetY - currentY) * 0.1

      if (Math.abs(targetY - currentY) < 0.2) {
        currentY = targetY
      }

      gsap.set(content, {
        y: -currentY,
        force3D: true,
      })

      ScrollTrigger.update()
      frameId = window.requestAnimationFrame(update)
    }

    const handleScroll = () => {
      targetY = window.scrollY
    }

    const handleResize = () => {
      setHeight()
      targetY = window.scrollY
      currentY = targetY
      gsap.set(content, { y: -currentY, force3D: true })
      ScrollTrigger.refresh()
    }

    const resizeObserver = new ResizeObserver(() => {
      setHeight()
      ScrollTrigger.refresh()
    })

    shell.classList.add("is-smooth-active")
    setHeight()
    resizeObserver.observe(content)
    window.addEventListener("scroll", handleScroll, { passive: true })
    window.addEventListener("resize", handleResize)
    update()
    window.requestAnimationFrame(() => ScrollTrigger.refresh())

    return () => {
      shell.classList.remove("is-smooth-active")
      resizeObserver.disconnect()
      window.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", handleResize)
      window.cancelAnimationFrame(frameId)
      spacer.style.removeProperty("height")
      gsap.set(content, { clearProps: "transform" })
      ScrollTrigger.refresh()
    }
  }, [])

  return (
    <div ref={shellRef} className="homepage-smooth-shell">
      <div ref={spacerRef} aria-hidden="true" className="homepage-smooth-spacer" />
      <div ref={contentRef} className="homepage-smooth-content">
        <div className="homepage-smooth-content-inner">{children}</div>
      </div>
    </div>
  )
}
