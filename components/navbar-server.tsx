import {
  getCategories,
} from "@/lib/api"
import { Navbar } from "@/components/navbar"
import { defaultGlobalConfig, defaultLocationsPageConfig } from "@/config/defaults"

export async function NavbarServer() {
  const config = defaultGlobalConfig
  const locationsPage = defaultLocationsPageConfig
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
        categoryRes?.slice(0, categoryLimit).map((c: any) => ({
          title: c.title,
          slug: c.slug,
          image: undefined, // Add image mapping if available in Supabase
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
