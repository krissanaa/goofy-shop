import type { Metadata } from "next"
import { HypeDropCountdown } from "@/components/hype-drop-countdown"

export const metadata: Metadata = {
  title: 'SHADOW SERIES DROP - GOOFY SHOP',
  description: 'The most anticipated drop of the season. Limited quantities. No restocks.',
}

export default function DropPage() {
  return <HypeDropCountdown />
}
