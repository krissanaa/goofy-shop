import { ScrollTrigger } from "gsap/ScrollTrigger"

export const FT = "var(--font-title, 'Aerosoldier'), var(--font-noto-sans, sans-serif)"
export const FG = "var(--font-graffiti, var(--font-title, 'Aerosoldier')), var(--font-noto-sans, sans-serif)"
export const FC = "var(--font-content, 'Glancyr'), var(--font-noto-sans, sans-serif)"

export function cleanupScrollTriggersFor(root: Element | null, refresh = true) {
    if (!root || typeof window === "undefined") return

    ScrollTrigger.getAll().forEach((trigger) => {
        const triggerElement = trigger.trigger
        if (triggerElement === root || (triggerElement instanceof Element && root.contains(triggerElement))) {
            trigger.kill()
        }
    })

    if (refresh) ScrollTrigger.refresh()
}
