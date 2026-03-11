import { FeaturedDrops } from "@/components/featured-drops"

interface DynamicFeaturedDropsProps {
  data: any
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
