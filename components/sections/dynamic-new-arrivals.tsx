import { DynamicBadgeProductSlot } from "@/components/sections/dynamic-badge-product-slot"
import { defaultGlobalConfig } from "@/config/defaults"

interface DynamicNewArrivalsProps {
  data: any
}

export async function DynamicNewArrivals({ data }: DynamicNewArrivalsProps) {
  const globalConfig =
    data.badge_filter === "SALE" ? defaultGlobalConfig : null
  const badgeFilter = typeof data.badge_filter === "string"
    ? data.badge_filter.toUpperCase()
    : "NEW"
  const emptyMessage =
    badgeFilter === "SALE"
      ? "No sale items live right now"
      : badgeFilter === "HOT"
        ? "No trending products found right now"
        : badgeFilter === "COLLAB"
          ? "No collab pieces are active right now"
          : "No new arrivals yet"

  return (
    <DynamicBadgeProductSlot
      title={data.title}
      subtitle={data.subtitle}
      limit={data.limit}
      badgeFilter={data.badge_filter}
      defaultBadgeFilter="NEW"
      emptyMessage={emptyMessage}
      saleEndDateOverride={globalConfig?.saleEndDate ?? null}
    />
  )
}
