import { Footer } from "@/components/footer"
import { NavbarServer } from "@/components/navbar-server"
import { SearchCommand } from "@/components/search-command"
import { OrderHistoryLookup } from "@/components/order/OrderHistoryLookup"

interface OrdersPageProps {
  searchParams: Promise<{
    phone?: string | string[]
  }>
}

function resolvePhone(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0] ?? ""
  }

  return value ?? ""
}

export default async function OrdersPage({ searchParams }: OrdersPageProps) {
  const params = await searchParams
  const initialPhone = resolvePhone(params.phone)

  return (
    <main className="min-h-screen bg-[var(--black)] text-[var(--white)]">
      <NavbarServer />
      <OrderHistoryLookup initialPhone={initialPhone} />
      <Footer />
      <SearchCommand />
    </main>
  )
}
