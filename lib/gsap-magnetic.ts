import gsap from "gsap"

type MagneticOptions = {
  strength?: number
  duration?: number
}

export function attachMagneticEffect(
  element: HTMLElement,
  { strength = 0.28, duration = 0.35 }: MagneticOptions = {},
) {
  if (typeof window === "undefined") {
    return () => {}
  }

  const pointerFine = window.matchMedia("(pointer: fine)").matches
  if (!pointerFine) {
    return () => {}
  }

  const xTo = gsap.quickTo(element, "x", {
    duration,
    ease: "power3.out",
  })
  const yTo = gsap.quickTo(element, "y", {
    duration,
    ease: "power3.out",
  })

  const handleMove = (event: PointerEvent) => {
    const bounds = element.getBoundingClientRect()
    const offsetX = event.clientX - (bounds.left + bounds.width / 2)
    const offsetY = event.clientY - (bounds.top + bounds.height / 2)

    xTo(offsetX * strength)
    yTo(offsetY * strength)
  }

  const handleLeave = () => {
    xTo(0)
    yTo(0)
  }

  element.addEventListener("pointermove", handleMove)
  element.addEventListener("pointerleave", handleLeave)

  return () => {
    element.removeEventListener("pointermove", handleMove)
    element.removeEventListener("pointerleave", handleLeave)
    gsap.killTweensOf(element)
    gsap.set(element, { x: 0, y: 0 })
  }
}
