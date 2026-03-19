"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { saveDiscountAction } from "@/app/(admin)/admin/actions"
import { INITIAL_ACTION_STATE } from "@/lib/admin"
import { formatAdminDateTimeInput } from "@/lib/admin-content"
import { type AdminDiscount } from "@/lib/admin-data"
import { generateDiscountCode } from "@/lib/discounts"

interface DiscountFormProps {
  mode: "create" | "edit"
  discount?: AdminDiscount
  initialCode?: string
}

export function DiscountForm({ mode, discount, initialCode }: DiscountFormProps) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(saveDiscountAction, INITIAL_ACTION_STATE)
  const [active, setActive] = useState(discount?.active ?? true)
  const [code, setCode] = useState(discount?.code ?? initialCode ?? "")
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

    toast.success(state.message)
    router.push(state.redirectTo || "/admin/discounts")
  }, [router, state])

  return (
    <form action={formAction} className="space-y-4">
      {discount ? <input type="hidden" name="id" value={discount.id} /> : null}
      <input type="checkbox" name="active" checked={active} readOnly className="sr-only" />

      <div className="grid gap-4 xl:grid-cols-[1fr_268px]">
        <div className="flex-col">
          <section className="card">
            <div className="card-header">
              <div className="card-title">Discount Info</div>
            </div>
            <div className="card-body">
              <div className="form-grid max-md:grid-cols-1">
                <label className="form-group md:col-span-2">
                  <span className="form-label">
                    Code <em>*</em>
                  </span>
                  <div className="flex gap-2 max-sm:flex-col">
                    <input
                      name="code"
                      required
                      value={code}
                      onChange={(event) => setCode(event.target.value.toUpperCase())}
                      placeholder="GOOFY10"
                      className="fi flex-1 uppercase"
                    />
                    <button
                      type="button"
                      onClick={() => setCode(generateDiscountCode())}
                      className="btn whitespace-nowrap"
                    >
                      Generate
                    </button>
                  </div>
                </label>

                <label className="form-group">
                  <span className="form-label">
                    Type <em>*</em>
                  </span>
                  <select
                    name="type"
                    defaultValue={discount?.type.toLowerCase() ?? "percent"}
                    className="fs"
                  >
                    <option value="percent">Percent Off</option>
                    <option value="fixed">Fixed Amount Off</option>
                  </select>
                </label>

                <label className="form-group">
                  <span className="form-label">
                    Value <em>*</em>
                  </span>
                  <input
                    name="value"
                    type="number"
                    min="1"
                    defaultValue={discount?.value ?? ""}
                    placeholder="10 or 20000"
                    className="fi"
                  />
                </label>

                <label className="form-group">
                  <span className="form-label">Min Order</span>
                  <input
                    name="minOrder"
                    type="number"
                    min="0"
                    defaultValue={discount?.minOrder ?? 0}
                    placeholder="0"
                    className="fi"
                  />
                </label>

                <label className="form-group">
                  <span className="form-label">Max Uses</span>
                  <input
                    name="maxUses"
                    type="number"
                    min="0"
                    defaultValue={discount?.maxUses ?? 0}
                    placeholder="0 = unlimited"
                    className="fi"
                  />
                </label>

                <label className="form-group md:col-span-2">
                  <span className="form-label">Expires At</span>
                  <input
                    name="expiresAt"
                    type="datetime-local"
                    defaultValue={formatAdminDateTimeInput(discount?.expiresAt ?? null)}
                    className="fi"
                  />
                </label>
              </div>
            </div>
          </section>
        </div>

        <div className="flex-col">
          <section className="card">
            <div className="card-header">
              <div className="card-title">Status</div>
            </div>
            <div className="card-body space-y-4">
              <div className="toggle-row border-b-0 py-0">
                <div>
                  <div className="toggle-lbl">Active</div>
                  <div className="toggle-sub">Available at checkout</div>
                </div>
                <button
                  type="button"
                  onClick={() => setActive((value) => !value)}
                  className={`sw ${active ? "on" : ""}`}
                  aria-pressed={active}
                />
              </div>

              {discount ? (
                <div className="space-y-2 text-[10px] text-[var(--text3)]">
                  <div>Uses: {discount.maxUses > 0 ? `${discount.usesCount} / ${discount.maxUses}` : `${discount.usesCount} / Unlimited`}</div>
                  <div>Created: {discount.createdAt ? new Date(discount.createdAt).toLocaleString("en-GB") : "Unknown"}</div>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="btn btn-primary inline-flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Create Discount"
              : "Save Discount"}
        </button>

        <button type="button" onClick={() => router.push("/admin/discounts")} className="btn">
          Cancel
        </button>
      </div>
    </form>
  )
}
