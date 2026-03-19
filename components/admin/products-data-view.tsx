"use client"

import Link from "next/link"
import { useActionState, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  type RowSelectionState,
} from "@tanstack/react-table"
import {
  bulkUpdateProductsAction,
  toggleProductActiveAction,
} from "@/app/(admin)/admin/actions"
import { AdminBadge } from "@/components/admin/admin-badge"
import {
  formatRevenue,
  getProductDiscountPercent,
  INITIAL_ACTION_STATE,
  type AdminProduct,
} from "@/lib/admin"

interface ProductsDataViewProps {
  products: AdminProduct[]
  view: "table" | "grid"
  exportParams: {
    q?: string
    category?: string
    brand?: string
    badge?: string
    state?: string
    sort?: string
  }
}

function renderStock(product: AdminProduct) {
  if (product.stock === 0) {
    return <span className="stock-lo">OUT</span>
  }

  if (product.stock <= 2) {
    return (
      <span style={{ color: "var(--gold)", fontWeight: 700 }}>
        {product.stock} left {"\u26A0"}
      </span>
    )
  }

  if (product.stock <= 10) {
    return <span className="stock-md">{product.stock} left</span>
  }

  return <span className="stock-hi">{product.stock} left</span>
}

function renderBadge(product: AdminProduct) {
  if (!product.badge) {
    return <span className="t-muted">-</span>
  }

  return (
    <AdminBadge
      tone={
        product.badge === "HOT" ? "hot" : product.badge === "SALE" ? "sale" : "new"
      }
    >
      {product.badge}
    </AdminBadge>
  )
}

function ProductImageCell({ product }: { product: AdminProduct }) {
  return (
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
  )
}

function ProductActiveToggle({ product }: { product: AdminProduct }) {
  return (
    <form action={toggleProductActiveAction}>
      <input type="hidden" name="id" value={product.id} />
      <input type="hidden" name="nextActive" value={product.active ? "false" : "true"} />
      <button
        type="submit"
        className={`sw ${product.active ? "on" : ""}`}
        aria-label={product.active ? "Deactivate product" : "Activate product"}
      />
    </form>
  )
}

export function ProductsDataView({
  products,
  view,
  exportParams,
}: ProductsDataViewProps) {
  const router = useRouter()
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [state, formAction, isPending] = useActionState(
    bulkUpdateProductsAction,
    INITIAL_ACTION_STATE,
  )
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
      setRowSelection({})
      router.refresh()
    }
  }, [router, state])

  const columns: ColumnDef<AdminProduct>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          ref={(node) => {
            if (node) {
              node.indeterminate = table.getIsSomeRowsSelected()
            }
          }}
          onChange={table.getToggleAllRowsSelectedHandler()}
          aria-label="Select all products"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          aria-label={`Select ${row.original.name}`}
        />
      ),
    },
    {
      id: "image",
      header: "Image",
      cell: ({ row }) => <ProductImageCell product={row.original} />,
    },
    {
      id: "name",
      header: "Name",
      cell: ({ row }) => (
        <div>
          <div className="t-main">{row.original.name}</div>
          <div className="t-muted">{row.original.slug}</div>
        </div>
      ),
    },
    {
      id: "category",
      header: "Category",
      cell: ({ row }) => <span className="t-muted">{row.original.category}</span>,
    },
    {
      id: "brand",
      header: "Brand",
      cell: ({ row }) => <span className="t-main">{row.original.brand}</span>,
    },
    {
      id: "price",
      header: "Price",
      cell: ({ row }) => <span>{formatRevenue(row.original.price)}</span>,
    },
    {
      id: "comparePrice",
      header: "Compare Price",
      cell: ({ row }) =>
        row.original.comparePrice ? (
          <span className="t-muted" style={{ textDecoration: "line-through" }}>
            {formatRevenue(row.original.comparePrice)}
          </span>
        ) : (
          <span className="t-muted">-</span>
        ),
    },
    {
      id: "stock",
      header: "Stock",
      cell: ({ row }) => renderStock(row.original),
    },
    {
      id: "badge",
      header: "Badge",
      cell: ({ row }) => renderBadge(row.original),
    },
    {
      id: "active",
      header: "Active",
      cell: ({ row }) => <ProductActiveToggle product={row.original} />,
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <Link href={`/admin/products/${row.original.id}`} className="t-link">
            Edit
          </Link>
          <Link
            href={`/admin/products/new?duplicateFrom=${row.original.id}`}
            className="t-link"
          >
            Duplicate
          </Link>
        </div>
      ),
    },
  ]

  const table = useReactTable({
    data: products,
    columns,
    state: { rowSelection },
    enableRowSelection: true,
    getRowId: (row) => row.id,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
  })

  const selectedIds = Object.entries(rowSelection)
    .filter(([, selected]) => selected)
    .map(([id]) => id)

  const selectedExportHref = useMemo(() => {
    const query = new URLSearchParams()

    if (exportParams.q) query.set("q", exportParams.q)
    if (exportParams.category && exportParams.category !== "ALL") {
      query.set("category", exportParams.category)
    }
    if (exportParams.brand && exportParams.brand !== "ALL") {
      query.set("brand", exportParams.brand)
    }
    if (exportParams.badge && exportParams.badge !== "ALL") {
      query.set("badge", exportParams.badge)
    }
    if (exportParams.state && exportParams.state !== "ALL") {
      query.set("state", exportParams.state)
    }
    if (exportParams.sort && exportParams.sort !== "NEWEST") {
      query.set("sort", exportParams.sort)
    }
    if (selectedIds.length > 0) query.set("ids", selectedIds.join(","))

    const queryString = query.toString()
    return `/admin/products/export${queryString ? `?${queryString}` : ""}`
  }, [exportParams, selectedIds])

  const renderGrid = () => (
    <div
      className="card-body"
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
        gap: 16,
      }}
    >
      {products.map((product) => {
        const discount = getProductDiscountPercent(product)
        const isSelected = Boolean(rowSelection[product.id])

        return (
          <article key={product.id} className="card" style={{ overflow: "hidden" }}>
            <div
              style={{
                position: "relative",
                aspectRatio: "1 / 1",
                background: "var(--surface2)",
                borderBottom: "1px solid var(--border)",
              }}
            >
              <label
                style={{
                  position: "absolute",
                  top: 10,
                  left: 10,
                  zIndex: 2,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 8px",
                  background: "rgba(13,13,13,0.72)",
                }}
              >
                <input
                  type="checkbox"
                  checked={isSelected}
                  onChange={() =>
                    setRowSelection((current) => ({
                      ...current,
                      [product.id]: !current[product.id],
                    }))
                  }
                  aria-label={`Select ${product.name}`}
                />
                <span className="toggle-sub" style={{ marginTop: 0 }}>
                  Select
                </span>
              </label>

              {product.badge ? (
                <div style={{ position: "absolute", top: 10, right: 10, zIndex: 2 }}>
                  {renderBadge(product)}
                </div>
              ) : null}

              {product.images[0] ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={product.images[0]}
                  alt={product.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="t-muted"
                  style={{
                    height: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    letterSpacing: "0.18em",
                    textTransform: "uppercase",
                  }}
                >
                  No Image
                </div>
              )}
            </div>

            <div className="card-body" style={{ display: "grid", gap: 10 }}>
              <div>
                <div className="t-main">{product.name}</div>
                <div className="t-muted">
                  {product.brand} · {product.category}
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <span>{formatRevenue(product.price)}</span>
                {product.comparePrice ? (
                  <span className="t-muted" style={{ textDecoration: "line-through" }}>
                    {formatRevenue(product.comparePrice)}
                  </span>
                ) : null}
                {discount ? <AdminBadge tone="sale">{discount}% OFF</AdminBadge> : null}
              </div>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div>{renderStock(product)}</div>
                <ProductActiveToggle product={product} />
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                <Link href={`/admin/products/${product.id}`} className="t-link">
                  Edit
                </Link>
                <Link href={`/admin/products/new?duplicateFrom=${product.id}`} className="t-link">
                  Duplicate
                </Link>
              </div>
            </div>
          </article>
        )
      })}
    </div>
  )

  return (
    <>
      <form
        action={formAction}
        className="card-body"
        style={{
          borderBottom: "1px solid var(--border)",
          display: "flex",
          alignItems: "center",
          gap: 8,
          flexWrap: "wrap",
        }}
      >
        <input type="hidden" name="ids" value={selectedIds.join(",")} />
        <div className="toggle-sub" style={{ marginTop: 0 }}>
          {selectedIds.length} selected
        </div>
        <button
          type="submit"
          name="bulkAction"
          value="ACTIVATE"
          disabled={isPending || selectedIds.length === 0}
          className="btn"
        >
          Activate
        </button>
        <button
          type="submit"
          name="bulkAction"
          value="DEACTIVATE"
          disabled={isPending || selectedIds.length === 0}
          className="btn"
        >
          Deactivate
        </button>
        <button
          type="submit"
          name="bulkAction"
          value="DELETE"
          disabled={isPending || selectedIds.length === 0}
          className="btn"
          style={{ color: "var(--danger)", borderColor: "var(--danger)" }}
        >
          Delete
        </button>
        <button
          type="button"
          disabled={selectedIds.length === 0}
          onClick={() => {
            if (selectedIds.length > 0) {
              window.location.href = selectedExportHref
            }
          }}
          className="btn"
        >
          Export Selected
        </button>
      </form>

      {view === "grid" ? (
        renderGrid()
      ) : (
        <table className="table">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  )
}
