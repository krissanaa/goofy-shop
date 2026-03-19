import Link from "next/link"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { formatAdminDate, formatRevenue } from "@/lib/admin"
import { getAdminCustomers } from "@/lib/admin-data"

interface CustomersPageProps {
  searchParams: Promise<{
    q?: string
    sort?: string
  }>
}

function normalizeSort(value: string | undefined): "TOTAL_SPENT" | "ORDER_COUNT" {
  return (value ?? "").toUpperCase() === "ORDER_COUNT" ? "ORDER_COUNT" : "TOTAL_SPENT"
}

export default async function AdminCustomersPage({ searchParams }: CustomersPageProps) {
  const params = await searchParams
  const search = params.q?.trim().toLowerCase() ?? ""
  const sort = normalizeSort(params.sort)
  const allCustomers = await getAdminCustomers()

  const customers = allCustomers
    .filter((customer) =>
      !search
        ? true
        : [customer.customerName, customer.phone, customer.lookupKey]
            .join(" ")
            .toLowerCase()
            .includes(search),
    )
    .sort((a, b) => {
      if (sort === "ORDER_COUNT") {
        return (
          b.orderCount - a.orderCount ||
          b.totalSpent - a.totalSpent ||
          a.customerName.localeCompare(b.customerName)
        )
      }

      return (
        b.totalSpent - a.totalSpent ||
        b.orderCount - a.orderCount ||
        a.customerName.localeCompare(b.customerName)
      )
    })

  return (
    <div>
      <AdminPageHeader
        eyebrow="Ecommerce"
        title="Customers"
        subtitle={`${customers.length} customer profiles`}
      />

      <form action="/admin/customers" className="filter-bar">
        <select name="sort" defaultValue={sort} className="fs" style={{ width: 180 }}>
          <option value="TOTAL_SPENT">Sort: Total Spent</option>
          <option value="ORDER_COUNT">Sort: Order Count</option>
        </select>

        <input
          className="search-box"
          type="search"
          name="q"
          defaultValue={params.q ?? ""}
          placeholder="Search name or phone..."
        />

        <button type="submit" className="btn">
          Apply
        </button>
      </form>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Phone</th>
              <th>City</th>
              <th>Total Orders</th>
              <th>Total Spent</th>
              <th>Last Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {customers.length === 0 ? (
              <tr>
                <td colSpan={7} className="t-muted">
                  No customers match this search.
                </td>
              </tr>
            ) : (
              customers.map((customer) => (
                <tr key={customer.lookupKey}>
                  <td>
                    <div className="t-main">{customer.customerName}</div>
                    <div className="t-muted">{customer.email}</div>
                  </td>
                  <td className="t-accent">{customer.phone}</td>
                  <td className="t-muted">{customer.city}</td>
                  <td>{customer.orderCount}</td>
                  <td>{formatRevenue(customer.totalSpent)}</td>
                  <td className="t-muted">{formatAdminDate(customer.lastOrderAt)}</td>
                  <td>
                    <Link
                      href={`/admin/customers/${encodeURIComponent(customer.lookupKey)}`}
                      className="t-link"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
