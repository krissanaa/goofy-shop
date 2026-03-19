"use client"

import { useActionState, useEffect, useRef } from "react"
import toast from "react-hot-toast"
import {
  cancelOrderAction,
  duplicateOrderAction,
  markOrderPaidAction,
  saveOrderInternalNoteAction,
  saveOrderShippingAction,
} from "@/app/(admin)/admin/actions"
import { INITIAL_ACTION_STATE } from "@/lib/admin"

function useAdminActionFeedback(state: { status: string; message?: string }) {
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
    }
  }, [state])
}

interface OrderPaymentActionFormProps {
  id: string
  paymentStatus: string
}

export function OrderPaymentActionForm({
  id,
  paymentStatus,
}: OrderPaymentActionFormProps) {
  const [state, formAction, isPending] = useActionState(
    markOrderPaidAction,
    INITIAL_ACTION_STATE,
  )

  useAdminActionFeedback(state)

  const isPaid = ["PAID", "SUCCEEDED", "SUCCESS"].includes(paymentStatus.toUpperCase())

  return (
    <form action={formAction}>
      <input type="hidden" name="id" value={id} />
      <button type="submit" disabled={isPending || isPaid} className="btn">
        {isPending ? "Saving..." : isPaid ? "Payment Confirmed" : "Mark as Paid"}
      </button>
    </form>
  )
}

interface OrderShippingFormProps {
  id: string
  trackingNumber?: string | null
  carrier?: string | null
}

export function OrderShippingForm({
  id,
  trackingNumber,
  carrier,
}: OrderShippingFormProps) {
  const [state, formAction, isPending] = useActionState(
    saveOrderShippingAction,
    INITIAL_ACTION_STATE,
  )

  useAdminActionFeedback(state)

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={id} />

      <label className="form-group">
        <span className="form-label">Tracking Number</span>
        <input
          name="trackingNumber"
          defaultValue={trackingNumber ?? ""}
          className="fi"
          placeholder="Optional tracking id"
        />
      </label>

      <label className="form-group">
        <span className="form-label">Carrier</span>
        <input
          name="carrier"
          defaultValue={carrier ?? ""}
          className="fi"
          placeholder="DHL / Local Rider / Pickup"
        />
      </label>

      <button type="submit" disabled={isPending} className="btn btn-primary w-full">
        {isPending ? "Saving..." : "Save Shipping"}
      </button>
    </form>
  )
}

interface OrderInternalNoteFormProps {
  id: string
  internalNote?: string | null
}

export function OrderInternalNoteForm({
  id,
  internalNote,
}: OrderInternalNoteFormProps) {
  const [state, formAction, isPending] = useActionState(
    saveOrderInternalNoteAction,
    INITIAL_ACTION_STATE,
  )

  useAdminActionFeedback(state)

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={id} />
      <label className="form-group">
        <span className="form-label">Internal Notes</span>
        <textarea
          name="internalNote"
          defaultValue={internalNote ?? ""}
          className="ft"
          rows={5}
          placeholder="Visible to admin only"
        />
      </label>
      <button type="submit" disabled={isPending} className="btn btn-primary w-full">
        {isPending ? "Saving..." : "Save Notes"}
      </button>
    </form>
  )
}

interface OrderQuickActionsProps {
  id: string
}

export function OrderQuickActions({ id }: OrderQuickActionsProps) {
  return (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <button type="button" className="btn" style={{ flex: 1 }} onClick={() => window.print()}>
        Print
      </button>

      <form action={duplicateOrderAction} style={{ flex: 1 }}>
        <input type="hidden" name="id" value={id} />
        <button type="submit" className="btn" style={{ width: "100%" }}>
          Duplicate
        </button>
      </form>

      <form action={cancelOrderAction} style={{ flex: 1 }}>
        <input type="hidden" name="id" value={id} />
        <button
          type="submit"
          className="btn"
          style={{ width: "100%", color: "var(--danger)", borderColor: "var(--danger)" }}
        >
          Cancel
        </button>
      </form>
    </div>
  )
}
