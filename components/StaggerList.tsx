"use client"

import { Children, useRef, type ReactNode } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useGSAP } from "@gsap/react"

gsap.registerPlugin(ScrollTrigger, useGSAP)

interface StaggerListProps {
    className?: string
    itemClassName?: string
    children: ReactNode
    delay?: number
}

export function StaggerList({
                                className,
                                itemClassName,
                                children,
                                delay = 0,
                            }: StaggerListProps) {
    const containerRef = useRef<HTMLDivElement | null>(null)
    const items = Children.toArray(children)

    useGSAP(
        () => {
            const el = containerRef.current
            if (!el) return
            if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

            const childElements = gsap.utils.toArray<HTMLElement>("[data-stagger-item]", el)
            if (!childElements.length) return

            gsap.set(childElements, { opacity: 0, y: 48, scale: 0.96 })

            gsap.to(childElements, {
                opacity: 1, y: 0, scale: 1,
                duration: 0.68, ease: "power3.out",
                stagger: 0.08, delay: 0.05 + delay,
                scrollTrigger: { trigger: el, start: "top 85%", once: true },
            })
        },
        { scope: containerRef, dependencies: [delay, items.length] },
    )

    return (
        <div ref={containerRef} className={className}>
            {items.map((child, index) => (
                <div key={index} data-stagger-item className={itemClassName}>
                    {child}
                </div>
            ))}
        </div>
    )
}