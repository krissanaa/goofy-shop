"use client"

import { useActionState, useEffect, useRef } from "react"
import toast from "react-hot-toast"
import {
  updateOrderStatusAction,
} from "@/app/(admin)/admin/actions"
import { ADMIN_ORDER_STATUSES, INITIAL_ACTION_STATE } from "@/lib/admin"

interface OrderStatusFormProps {
  id: string
  status: string
}

export function OrderStatusForm({
  id,
  status,
}: OrderStatusFormProps) {
  const [state, formAction, isPending] = useActionState(
    updateOrderStatusAction,
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
    }
  }, [state])

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="id" value={id} />

      <label className="form-group">
        <span className="form-label">Update Status</span>
        <select name="status" defaultValue={status} className="status-sel fs">
          {ADMIN_ORDER_STATUSES.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="btn btn-primary inline-flex w-full items-center justify-center disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "Saving..." : "Save Status"}
      </button>
    </form>
  )
}
