import type { Metadata } from "next"
import { NavbarServer } from "@/components/navbar-server"
import { CheckoutPage } from "@/components/checkout-page"
import { SearchCommand } from "@/components/search-command"
import { getResolvedGlobalConfig } from "@/lib/strapi"

export const metadata: Metadata = {
  title: "Checkout - GOOFY SHOP",
  description: "Complete your order.",
}

export default async function CheckoutRoutePage() {
  const config = await getResolvedGlobalConfig()
  const godMode = config.godMode
  const showNavbar = !godMode.enabled || godMode.aboveFold.showNavbar

  return (
    <main className="min-h-screen bg-background">
      {showNavbar ? <NavbarServer /> : null}
      <div className={showNavbar ? "pt-16" : undefined}>
        <CheckoutPage />
      </div>
      <SearchCommand />
    </main>
  )
}
