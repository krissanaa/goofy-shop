import { FeaturedDrops } from "@/components/featured-drops"
import type { FeaturedDropsData } from "@/lib/strapi-types"

interface DynamicFeaturedDropsProps {
  data: FeaturedDropsData
}

export function DynamicFeaturedDrops({ data }: DynamicFeaturedDropsProps) {
  return (
    <FeaturedDrops
      sectionTitle={data.title}
      limit={data.limit}
      showTimer={data.show_timer}
    />
  )
}
