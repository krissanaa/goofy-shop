import { cn } from "@/lib/utils"

interface StripeBarProps {
  className?: string
}

export function StripeBar({ className }: StripeBarProps) {
  return <div aria-hidden className={cn("stripe-bar w-full", className)} />
}
