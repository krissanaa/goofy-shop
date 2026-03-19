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
import { bulkUpdateOrdersAction } from "@/app/(admin)/admin/actions"
import { AdminBadge } from "@/components/admin/admin-badge"
import { formatAdminDate, formatRevenue, INITIAL_ACTION_STATE, type AdminOrder } from "@/lib/admin"

interface OrdersDataTableProps {
  orders: AdminOrder[]
  exportParams: {
    q?: string
    status?: string
    payment?: string
    date?: string
    from?: string
    to?: string
  }
}

function getStatusTone(status: string) {
  switch (status) {
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

export function OrdersDataTable({ orders, exportParams }: OrdersDataTableProps) {
  const router = useRouter()
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [state, formAction, isPending] = useActionState(
    bulkUpdateOrdersAction,
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

  const columns: ColumnDef<AdminOrder>[] = [
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
          aria-label="Select all orders"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          aria-label={`Select ${row.original.orderNumber}`}
        />
      ),
    },
    {
      accessorKey: "orderNumber",
      header: "Order #",
      cell: ({ row }) => <span className="t-accent">{row.original.orderNumber}</span>,
    },
    {
      id: "date",
      header: "Date",
      cell: ({ row }) => (
        <span className="t-muted">{formatAdminDate(row.original.createdAt)}</span>
      ),
    },
    {
      id: "customer",
      header: "Customer",
      cell: ({ row }) => (
        <>
          <div className="t-main">{row.original.customerName}</div>
          <div className="t-muted">{row.original.phone}</div>
        </>
      ),
    },
    {
      id: "items",
      header: "Items",
      cell: ({ row }) => <span className="t-muted">{row.original.itemCount} items</span>,
    },
    {
      id: "total",
      header: "Total",
      cell: ({ row }) => <span>{formatRevenue(row.original.total)}</span>,
    },
    {
      id: "payment",
      header: "Payment",
      cell: ({ row }) => (
        <AdminBadge tone={getPaymentTone(row.original.paymentStatus)}>
          {row.original.paymentStatus}
        </AdminBadge>
      ),
    },
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <AdminBadge tone={getStatusTone(row.original.status)}>
          {row.original.status}
        </AdminBadge>
      ),
    },
    {
      id: "actions",
      header: "Action",
      cell: ({ row }) => (
        <Link href={`/admin/orders/${row.original.id}`} className="t-link">
          View -{">"}
        </Link>
      ),
    },
  ]

  const table = useReactTable({
    data: orders,
    columns,
    state: { rowSelection },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
  })

  const selectedIds = table.getSelectedRowModel().rows.map((row) => row.original.id)

  const selectedExportHref = useMemo(() => {
    const query = new URLSearchParams()

    if (exportParams.q) query.set("q", exportParams.q)
    if (exportParams.status && exportParams.status !== "ALL") query.set("status", exportParams.status)
    if (exportParams.payment && exportParams.payment !== "ALL") query.set("payment", exportParams.payment)
    if (exportParams.date && exportParams.date !== "ALL") query.set("date", exportParams.date)
    if (exportParams.from) query.set("from", exportParams.from)
    if (exportParams.to) query.set("to", exportParams.to)
    if (selectedIds.length > 0) query.set("ids", selectedIds.join(","))

    const queryString = query.toString()
    return `/admin/orders/export${queryString ? `?${queryString}` : ""}`
  }, [exportParams, selectedIds])

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
          value="MARK_PROCESSING"
          disabled={isPending || selectedIds.length === 0}
          className="btn"
        >
          Mark as Processing
        </button>
        <button
          type="submit"
          name="bulkAction"
          value="MARK_SHIPPED"
          disabled={isPending || selectedIds.length === 0}
          className="btn"
        >
          Mark as Shipped
        </button>
        <button
          type="button"
          disabled={selectedIds.length === 0}
          onClick={() => {
            if (selectedIds.length === 0) {
              return
            }

            window.location.href = selectedExportHref
          }}
          className="btn"
        >
          Export Selected
        </button>
      </form>

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
    </>
  )
}
