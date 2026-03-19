"use client"

import { useActionState, useEffect, useRef } from "react"
import toast from "react-hot-toast"
import { saveCustomerNoteAction } from "@/app/(admin)/admin/actions"
import { INITIAL_ACTION_STATE } from "@/lib/admin"

interface CustomerNoteFormProps {
  lookupKey: string
  customerName: string
  phone: string
  note?: string | null
}

export function CustomerNoteForm({
  lookupKey,
  customerName,
  phone,
  note,
}: CustomerNoteFormProps) {
  const [state, formAction, isPending] = useActionState(
    saveCustomerNoteAction,
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
      <input type="hidden" name="lookupKey" value={lookupKey} />
      <input type="hidden" name="customerName" value={customerName} />
      <input type="hidden" name="phone" value={phone} />

      <label className="form-group">
        <span className="form-label">Internal Notes</span>
        <textarea
          name="note"
          defaultValue={note ?? ""}
          className="ft"
          rows={6}
          placeholder="Visible to admin only"
        />
      </label>

      <button type="submit" disabled={isPending} className="btn btn-primary w-full">
        {isPending ? "Saving..." : "Save Note"}
      </button>
    </form>
  )
}
