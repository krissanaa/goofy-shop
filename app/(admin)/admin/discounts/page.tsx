import Link from "next/link"
import { Plus, Shuffle, Trash2 } from "lucide-react"
import { deleteDiscountAction } from "@/app/(admin)/admin/actions"
import { AdminBadge } from "@/components/admin/admin-badge"
import { DiscountForm } from "@/components/admin/discount-form"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { generateDiscountCode } from "@/lib/discounts"
import { formatAdminDate, formatRevenue } from "@/lib/admin"
import { getAdminDiscounts } from "@/lib/admin-data"

interface DiscountsPageProps {
  searchParams: Promise<{
    q?: string
    id?: string
    new?: string
    state?: string
    code?: string
  }>
}

const DISCOUNT_TABS = [
  { value: "ALL", label: "All" },
  { value: "LIVE", label: "Active" },
  { value: "OFF", label: "Off" },
] as const

function buildHref(
  search: string,
  state: string,
  params: Record<string, string | null | undefined>,
) {
  const query = new URLSearchParams()
  if (search) query.set("q", search)
  if (state !== "ALL") query.set("state", state)
  for (const [key, value] of Object.entries(params)) {
    if (value) query.set(key, value)
  }
  const queryString = query.toString()
  return `/admin/discounts${queryString ? `?${queryString}` : ""}`
}

export default async function AdminDiscountsPage({ searchParams }: DiscountsPageProps) {
  const params = await searchParams
  const search = params.q?.trim().toLowerCase() ?? ""
  const state = (params.state ?? "ALL").toUpperCase()
  const generatedCode = generateDiscountCode()
  const allDiscounts = await getAdminDiscounts()
  const searched = !search
    ? allDiscounts
    : allDiscounts.filter((discount) =>
        [discount.code, discount.type].join(" ").toLowerCase().includes(search),
      )
  const discounts = searched.filter((discount) => {
    if (state === "LIVE") return discount.active
    if (state === "OFF") return !discount.active
    return true
  })
  const selectedDiscount = params.id
    ? allDiscounts.find((discount) => discount.id === params.id) ?? null
    : null
  const creating = params.new === "1"

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Ecommerce"
        title="Discounts"
        subtitle={`${allDiscounts.length} discount codes`}
        actions={
          <div className="topbar-right">
            <Link
              href={buildHref(search, state, { new: "1", id: null, code: generatedCode })}
              className="btn inline-flex items-center gap-2"
            >
              <Shuffle className="h-3.5 w-3.5" />
              Generate Code
            </Link>
            <Link
              href={buildHref(search, state, { new: "1", id: null, code: null })}
              className="btn btn-primary inline-flex items-center gap-2"
            >
              <Plus className="h-3.5 w-3.5" />
              New Discount
            </Link>
          </div>
        }
      />

      <div className="filter-bar">
        {DISCOUNT_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={buildHref(search, tab.value, { id: null, new: null, code: null })}
            className={`ftab ${state === tab.value ? "active" : ""}`}
          >
            {tab.label}
          </Link>
        ))}

        <form className="ml-auto">
          {state !== "ALL" ? <input type="hidden" name="state" value={state} /> : null}
          <input
            className="search-box"
            type="search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search discount code..."
          />
        </form>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Type</th>
              <th>Value</th>
              <th>Min Order</th>
              <th>Uses</th>
              <th>Expires</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {discounts.length === 0 ? (
              <tr>
                <td colSpan={8} className="t-muted">
                  No discount codes match this filter.
                </td>
              </tr>
            ) : (
              discounts.map((discount) => (
                <tr key={discount.id}>
                  <td className="t-main">{discount.code}</td>
                  <td className="t-muted">
                    {discount.type === "PERCENT" ? "Percent Off" : "Fixed Amount"}
                  </td>
                  <td>
                    {discount.type === "PERCENT"
                      ? `${discount.value}%`
                      : formatRevenue(discount.value)}
                  </td>
                  <td>{discount.minOrder > 0 ? formatRevenue(discount.minOrder) : "-"}</td>
                  <td>
                    {discount.maxUses > 0
                      ? `${discount.usesCount} / ${discount.maxUses}`
                      : `${discount.usesCount} / Unlimited`}
                  </td>
                  <td className="t-muted">{formatAdminDate(discount.expiresAt)}</td>
                  <td>
                    <AdminBadge tone={discount.active ? "active" : "draft"}>
                      {discount.active ? "Active" : "Off"}
                    </AdminBadge>
                  </td>
                  <td>
                    <div className="flex items-center gap-[10px]">
                      <Link
                        href={buildHref(search, state, {
                          id: discount.id,
                          new: null,
                          code: null,
                        })}
                        className="t-link"
                      >
                        Edit
                      </Link>
                      <form action={deleteDiscountAction}>
                        <input type="hidden" name="id" value={discount.id} />
                        <button type="submit" className="t-danger inline-flex items-center gap-1">
                          <Trash2 className="h-3.5 w-3.5" />
                          Del
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {creating || selectedDiscount ? (
        <section className="card">
          <div className="card-header">
            <div className="card-title">{selectedDiscount ? "Edit Discount" : "Create Discount"}</div>
            <Link
              href={buildHref(search, state, { id: null, new: null, code: null })}
              className="card-action"
            >
              Close
            </Link>
          </div>
          <div className="card-body">
            <DiscountForm
              mode={selectedDiscount ? "edit" : "create"}
              discount={selectedDiscount ?? undefined}
              initialCode={params.code ?? undefined}
            />
          </div>
        </section>
      ) : null}
    </div>
  )
}
