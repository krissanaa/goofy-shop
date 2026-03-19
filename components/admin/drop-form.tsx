"use client"

import { useActionState, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { saveDropAction } from "@/app/(admin)/admin/actions"
import { INITIAL_ACTION_STATE, slugify, type AdminProduct } from "@/lib/admin"
import {
  ADMIN_DROP_STATUSES,
  formatAdminDateTimeInput,
  type AdminDrop,
} from "@/lib/admin-content"

interface DropFormProps {
  mode: "create" | "edit"
  drop?: AdminDrop
  products: Pick<AdminProduct, "id" | "name" | "brand" | "slug">[]
}

const STATUS_LABELS: Record<string, string> = {
  UPCOMING: "Upcoming",
  LIVE: "Active",
  ENDED: "Ended",
}

export function DropForm({ mode, drop, products }: DropFormProps) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(saveDropAction, INITIAL_ACTION_STATE)
  const [name, setName] = useState(drop?.title ?? "")
  const [slug, setSlug] = useState(drop?.slug ?? "")
  const [slugDirty, setSlugDirty] = useState(Boolean(drop))
  const [isFeatured, setIsFeatured] = useState(drop?.isFeatured ?? false)
  const [productSearch, setProductSearch] = useState("")
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(drop?.productIds ?? [])
  const lastMessageRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (!slugDirty) {
      setSlug(slugify(name))
    }
  }, [name, slugDirty])

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
    router.push(state.redirectTo || "/admin/drops")
  }, [router, state])

  const selectedProducts = useMemo(() => {
    const selectedIds = new Set(selectedProductIds)
    return products.filter((product) => selectedIds.has(product.id))
  }, [products, selectedProductIds])

  const filteredProducts = useMemo(() => {
    const query = productSearch.trim().toLowerCase()
    const selectedIds = new Set(selectedProductIds)

    return products
      .filter((product) => !selectedIds.has(product.id))
      .filter((product) => {
        if (!query) {
          return true
        }

        return [product.name, product.brand, product.slug]
          .join(" ")
          .toLowerCase()
          .includes(query)
      })
      .slice(0, 8)
  }, [productSearch, products, selectedProductIds])

  const addProduct = (productId: string) => {
    setSelectedProductIds((current) =>
      current.includes(productId) ? current : [...current, productId],
    )
    setProductSearch("")
  }

  const removeProduct = (productId: string) => {
    setSelectedProductIds((current) => current.filter((id) => id !== productId))
  }

  return (
    <form action={formAction} className="space-y-4">
      {drop ? <input type="hidden" name="id" value={drop.id} /> : null}
      <input type="hidden" name="previousSlug" value={drop?.slug ?? ""} />
      <input type="hidden" name="existingCoverImage" value={drop?.coverImage ?? ""} />
      <input type="hidden" name="existingTeaserImage" value={drop?.teaserImage ?? ""} />
      <input type="hidden" name="selectedProductIds" value={JSON.stringify(selectedProductIds)} />
      <input type="checkbox" name="isFeatured" checked={isFeatured} readOnly className="sr-only" />

      <div className="grid gap-4 xl:grid-cols-[1fr_268px]">
        <div className="flex-col">
          <section className="card">
            <div className="card-header">
              <div className="card-title">Basic Info</div>
            </div>
            <div className="card-body">
              <div className="form-grid max-md:grid-cols-1">
                <label className="form-group md:col-span-2">
                  <span className="form-label">
                    Drop Name <em>*</em>
                  </span>
                  <input
                    name="name"
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="fi"
                  />
                </label>

                <label className="form-group">
                  <span className="form-label">Slug</span>
                  <input
                    name="slug"
                    value={slug}
                    onChange={(event) => {
                      setSlugDirty(true)
                      setSlug(event.target.value)
                    }}
                    className="fi"
                  />
                </label>

                <label className="form-group">
                  <span className="form-label">Status</span>
                  <select
                    name="status"
                    defaultValue={drop?.status.toLowerCase() ?? "upcoming"}
                    className="fs"
                  >
                    {ADMIN_DROP_STATUSES.map((status) => (
                      <option key={status} value={status.toLowerCase()}>
                        {STATUS_LABELS[status] ?? status}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-group">
                  <span className="form-label">
                    Drop Date <em>*</em>
                  </span>
                  <input
                    name="dropDate"
                    type="datetime-local"
                    defaultValue={formatAdminDateTimeInput(drop?.dropDate ?? null)}
                    className="fi"
                  />
                </label>

                <label className="form-group">
                  <span className="form-label">End Date</span>
                  <input
                    name="endDate"
                    type="datetime-local"
                    defaultValue={formatAdminDateTimeInput(drop?.endDate ?? null)}
                    className="fi"
                  />
                </label>

                <label className="form-group md:col-span-2">
                  <span className="form-label">Description</span>
                  <textarea
                    name="description"
                    rows={8}
                    defaultValue={drop?.description ?? ""}
                    className="ft"
                  />
                </label>
              </div>
            </div>
          </section>

          <section className="card">
            <div className="card-header">
              <div className="card-title">Cover Image</div>
            </div>
            <div className="card-body">
              <label className="upload-zone block">
                <input name="coverImage" type="file" accept="image/*" className="sr-only" />
                <div className="upload-txt">Upload cover image</div>
                <div className="upload-sub">Stored in the drops bucket</div>
              </label>

              {drop?.coverImage ? (
                <div className="img-thumbs">
                  <div className="img-thumb overflow-hidden p-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={drop.coverImage}
                      alt={`${drop.title} cover`}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <section className="card">
            <div className="card-header">
              <div className="card-title">Products In Drop</div>
            </div>
            <div className="card-body space-y-4">
              <div className="form-group">
                <span className="form-label">Search Products</span>
                <input
                  value={productSearch}
                  onChange={(event) => setProductSearch(event.target.value)}
                  placeholder="Find by name, brand, or slug..."
                  className="search-box ml-0 w-full"
                />
              </div>

              {selectedProducts.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {selectedProducts.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => removeProduct(product.id)}
                      className="ftab active"
                    >
                      {product.name} ×
                    </button>
                  ))}
                </div>
              ) : (
                <div className="t-muted">No products selected for this drop yet.</div>
              )}

              <div className="space-y-2">
                {filteredProducts.length === 0 ? (
                  <div className="t-muted">
                    {products.length === selectedProducts.length
                      ? "All products are already selected."
                      : "No matching products found."}
                  </div>
                ) : (
                  filteredProducts.map((product) => (
                    <button
                      key={product.id}
                      type="button"
                      onClick={() => addProduct(product.id)}
                      className="flex w-full items-center justify-between border-b border-[var(--border2)] py-2 text-left last:border-b-0"
                    >
                      <span className="t-main">{product.name}</span>
                      <span className="t-muted">{product.brand}</span>
                    </button>
                  ))
                )}
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
                  <div className="toggle-lbl">Featured</div>
                  <div className="toggle-sub">Show this drop first on homepage banner</div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsFeatured((value) => !value)}
                  className={`sw ${isFeatured ? "on" : ""}`}
                  aria-pressed={isFeatured}
                />
              </div>

              <div className="space-y-2 text-[10px] text-[var(--text3)]">
                <div>Products Selected: {selectedProductIds.length}</div>
                <div>Notify Signups: {drop?.notifySignups ?? 0}</div>
              </div>

              {drop ? (
                <Link
                  href={`/admin/drops/export-notify?id=${drop.id}`}
                  className="btn inline-flex items-center justify-center"
                >
                  Export Emails / Phones
                </Link>
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
              ? "Create Drop"
              : "Save Drop"}
        </button>

        <button type="button" onClick={() => router.push("/admin/drops")} className="btn">
          Cancel
        </button>
      </div>
    </form>
  )
}
