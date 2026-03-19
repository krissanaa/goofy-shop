import { Footer } from "@/components/footer"
import { NavbarServer } from "@/components/navbar-server"
import { TrackOrderForm } from "@/components/order/TrackOrderForm"
import { SearchCommand } from "@/components/search-command"

export default function TrackOrderPage() {
  return (
    <main className="min-h-screen bg-[var(--black)] text-[var(--white)]">
      <NavbarServer />

      <div className="px-5 pb-20 pt-24 md:px-10">
        <TrackOrderForm />
      </div>

      <Footer />
      <SearchCommand />
    </main>
  )
}
