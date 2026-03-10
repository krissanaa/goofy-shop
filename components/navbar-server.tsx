import {
  getCategories,
  getLocationsPage,
  getResolvedGlobalConfig,
  getStrapiImageUrl,
} from "@/lib/strapi"
import { Navbar } from "@/components/navbar"

export async function NavbarServer() {
  const [config, locationsPage] = await Promise.all([
    getResolvedGlobalConfig(),
    getLocationsPage(),
  ])
  const shopMenuConfig = config.navigation.shopMenu
  const shopMenuEnabled = shopMenuConfig.godMode
    ? shopMenuConfig.enabled
    : true
  const categoryLimit = shopMenuConfig.godMode
    ? shopMenuConfig.categoryLimit
    : 4

  let categories: { title: string; slug: string; image?: string }[] = []

  if (shopMenuEnabled) {
    try {
      const categoryRes = await getCategories()

      categories =
        categoryRes?.data?.slice(0, categoryLimit).map((c) => ({
          title: c.title,
          slug: c.slug,
          image: c.thumbnail
            ? getStrapiImageUrl(c.thumbnail, "medium")
            : undefined,
        })) ?? []
    } catch {
      categories = []
    }
  }

  return (
    <Navbar
      categories={categories}
      locationMenu={{
        enabled: locationsPage.menuEnabled,
        label: locationsPage.menuLabel,
        href: "/skateparks",
      }}
    />
  )
}
