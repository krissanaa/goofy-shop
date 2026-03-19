"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { saveBannerAction } from "@/app/(admin)/admin/actions"
import { INITIAL_ACTION_STATE } from "@/lib/admin"
import { type AdminBanner } from "@/lib/admin-content"

interface BannerFormProps {
  mode: "create" | "edit"
  banner?: AdminBanner
  nextOrder: number
}

export function BannerForm({ mode, banner, nextOrder }: BannerFormProps) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(saveBannerAction, INITIAL_ACTION_STATE)
  const [tag, setTag] = useState(banner?.tag ?? "")
  const [title, setTitle] = useState(banner?.title ?? "")
  const [ctaText, setCtaText] = useState(banner?.ctaText ?? "")
  const [ctaLink, setCtaLink] = useState(banner?.ctaLink ?? "/shop")
  const [order, setOrder] = useState(banner?.order ?? nextOrder)
  const [isActive, setIsActive] = useState(banner?.active ?? true)
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null)
  const [selectedImagePreview, setSelectedImagePreview] = useState<string | null>(null)
  const lastMessageRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (!selectedImageFile) {
      setSelectedImagePreview(null)
      return
    }

    const previewUrl = URL.createObjectURL(selectedImageFile)
    setSelectedImagePreview(previewUrl)

    return () => URL.revokeObjectURL(previewUrl)
  }, [selectedImageFile])

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
    router.push(state.redirectTo || "/admin/banners")
  }, [router, state])

  const previewImageUrl = selectedImagePreview ?? banner?.imageUrl ?? null

  return (
    <form action={formAction} className="space-y-4">
      {banner ? <input type="hidden" name="id" value={banner.id} /> : null}
      <input type="hidden" name="existingImageUrl" value={banner?.imageUrl ?? ""} />
      <input type="checkbox" name="active" checked={isActive} readOnly className="sr-only" />

      <div className="grid gap-4 xl:grid-cols-[1fr_268px]">
        <div className="flex-col">
          <section className="card">
            <div className="card-header">
              <div className="card-title">Banner Content</div>
            </div>
            <div className="card-body">
              <div className="form-grid max-md:grid-cols-1">
                <label className="form-group md:col-span-2">
                  <span className="form-label">
                    Banner Title <em>*</em>
                  </span>
                  <input
                    name="title"
                    required
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="fi"
                  />
                </label>

                <label className="form-group">
                  <span className="form-label">Tag</span>
                  <input
                    name="tag"
                    value={tag}
                    onChange={(event) => setTag(event.target.value)}
                    className="fi"
                  />
                </label>

                <label className="form-group">
                  <span className="form-label">Sort Order</span>
                  <input
                    name="order"
                    type="number"
                    min="1"
                    value={order}
                    onChange={(event) => setOrder(Math.max(1, Number(event.target.value) || 1))}
                    className="fi"
                  />
                </label>

                <label className="form-group">
                  <span className="form-label">
                    CTA Text <em>*</em>
                  </span>
                  <input
                    name="ctaText"
                    required
                    value={ctaText}
                    onChange={(event) => setCtaText(event.target.value)}
                    className="fi"
                  />
                </label>

                <label className="form-group">
                  <span className="form-label">
                    CTA Link <em>*</em>
                  </span>
                  <input
                    name="ctaLink"
                    required
                    value={ctaLink}
                    onChange={(event) => setCtaLink(event.target.value)}
                    className="fi"
                  />
                </label>
              </div>
            </div>
          </section>

          <section className="card">
            <div className="card-header">
              <div className="card-title">Image</div>
            </div>
            <div className="card-body">
              <label className="upload-zone block">
                <input
                  name="image"
                  type="file"
                  accept="image/*"
                  onChange={(event) => setSelectedImageFile(event.target.files?.[0] ?? null)}
                  className="sr-only"
                />
                <div className="upload-txt">Upload banner image</div>
                <div className="upload-sub">Homepage hero slideshow asset</div>
              </label>

              {previewImageUrl ? (
                <div className="img-thumbs">
                  <div className="img-thumb overflow-hidden p-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewImageUrl}
                      alt={title || "Banner preview"}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        </div>

        <div className="flex-col">
          <section className="card">
            <div className="card-header">
              <div className="card-title">Status</div>
            </div>
            <div className="card-body">
              <div className="toggle-row border-b-0 py-0">
                <div>
                  <div className="toggle-lbl">Active</div>
                  <div className="toggle-sub">Visible in homepage slider</div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive((value) => !value)}
                  className={`sw ${isActive ? "on" : ""}`}
                  aria-pressed={isActive}
                />
              </div>
            </div>
          </section>
        </div>
      </div>

      <section className="card">
        <div className="card-header">
          <div className="card-title">Live Preview</div>
        </div>
        <div className="card-body">
          <div
            className="overflow-hidden border border-[var(--border)]"
            style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", minHeight: "260px" }}
          >
            <div
              style={{
                background: "var(--bg)",
                padding: "24px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                gap: "12px",
              }}
            >
              <div className="page-eyebrow">{tag || "Featured"}</div>
              <div className="page-title" style={{ fontSize: "48px" }}>
                {title || "Banner Title"}
              </div>
              <div className="page-sub">{ctaLink || "/shop"}</div>
              <div>
                <span className="btn btn-primary inline-flex items-center justify-center">
                  {ctaText || "Explore"}
                </span>
              </div>
            </div>

            <div
              style={{
                background: "var(--surface2)",
                position: "relative",
                minHeight: "260px",
                display: "flex",
                alignItems: "stretch",
                justifyContent: "stretch",
              }}
            >
              {previewImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={previewImageUrl}
                  alt={title || "Banner image"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div
                  className="t-muted"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: "100%",
                  }}
                >
                  Banner image preview
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

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
              ? "Create Banner"
              : "Save Banner"}
        </button>

        <button
          type="button"
          onClick={() => router.push("/admin/banners")}
          className="btn"
        >
          Cancel
        </button>
      </div>
    </form>
  )
}
