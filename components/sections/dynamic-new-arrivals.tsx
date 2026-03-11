import { DynamicBadgeProductSlot } from "@/components/sections/dynamic-badge-product-slot"
import { getResolvedGlobalConfig } from "@/lib/strapi"
import type { NewArrivalsData } from "@/lib/strapi-types"

interface DynamicNewArrivalsProps {
  data: NewArrivalsData
}

export async function DynamicNewArrivals({ data }: DynamicNewArrivalsProps) {
  const globalConfig =
    data.badge_filter === "SALE" ? await getResolvedGlobalConfig() : null

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
