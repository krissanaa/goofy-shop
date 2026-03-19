"use client"

import Link from "next/link"
import { useActionState, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import {
  importInventoryCsvAction,
  updateInventoryStockStateAction,
} from "@/app/(admin)/admin/actions"
import { AdminBadge } from "@/components/admin/admin-badge"
import { formatAdminDate, INITIAL_ACTION_STATE, type AdminProduct } from "@/lib/admin"

interface InventoryStockLog {
  id: string
  productId: string
  productName: string
  oldStock: number
  newStock: number
  reason: string | null
  changedBy: string
  createdAt: string | null
}

interface InventoryManagerProps {
  products: AdminProduct[]
  logs: InventoryStockLog[]
}

function useAdminActionFeedback(
  state: { status: string; message?: string },
  onSuccess?: () => void,
) {
  const lastMessageRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (!state.message || state.message === lastMessageRef.current) {
      return
    }

    lastMessageRef.current = state.message

    if (state.status === "error") {
      toast.error(state.message)
      return
    }

    if (state.status === "success") {
      toast.success(state.message)
      onSuccess?.()
    }
  }, [onSuccess, state])
}

function getLowThreshold(product: AdminProduct) {
  return product.lowStockThreshold ?? 3
}

function getInventoryStatus(product: AdminProduct) {
  const threshold = getLowThreshold(product)

  if (product.stock === 0) {
    return {
      label: "Out",
      tone: "cancelled" as const,
    }
  }

  if (product.stock <= 2) {
    return {
      label: "Critical",
      tone: "pending" as const,
    }
  }

  if (product.stock <= threshold) {
    return {
      label: "Low",
      tone: "pending" as const,
    }
  }

  return {
    label: "Healthy",
    tone: "active" as const,
  }
}

function renderStockValue(product: AdminProduct) {
  if (product.stock === 0) {
    return <span className="stock-lo">OUT</span>
  }

  if (product.stock <= 2) {
    return (
      <span style={{ color: "var(--warning)", fontWeight: 700 }}>
        {product.stock} {"\u26A0"}
      </span>
    )
  }

  if (product.stock <= 10) {
    return <span className="stock-md">{product.stock}</span>
  }

  return <span className="stock-hi">{product.stock}</span>
}

function InventoryInlineStockEditor({ product }: { product: AdminProduct }) {
  const router = useRouter()
  const [editing, setEditing] = useState(false)
  const [value, setValue] = useState(String(product.stock))
  const [state, formAction, isPending] = useActionState(
    updateInventoryStockStateAction,
    INITIAL_ACTION_STATE,
  )

  useAdminActionFeedback(state, () => {
    setEditing(false)
    router.refresh()
  })

  useEffect(() => {
    setValue(String(product.stock))
  }, [product.stock])

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        className="btn"
        style={{ padding: "5px 10px" }}
      >
        {renderStockValue(product)}
      </button>
    )
  }

  return (
    <form action={formAction} style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <input type="hidden" name="id" value={product.id} />
      <input type="hidden" name="reason" value="Inline inventory update" />
      <input
        name="stock"
        type="number"
        min="0"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="fi"
        style={{ width: 86, padding: "7px 10px" }}
      />
      <button type="submit" className="btn" disabled={isPending}>
        Save
      </button>
      <button type="button" className="btn" onClick={() => setEditing(false)}>
        Cancel
      </button>
    </form>
  )
}

function InventoryCsvImportForm() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [fileName, setFileName] = useState("")
  const [state, formAction, isPending] = useActionState(
    importInventoryCsvAction,
    INITIAL_ACTION_STATE,
  )

  useAdminActionFeedback(state, () => router.refresh())

  return (
    <form action={formAction} className="card">
      <div className="card-header">
        <div className="card-title">CSV Import</div>
        <div className="card-action">slug, stock</div>
      </div>
      <div className="card-body" style={{ display: "grid", gap: 12 }}>
        <label className="upload-zone block">
          <input
            ref={inputRef}
            name="file"
            type="file"
            accept=".csv,text/csv"
            className="sr-only"
            onChange={(event) =>
              setFileName(event.target.files?.[0]?.name ?? "")
            }
          />
          <div className="upload-txt">Upload inventory CSV</div>
          <div className="upload-sub">
            Import bulk stock updates using columns: slug, stock
          </div>
        </label>
        <div className="toggle-sub" style={{ marginTop: 0 }}>
          {fileName || "No file selected"}
        </div>
        <button type="submit" className="btn btn-primary" disabled={isPending}>
          {isPending ? "Importing..." : "Import CSV"}
        </button>
      </div>
    </form>
  )
}

interface InventoryRestockModalProps {
  product: AdminProduct
  logs: InventoryStockLog[]
  onClose: () => void
}

function InventoryRestockModal({
  product,
  logs,
  onClose,
}: InventoryRestockModalProps) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(
    updateInventoryStockStateAction,
    INITIAL_ACTION_STATE,
  )

  useAdminActionFeedback(state, () => {
    router.refresh()
    onClose()
  })

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.62)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        zIndex: 60,
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{ width: "min(720px, 100%)", maxHeight: "90vh", overflow: "auto" }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="card-header">
          <div>
            <div className="card-title">Restock Product</div>
            <div className="page-sub" style={{ marginTop: 6 }}>
              {product.name}
            </div>
          </div>
          <button type="button" className="btn" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="card-body" style={{ display: "grid", gap: 16 }}>
          <div className="info-grid">
            <div>
              <div className="info-lbl">Current Stock</div>
              <div className="info-val">{product.stock}</div>
            </div>
            <div>
              <div className="info-lbl">Low Threshold</div>
              <div className="info-val">{getLowThreshold(product)}</div>
            </div>
          </div>

          <form action={formAction} className="flex-col">
            <input type="hidden" name="id" value={product.id} />
            <label className="form-group">
              <span className="form-label">New Stock</span>
              <input
                name="stock"
                type="number"
                min="0"
                defaultValue={product.stock}
                className="fi"
              />
            </label>
            <label className="form-group">
              <span className="form-label">Reason</span>
              <input
                name="reason"
                defaultValue="Restock adjustment"
                className="fi"
                placeholder="Why are you changing this stock?"
              />
            </label>
            <button type="submit" className="btn btn-primary" disabled={isPending}>
              {isPending ? "Saving..." : "Save Stock"}
            </button>
          </form>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Recent Stock History</div>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Old</th>
                  <th>New</th>
                  <th>Reason</th>
                  <th>Changed By</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="t-muted">
                      No stock history yet.
                    </td>
                  </tr>
                ) : (
                  logs.slice(0, 5).map((log) => (
                    <tr key={log.id}>
                      <td>{log.oldStock}</td>
                      <td>{log.newStock}</td>
                      <td className="t-muted">{log.reason ?? "Manual update"}</td>
                      <td className="t-muted">{log.changedBy}</td>
                      <td className="t-muted">{formatAdminDate(log.createdAt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export function InventoryManager({ products, logs }: InventoryManagerProps) {
  const [restockProductId, setRestockProductId] = useState<string | null>(null)

  const lowStockProducts = useMemo(
    () =>
      products
        .filter((product) => product.stock <= 3)
        .sort((a, b) => a.stock - b.stock || a.name.localeCompare(b.name)),
    [products],
  )

  const restockProduct =
    restockProductId ? products.find((product) => product.id === restockProductId) ?? null : null

  const restockLogs = restockProduct
    ? logs.filter((log) => log.productId === restockProduct.id)
    : []

  return (
    <div className="space-y-4">
      <div className="grid gap-4 xl:grid-cols-[1fr_320px]">
        <div className="card">
          <div className="card-header">
            <div className="card-title">Low Stock Alert</div>
            <div className="card-action">{lowStockProducts.length} items</div>
          </div>
          <div
            className="card-body"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: 12,
            }}
          >
            {lowStockProducts.length === 0 ? (
              <div className="t-muted">No products are at 3 stock or below.</div>
            ) : (
              lowStockProducts.map((product) => (
                <article className="card" key={product.id}>
                  <div className="card-body" style={{ display: "grid", gap: 10 }}>
                    <div>
                      <div className="t-main">{product.name}</div>
                      <div className="t-muted">
                        {product.category} · threshold {getLowThreshold(product)}
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      {renderStockValue(product)}
                      <AdminBadge tone={getInventoryStatus(product).tone}>
                        {getInventoryStatus(product).label}
                      </AdminBadge>
                    </div>
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() => setRestockProductId(product.id)}
                    >
                      Restock
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </div>

        <InventoryCsvImportForm />
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Full Inventory</div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Current Stock</th>
              <th>Low Threshold</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan={6} className="t-muted">
                  No inventory records match this search.
                </td>
              </tr>
            ) : (
              products.map((product) => {
                const status = getInventoryStatus(product)

                return (
                  <tr key={product.id}>
                    <td>
                      <div className="prod-cell">
                        <div className="prod-img overflow-hidden p-0">
                          {product.images[0] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={product.images[0]}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            "IMG"
                          )}
                        </div>
                        <div>
                          <div className="t-main">{product.name}</div>
                          <div className="t-muted">{product.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td className="t-muted">{product.category}</td>
                    <td>
                      <InventoryInlineStockEditor product={product} />
                    </td>
                    <td className="t-muted">{getLowThreshold(product)}</td>
                    <td>
                      <AdminBadge tone={status.tone}>{status.label}</AdminBadge>
                    </td>
                    <td>
                      <Link href={`/admin/products/${product.id}`} className="t-link">
                        Edit
                      </Link>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="card">
        <div className="card-header">
          <div className="card-title">Recent Stock History</div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Old Stock</th>
              <th>New Stock</th>
              <th>Reason</th>
              <th>Changed By</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="t-muted">
                  No stock changes logged yet.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td className="t-main">{log.productName}</td>
                  <td>{log.oldStock}</td>
                  <td>{log.newStock}</td>
                  <td className="t-muted">{log.reason ?? "Manual update"}</td>
                  <td className="t-muted">{log.changedBy}</td>
                  <td className="t-muted">{formatAdminDate(log.createdAt)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {restockProduct ? (
        <InventoryRestockModal
          product={restockProduct}
          logs={restockLogs}
          onClose={() => setRestockProductId(null)}
        />
      ) : null}
    </div>
  )
}
