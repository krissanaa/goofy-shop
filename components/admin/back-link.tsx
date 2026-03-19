import type { ReactNode } from "react"
import Link from "next/link"

interface BackLinkProps {
  href: string
  children: ReactNode
}

export function BackLink({ href, children }: BackLinkProps) {
  return (
    <Link href={href} className="back">
      <span aria-hidden="true">←</span>
      <span>{children}</span>
    </Link>
  )
}
