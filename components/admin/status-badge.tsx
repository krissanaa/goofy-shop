import type { ReactNode } from "react"

export interface StatusBadgeProps {
  tone:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "paid"
    | "unpaid"
    | "new"
    | "hot"
    | "sale"
    | "active"
    | "draft"
    | "news"
    | "spot"
    | "interview"
  children: ReactNode
}

const toneClassMap: Record<StatusBadgeProps["tone"], string> = {
  pending: "b-pending",
  processing: "b-process",
  shipped: "b-shipped",
  delivered: "b-delivered",
  cancelled: "b-cancelled",
  paid: "b-paid",
  unpaid: "b-unpaid",
  new: "b-new",
  hot: "b-hot",
  sale: "b-sale",
  active: "b-active",
  draft: "b-draft",
  news: "b-news",
  spot: "b-spot",
  interview: "b-interview",
}

export function StatusBadge({ tone, children }: StatusBadgeProps) {
  return <span className={`badge ${toneClassMap[tone]}`}>{children}</span>
}
