import { DynamicBadgeProductSlot } from "@/components/sections/dynamic-badge-product-slot"
import type { NewArrivalsData } from "@/lib/strapi-types"

interface DynamicNewArrivalsProps {
  data: NewArrivalsData
}

export function DynamicNewArrivals({ data }: DynamicNewArrivalsProps) {
  return (
    <DynamicBadgeProductSlot
      title={data.title}
      subtitle={data.subtitle}
      limit={data.limit}
      badgeFilter={data.badge_filter}
      defaultBadgeFilter="NEW"
      emptyMessage="No new arrivals yet"
    />
  )
}
