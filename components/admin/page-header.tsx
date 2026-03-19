import type { ReactNode } from "react"

interface PageHeaderProps {
  eyebrow: string
  title: string
  subtitle?: string
  actions?: ReactNode
}

export function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
}: PageHeaderProps) {
  return (
    <div className="page-header">
      <div>
        <div className="page-eyebrow">{eyebrow}</div>
        <div className="page-title">{title}</div>
        {subtitle ? <div className="page-sub">{subtitle}</div> : null}
      </div>
      {actions ? <div>{actions}</div> : null}
    </div>
  )
}
