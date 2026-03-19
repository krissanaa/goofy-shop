import Link from "next/link"
import { notFound } from "next/navigation"
import { AdminBadge } from "@/components/admin/admin-badge"
import {
  OrderInternalNoteForm,
  OrderPaymentActionForm,
  OrderQuickActions,
  OrderShippingForm,
} from "@/components/admin/order-detail-controls"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { OrderStatusForm } from "@/components/admin/order-status-form"
import { formatAdminDate, formatRevenue, isImageUrl } from "@/lib/admin"
import { getAdminOrder, getAdminOrderLogs } from "@/lib/admin-data"
import { formatPrice } from "@/lib/utils/format"

interface OrderDetailPageProps {
  params: Promise<{
    id: string
  }>
}

type GenericRow = Record<string, unknown>

function asString(value: unknown): string | null {
  if (typeof value === "string") {
    const normalized = value.trim()
    return normalized.length > 0 ? normalized : null
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value)
  }

  return null
}

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

function pickString(row: GenericRow, keys: string[]): string | null {
  for (const key of keys) {
    const value = asString(row[key])
    if (value) {
      return value
    }
  }

  return null
}

function pickNumber(row: GenericRow, keys: string[]): number | null {
  for (const key of keys) {
    const value = asNumber(row[key])
    if (value !== null) {
      return value
    }
  }

  return null
}

function normalizeOrderItem(row: Record<string, unknown>, index: number) {
  const product = typeof row.product === "object" && row.product !== null
    ? (row.product as GenericRow)
    : null
  const quantity = Math.max(1, pickNumber(row, ["quantity", "qty", "count"]) ?? 1)
  const unitPrice =
    pickNumber(row, ["unit_price", "unitPrice", "price"]) ??
    (product ? pickNumber(product, ["price"]) : null) ??
    pickNumber(row, ["total", "line_total", "lineTotal"]) ??
    0
  const subtotal =
    pickNumber(row, ["total", "line_total", "lineTotal"]) ?? unitPrice * quantity

  return {
    id: pickString(row, ["id", "sku", "product_id", "productId"]) ?? `item-${index + 1}`,
    name:
      pickString(row, ["product_name", "productName", "name", "title", "variant_title"]) ??
      (product ? pickString(product, ["name", "title"]) : null) ??
      `Item ${index + 1}`,
    image:
      pickString(row, ["image", "image_url", "imageUrl", "product_image", "productImage"]) ??
      (product
        ? pickString(product, ["image", "image_url", "imageUrl", "thumbnail"])
        : null),
    quantity,
    unitPrice,
    subtotal,
  }
}

function getOrderTone(status: string) {
  switch (status) {
    case "PAID":
    case "FULFILLING":
      return "processing" as const
    case "SHIPPED":
      return "shipped" as const
    case "COMPLETED":
      return "delivered" as const
    case "CANCELED":
      return "cancelled" as const
    default:
      return "pending" as const
  }
}

function getPaymentTone(status: string) {
  return ["PAID", "SUCCEEDED", "SUCCESS"].includes(status.toUpperCase()) ? "paid" : "unpaid"
}

function formatTimelineLabel(fromStatus: string | null, toStatus: string) {
  return fromStatus && fromStatus !== toStatus ? `${fromStatus} -> ${toStatus}` : toStatus
}

export default async function AdminOrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params
  const [order, logs] = await Promise.all([getAdminOrder(id), getAdminOrderLogs(id)])

  if (!order) {
    notFound()
  }

  const items = order.items.map((item, index) => normalizeOrderItem(item, index))
  const subtotal =
    order.subtotal > 0
      ? order.subtotal
      : items.reduce((total, item) => total + item.subtotal, 0)
  const shippingTotal = order.shippingTotal
  const discountTotal = order.discountTotal
  const timeline =
    logs.length > 0
      ? logs
      : [
          {
            id: `${order.id}-created`,
            orderId: order.id,
            fromStatus: null,
            toStatus: order.status,
            changedBy: "system",
            note: "Order created",
            createdAt: order.createdAt,
          },
        ]

  return (
    <div>
      <Link href="/admin/orders" className="back">
        {"<-"} Back to Orders
      </Link>

      <AdminPageHeader
        eyebrow="Ecommerce"
        title={order.orderNumber}
        subtitle={formatAdminDate(order.createdAt)}
      />

      <div className="od-grid">
        <div className="flex-col">
          <section className="card">
            <div className="card-header">
              <div className="card-title">Order Items</div>
              <AdminBadge tone={getOrderTone(order.status)}>{order.status}</AdminBadge>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <div className="prod-cell">
                          <div className="prod-img" style={{ overflow: "hidden" }}>
                            {item.image && isImageUrl(item.image) ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img
                                src={item.image}
                                alt={item.name}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            ) : (
                              <span className="t-muted">#</span>
                            )}
                          </div>
                          <div className="t-main">{item.name}</div>
                        </div>
                      </td>
                      <td className="t-muted">{item.quantity}</td>
                      <td className="t-muted">{formatRevenue(item.unitPrice)}</td>
                      <td>{formatRevenue(item.subtotal)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="t-muted">
                      No order items recorded.
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="t-muted">Subtotal</td>
                  <td />
                  <td />
                  <td className="t-muted">{formatRevenue(subtotal)}</td>
                </tr>
                <tr>
                  <td className="t-muted">Shipping</td>
                  <td />
                  <td />
                  <td className="t-muted">{formatRevenue(shippingTotal)}</td>
                </tr>
                <tr>
                  <td className="t-muted">Discount</td>
                  <td />
                  <td />
                  <td className="t-muted">
                    {discountTotal > 0 ? `-${formatPrice(discountTotal)}` : formatRevenue(0)}
                  </td>
                </tr>
                <tr className="t-total">
                  <td>TOTAL</td>
                  <td />
                  <td />
                  <td>{formatRevenue(order.total)}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="card">
            <div className="card-header">
              <div className="card-title">Customer Info</div>
            </div>
            <div className="card-body">
              <div className="info-grid">
                <div>
                  <div className="info-lbl">Name</div>
                  <div className="info-val">{order.customerName}</div>
                </div>
                <div>
                  <div className="info-lbl">Phone</div>
                  <div className="info-val">{order.phone}</div>
                </div>
                <div>
                  <div className="info-lbl">Email</div>
                  <div className="info-val">{order.email}</div>
                </div>
                <div>
                  <div className="info-lbl">City</div>
                  <div className="info-val">{order.city || "No city provided"}</div>
                </div>
                <div>
                  <div className="info-lbl">Payment Method</div>
                  <div className="info-val">{order.paymentMethod || "Unknown"}</div>
                </div>
                <div>
                  <div className="info-lbl">Tracking</div>
                  <div className="info-val">{order.trackingNumber || "Not set"}</div>
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <div className="info-lbl">Address</div>
                  <div className="info-val">{order.address || "No address provided"}</div>
                </div>
                {order.notes ? (
                  <div style={{ gridColumn: "1 / -1" }}>
                    <div className="info-lbl">Customer Note</div>
                    <div className="info-val">{order.notes}</div>
                  </div>
                ) : null}
              </div>
            </div>
          </section>

          <section className="card">
            <div className="card-header">
              <div className="card-title">Order Timeline</div>
            </div>
            <div className="card-body" style={{ paddingTop: 6, paddingBottom: 6 }}>
              {timeline.map((entry) => (
                <div key={entry.id} className="toggle-row">
                  <div>
                    <div className="toggle-lbl">
                      {formatTimelineLabel(entry.fromStatus, entry.toStatus)}
                    </div>
                    <div className="toggle-sub">
                      {formatAdminDate(entry.createdAt)} // by {entry.changedBy}
                    </div>
                    {entry.note ? <div className="toggle-sub">{entry.note}</div> : null}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="flex-col">
          <section className="card">
            <div className="card-header">
              <div className="card-title">Order Status</div>
            </div>
            <div className="card-body">
              <OrderStatusForm id={order.id} status={order.status} />
            </div>
          </section>

          <section className="card">
            <div className="card-header">
              <div className="card-title">Payment</div>
            </div>
            <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                <AdminBadge tone={getPaymentTone(order.paymentStatus)}>{order.paymentStatus}</AdminBadge>
                <OrderPaymentActionForm id={order.id} paymentStatus={order.paymentStatus} />
              </div>
              <div className="t-muted">{order.paymentMethod || "Manual payment"}</div>

              {order.slipUrl ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {isImageUrl(order.slipUrl) ? (
                    <div
                      style={{
                        overflow: "hidden",
                        border: "1px solid var(--border)",
                        background: "var(--surface2)",
                        padding: 8,
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={order.slipUrl}
                        alt={order.orderNumber}
                        style={{ width: "100%", display: "block", objectFit: "cover" }}
                      />
                    </div>
                  ) : null}

                  <a
                    href={order.slipUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn"
                  >
                    View Slip
                  </a>
                </div>
              ) : (
                <div className="slip-box">No slip uploaded</div>
              )}
            </div>
          </section>

          <section className="card">
            <div className="card-header">
              <div className="card-title">Shipping</div>
            </div>
            <div className="card-body">
              <OrderShippingForm
                id={order.id}
                trackingNumber={order.trackingNumber}
                carrier={order.carrier}
              />
            </div>
          </section>

          <section className="card">
            <div className="card-header">
              <div className="card-title">Notes</div>
            </div>
            <div className="card-body">
              <OrderInternalNoteForm id={order.id} internalNote={order.internalNote} />
            </div>
          </section>

          <section className="card">
            <div className="card-header">
              <div className="card-title">Quick Actions</div>
            </div>
            <div className="card-body">
              <OrderQuickActions id={order.id} />
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
