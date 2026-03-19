import { Footer } from "@/components/footer"
import { NavbarServer } from "@/components/navbar-server"
import { SearchCommand } from "@/components/search-command"
import { WishlistPageClient } from "@/components/shop/WishlistPageClient"

export default function WishlistPage() {
  return (
    <main className="min-h-screen bg-[var(--black)] text-[var(--white)]">
      <NavbarServer />
      <WishlistPageClient />
      <Footer />
      <SearchCommand />
    </main>
  )
}
