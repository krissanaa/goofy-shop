import { DynamicBadgeProductSlot } from "@/components/sections/dynamic-badge-product-slot"
import { defaultGlobalConfig } from "@/config/defaults"

interface DynamicNewArrivalsProps {
  data: any
}

export async function DynamicNewArrivals({ data }: DynamicNewArrivalsProps) {
  const globalConfig =
    data.badge_filter === "SALE" ? defaultGlobalConfig : null

  return (
    <DynamicBadgeProductSlot
      title={data.title}
      subtitle={data.subtitle}
      limit={data.limit}
      badgeFilter={data.badge_filter}
      defaultBadgeFilter="NEW"
      emptyMessage="No new arrivals yet"
      saleEndDateOverride={globalConfig?.saleEndDate ?? null}
    />
  )
}
