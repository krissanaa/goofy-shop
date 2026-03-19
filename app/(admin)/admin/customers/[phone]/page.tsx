import Link from "next/link"
import { notFound } from "next/navigation"
import { AdminBadge } from "@/components/admin/admin-badge"
import { CustomerNoteForm } from "@/components/admin/customer-note-form"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { formatAdminDate, formatRevenue } from "@/lib/admin"
import { getAdminCustomer } from "@/lib/admin-data"

interface CustomerDetailPageProps {
  params: Promise<{
    phone: string
  }>
}

function getOrderTone(status: string) {
  switch (status) {
    case "COMPLETED":
      return "delivered" as const
    case "SHIPPED":
      return "shipped" as const
    case "FULFILLING":
      return "processing" as const
    case "CANCELED":
      return "cancelled" as const
    default:
      return "pending" as const
  }
}

function getPaymentTone(status: string) {
  return ["PAID", "SUCCEEDED", "SUCCESS"].includes(status.toUpperCase())
    ? "paid"
    : "unpaid"
}

export default async function AdminCustomerDetailPage({
  params,
}: CustomerDetailPageProps) {
  const { phone } = await params
  const customer = await getAdminCustomer(phone)

  if (!customer) {
    notFound()
  }

  return (
    <div className="space-y-4">
      <Link href="/admin/customers" className="back">
        {"<-"} Back to Customers
      </Link>

      <AdminPageHeader
        eyebrow="Ecommerce"
        title={customer.customerName}
        subtitle={customer.phone}
      />

      <div className="grid-2">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Customer Summary</div>
          </div>
          <div className="card-body">
            <div className="info-grid">
              <div>
                <div className="info-lbl">Name</div>
                <div className="info-val">{customer.customerName}</div>
              </div>
              <div>
                <div className="info-lbl">Phone</div>
                <div className="info-val">{customer.phone}</div>
              </div>
              <div>
                <div className="info-lbl">City</div>
                <div className="info-val">{customer.city}</div>
              </div>
              <div>
                <div className="info-lbl">First Order</div>
                <div className="info-val">{formatAdminDate(customer.firstOrderAt)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <div className="card-title">Customer Notes</div>
          </div>
          <div className="card-body">
            <CustomerNoteForm
              lookupKey={customer.lookupKey}
              customerName={customer.customerName}
              phone={customer.phone}
              note={customer.note}
            />
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card c-success">
          <div className="stat-label">Total Orders</div>
          <div className="stat-value">{customer.orderCount}</div>
          <div className="stat-delta up">Across all purchases</div>
        </div>
        <div className="stat-card c-gold">
          <div className="stat-label">Total Spent</div>
          <div className="stat-value">{formatRevenue(customer.totalSpent)}</div>
          <div className="stat-delta up">Lifetime customer value</div>
        </div>
        <div className="stat-card c-warning">
          <div className="stat-label">Avg Order Value</div>
          <div className="stat-value">{formatRevenue(Math.round(customer.averageOrderValue))}</div>
          <div className="stat-delta">Average basket size</div>
        </div>
        <div className="stat-card c-danger">
          <div className="stat-label">Last Order</div>
          <div className="stat-value" style={{ fontSize: "24px" }}>
            {formatAdminDate(customer.lastOrderAt)}
          </div>
          <div className="stat-delta">Most recent purchase</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Order History</div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Date</th>
              <th>City</th>
              <th>Total</th>
              <th>Payment</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {customer.orders.map((order) => (
              <tr key={order.id}>
                <td className="t-accent">{order.orderNumber}</td>
                <td className="t-muted">{formatAdminDate(order.createdAt)}</td>
                <td className="t-muted">{order.city ?? customer.city}</td>
                <td>{formatRevenue(order.total)}</td>
                <td>
                  <AdminBadge tone={getPaymentTone(order.paymentStatus)}>
                    {order.paymentStatus}
                  </AdminBadge>
                </td>
                <td>
                  <AdminBadge tone={getOrderTone(order.status)}>{order.status}</AdminBadge>
                </td>
                <td>
                  <Link href={`/admin/orders/${order.id}`} className="t-link">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
