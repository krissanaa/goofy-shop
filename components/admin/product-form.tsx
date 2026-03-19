"use client"

import type { ReactNode } from "react"
import { useActionState, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { saveProductAction } from "@/app/(admin)/admin/actions"
import {
  ADMIN_PRODUCT_BADGES,
  ADMIN_PRODUCT_CATEGORIES,
  INITIAL_ACTION_STATE,
  slugify,
  type AdminProduct,
} from "@/lib/admin"

interface ProductFormProps {
  mode: "create" | "edit"
  product?: AdminProduct
}

type ImageEntry =
  | {
      id: string
      kind: "existing"
      value: string
      preview: string
    }
  | {
      id: string
      kind: "new"
      token: string
      file: File
      preview: string
    }

type SpecRow = {
  id: string
  key: string
  value: string
}

function createSpecRows(product?: AdminProduct): SpecRow[] {
  const entries = Object.entries(product?.specs ?? {}).filter(
    ([key, value]) => key.trim() && value !== null && value !== undefined,
  )

  if (entries.length === 0) {
    return [{ id: crypto.randomUUID(), key: "", value: "" }]
  }

  return entries.map(([key, value]) => ({
    id: crypto.randomUUID(),
    key,
    value: String(value),
  }))
}

function createImageEntries(product?: AdminProduct): ImageEntry[] {
  return (product?.images ?? []).map((image) => ({
    id: crypto.randomUUID(),
    kind: "existing",
    value: image,
    preview: image,
  }))
}

function renderInlineMarkdown(text: string): ReactNode[] {
  const output: ReactNode[] = []
  const regex = /(\*\*[^*]+\*\*|`[^`]+`|\*[^*]+\*)/g
  let lastIndex = 0
  let match: RegExpExecArray | null = regex.exec(text)

  while (match) {
    if (match.index > lastIndex) {
      output.push(text.slice(lastIndex, match.index))
    }

    const token = match[0]
    if (token.startsWith("**") && token.endsWith("**")) {
      output.push(<strong key={`${match.index}-bold`}>{token.slice(2, -2)}</strong>)
    } else if (token.startsWith("`") && token.endsWith("`")) {
      output.push(
        <code
          key={`${match.index}-code`}
          style={{ padding: "1px 4px", background: "var(--surface2)" }}
        >
          {token.slice(1, -1)}
        </code>,
      )
    } else if (token.startsWith("*") && token.endsWith("*")) {
      output.push(<em key={`${match.index}-italic`}>{token.slice(1, -1)}</em>)
    } else {
      output.push(token)
    }

    lastIndex = regex.lastIndex
    match = regex.exec(text)
  }

  if (lastIndex < text.length) {
    output.push(text.slice(lastIndex))
  }

  return output
}

function MarkdownPreview({ value }: { value: string }) {
  const blocks = value
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)

  if (blocks.length === 0) {
    return <div className="t-muted">Nothing to preview yet.</div>
  }

  return (
    <div style={{ display: "grid", gap: 12 }}>
      {blocks.map((block, index) => {
        const lines = block.split("\n").map((line) => line.trim())

        if (lines.every((line) => line.startsWith("- "))) {
          return (
            <ul key={`list-${index}`} style={{ paddingLeft: 18, display: "grid", gap: 6 }}>
              {lines.map((line) => (
                <li key={line}>{renderInlineMarkdown(line.slice(2))}</li>
              ))}
            </ul>
          )
        }

        if (block.startsWith("## ")) {
          return (
            <h3 key={`h3-${index}`} className="t-main" style={{ fontSize: 18 }}>
              {renderInlineMarkdown(block.slice(3))}
            </h3>
          )
        }

        if (block.startsWith("# ")) {
          return (
            <h2 key={`h2-${index}`} className="t-main" style={{ fontSize: 22 }}>
              {renderInlineMarkdown(block.slice(2))}
            </h2>
          )
        }

        return (
          <p key={`p-${index}`} className="t-main" style={{ lineHeight: 1.7 }}>
            {lines.flatMap((line, lineIndex) =>
              lineIndex === 0 ? renderInlineMarkdown(line) : [<br key={`${index}-${lineIndex}`} />, ...renderInlineMarkdown(line)],
            )}
          </p>
        )
      })}
    </div>
  )
}

export function ProductForm({ mode, product }: ProductFormProps) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(saveProductAction, INITIAL_ACTION_STATE)
  const [name, setName] = useState(product?.name ?? "")
  const [slug, setSlug] = useState(product?.slug ?? "")
  const [slugDirty, setSlugDirty] = useState(Boolean(product?.slug))
  const [isActive, setIsActive] = useState(product?.active ?? true)
  const [price, setPrice] = useState(product?.price ? String(product.price) : "")
  const [comparePrice, setComparePrice] = useState(
    product?.comparePrice ? String(product.comparePrice) : "",
  )
  const [description, setDescription] = useState(product?.description ?? "")
  const [previewMode, setPreviewMode] = useState(false)
  const [specRows, setSpecRows] = useState<SpecRow[]>(() => createSpecRows(product))
  const [images, setImages] = useState<ImageEntry[]>(() => createImageEntries(product))
  const [draggingImageId, setDraggingImageId] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const lastMessageRef = useRef<string | undefined>(undefined)
  const imagesRef = useRef<ImageEntry[]>(images)

  imagesRef.current = images

  useEffect(() => {
    if (slugDirty) {
      return
    }

    setSlug(slugify(name))
  }, [name, slugDirty])

  useEffect(() => {
    if (!fileInputRef.current) {
      return
    }

    const transfer = new DataTransfer()
    images.forEach((image) => {
      if (image.kind === "new") {
        transfer.items.add(image.file)
      }
    })
    fileInputRef.current.files = transfer.files
  }, [images])

  useEffect(() => {
    return () => {
      imagesRef.current.forEach((image) => {
        if (image.kind === "new") {
          URL.revokeObjectURL(image.preview)
        }
      })
    }
  }, [])

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
      router.push(state.redirectTo || "/admin/products")
    }
  }, [router, state])

  const discountPercent = useMemo(() => {
    const parsedPrice = Number(price)
    const parsedCompare = Number(comparePrice)

    if (!Number.isFinite(parsedPrice) || !Number.isFinite(parsedCompare) || parsedPrice <= 0) {
      return null
    }

    if (parsedCompare <= parsedPrice) {
      return null
    }

    return Math.round((1 - parsedPrice / parsedCompare) * 100)
  }, [comparePrice, price])

  const specsValue = useMemo(() => {
    const entries = specRows
      .map((row) => [row.key.trim(), row.value.trim()] as const)
      .filter(([key, value]) => key && value)

    if (entries.length === 0) {
      return ""
    }

    return JSON.stringify(Object.fromEntries(entries))
  }, [specRows])

  const existingImagesValue = useMemo(
    () =>
      JSON.stringify(
        images.flatMap((image) => (image.kind === "existing" ? [image.value] : [])),
      ),
    [images],
  )

  const newImageTokensValue = useMemo(
    () =>
      JSON.stringify(
        images.flatMap((image) => (image.kind === "new" ? [image.token] : [])),
      ),
    [images],
  )

  const imageOrderValue = useMemo(
    () =>
      JSON.stringify(
        images.map((image) =>
          image.kind === "existing"
            ? { kind: "existing", value: image.value }
            : { kind: "new", value: image.token },
        ),
      ),
    [images],
  )

  function handleSelectFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) {
      return
    }

    setImages((current) => {
      const slotsLeft = Math.max(0, 6 - current.length)
      const nextFiles = Array.from(fileList).slice(0, slotsLeft)

      if (nextFiles.length === 0) {
        toast.error("You can upload a maximum of 6 images.")
        return current
      }

      const nextEntries: ImageEntry[] = nextFiles.map((file) => ({
        id: crypto.randomUUID(),
        kind: "new",
        token: `${file.name}-${file.size}-${file.lastModified}-${crypto.randomUUID()}`,
        file,
        preview: URL.createObjectURL(file),
      }))

      if (nextFiles.length < fileList.length) {
        toast.error("Only the first 6 images were kept.")
      }

      return [...current, ...nextEntries]
    })
  }

  function moveImage(draggedId: string, targetId: string) {
    if (draggedId === targetId) {
      return
    }

    setImages((current) => {
      const draggedIndex = current.findIndex((image) => image.id === draggedId)
      const targetIndex = current.findIndex((image) => image.id === targetId)

      if (draggedIndex === -1 || targetIndex === -1) {
        return current
      }

      const next = [...current]
      const [dragged] = next.splice(draggedIndex, 1)
      next.splice(targetIndex, 0, dragged)
      return next
    })
  }

  function removeImage(id: string) {
    setImages((current) => {
      const image = current.find((entry) => entry.id === id)
      if (image?.kind === "new") {
        URL.revokeObjectURL(image.preview)
      }
      return current.filter((entry) => entry.id !== id)
    })
  }

  return (
    <form action={formAction} className="space-y-4">
      {mode === "edit" && product ? <input type="hidden" name="id" value={product.id} /> : null}
      <input type="hidden" name="existingImages" value={existingImagesValue} />
      <input type="hidden" name="newImageTokens" value={newImageTokensValue} />
      <input type="hidden" name="imageOrder" value={imageOrderValue} />
      <input type="hidden" name="specs" value={specsValue} />
      <input type="checkbox" name="active" checked={isActive} readOnly className="sr-only" />

      <div className="grid gap-4 xl:grid-cols-[1fr_268px]">
        <div className="flex-col">
          <section className="card">
            <div className="card-header">
              <div className="card-title">Basic</div>
            </div>
            <div className="card-body">
              <div className="form-grid max-md:grid-cols-1">
                <label className="form-group md:col-span-2">
                  <span className="form-label">
                    Product Name <em>*</em>
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
                  <span className="form-label">
                    Category <em>*</em>
                  </span>
                  <select name="category" defaultValue={product?.category ?? "deck"} className="fs">
                    {ADMIN_PRODUCT_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-group">
                  <span className="form-label">
                    Brand <em>*</em>
                  </span>
                  <input name="brand" defaultValue={product?.brand ?? ""} className="fi" required />
                </label>

                <label className="form-group">
                  <span className="form-label">Slug</span>
                  <input
                    name="slug"
                    value={slug}
                    onChange={(event) => {
                      setSlug(event.target.value)
                      setSlugDirty(true)
                    }}
                    className="fi"
                  />
                </label>

                <label className="form-group">
                  <span className="form-label">Badge</span>
                  <select name="badge" defaultValue={product?.badge ?? ""} className="fs">
                    <option value="">None</option>
                    {ADMIN_PRODUCT_BADGES.map((badge) => (
                      <option key={badge} value={badge}>
                        {badge}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </section>

          <section className="card">
            <div className="card-header">
              <div className="card-title">Pricing</div>
              {discountPercent ? <div className="card-action">{discountPercent}% OFF</div> : null}
            </div>
            <div className="card-body">
              <div className="form-grid max-md:grid-cols-1">
                <label className="form-group">
                  <span className="form-label">
                    Price <em>*</em>
                  </span>
                  <input
                    name="price"
                    type="number"
                    min="0"
                    required
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    className="fi"
                  />
                </label>

                <label className="form-group">
                  <span className="form-label">Compare Price</span>
                  <input
                    name="comparePrice"
                    type="number"
                    min="0"
                    value={comparePrice}
                    onChange={(event) => setComparePrice(event.target.value)}
                    className="fi"
                  />
                </label>
              </div>

              <div className="toggle-sub" style={{ marginTop: 12 }}>
                {discountPercent
                  ? `Discount preview: ${discountPercent}% OFF`
                  : "Add a compare price to preview the discount."}
              </div>
            </div>
          </section>

          <section className="card">
            <div className="card-header">
              <div className="card-title">Images</div>
              <div className="card-action">{images.length}/6 uploaded</div>
            </div>
            <div className="card-body">
              <label className="upload-zone block">
                <input
                  ref={fileInputRef}
                  name="images"
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  onChange={(event) => {
                    handleSelectFiles(event.target.files)
                    event.target.value = ""
                  }}
                />
                <div className="upload-txt">Drop images here or click to upload</div>
                <div className="upload-sub">JPG · PNG · WEBP · Max 6 images total</div>
              </label>

              {images.length > 0 ? (
                <div className="img-thumbs">
                  {images.map((image) => (
                    <div
                      key={image.id}
                      className="img-thumb overflow-hidden p-0"
                      draggable
                      onDragStart={() => setDraggingImageId(image.id)}
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={(event) => {
                        event.preventDefault()
                        if (draggingImageId) {
                          moveImage(draggingImageId, image.id)
                        }
                        setDraggingImageId(null)
                      }}
                      style={{ position: "relative", cursor: "move" }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={image.preview} alt="" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(image.id)}
                        className="btn"
                        style={{
                          position: "absolute",
                          top: 4,
                          right: 4,
                          padding: "1px 6px",
                          fontSize: 8,
                          background: "rgba(13,13,13,0.72)",
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}

              <div className="toggle-sub" style={{ marginTop: 12 }}>
                Drag thumbnails to reorder. The first image becomes the main product image.
              </div>
            </div>
          </section>

          <section className="card">
            <div className="card-header">
              <div className="card-title">Description</div>
              <button
                type="button"
                onClick={() => setPreviewMode((value) => !value)}
                className={`ftab ${previewMode ? "active" : ""}`}
              >
                {previewMode ? "Preview On" : "Preview Off"}
              </button>
            </div>
            <div className="card-body">
              <div className="form-group">
                <span className="form-label">Markdown</span>
                <textarea
                  name="description"
                  rows={10}
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="ft"
                />
              </div>

              {previewMode ? (
                <div className="card" style={{ marginTop: 14 }}>
                  <div className="card-header">
                    <div className="card-title">Live Preview</div>
                  </div>
                  <div className="card-body">
                    <MarkdownPreview value={description} />
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
                  <div className="toggle-sub">Visible in shop</div>
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

          <section className="card">
            <div className="card-header">
              <div className="card-title">Inventory</div>
            </div>
            <div className="card-body" style={{ display: "grid", gap: 12 }}>
              <label className="form-group">
                <span className="form-label">
                  Stock Qty <em>*</em>
                </span>
                <input
                  name="stock"
                  type="number"
                  min="0"
                  defaultValue={product?.stock ?? 0}
                  className="fi"
                  required
                />
              </label>

              <label className="form-group">
                <span className="form-label">SKU</span>
                <input name="sku" defaultValue={product?.sku ?? ""} className="fi" />
              </label>

              <label className="form-group">
                <span className="form-label">Low Stock Threshold</span>
                <input
                  name="lowStockThreshold"
                  type="number"
                  min="0"
                  defaultValue={product?.lowStockThreshold ?? 3}
                  className="fi"
                />
              </label>
            </div>
          </section>

          <section className="card">
            <div className="card-header">
              <div className="card-title">Specs</div>
              <button
                type="button"
                onClick={() =>
                  setSpecRows((current) => [
                    ...current,
                    { id: crypto.randomUUID(), key: "", value: "" },
                  ])
                }
                className="btn"
              >
                + Add Spec
              </button>
            </div>
            <div className="card-body">
              <div className="flex-col" style={{ gap: 10 }}>
                {specRows.map((row, index) => (
                  <div
                    key={row.id}
                    style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: 6 }}
                  >
                    <input
                      className="fi"
                      value={row.key}
                      placeholder="Material"
                      onChange={(event) =>
                        setSpecRows((current) =>
                          current.map((item) =>
                            item.id === row.id ? { ...item, key: event.target.value } : item,
                          ),
                        )
                      }
                    />
                    <input
                      className="fi"
                      value={row.value}
                      placeholder="Maple"
                      onChange={(event) =>
                        setSpecRows((current) =>
                          current.map((item) =>
                            item.id === row.id ? { ...item, value: event.target.value } : item,
                          ),
                        )
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setSpecRows((current) =>
                          current.length === 1
                            ? [{ ...current[0], key: "", value: "" }]
                            : current.filter((item) => item.id !== row.id),
                        )
                      }
                      className="btn"
                      style={{ paddingInline: 10 }}
                      aria-label={`Remove spec row ${index + 1}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="card">
            <div className="card-header">
              <div className="card-title">SEO</div>
            </div>
            <div className="card-body" style={{ display: "grid", gap: 12 }}>
              <label className="form-group">
                <span className="form-label">Meta Title</span>
                <input name="metaTitle" defaultValue={product?.metaTitle ?? ""} className="fi" />
              </label>

              <label className="form-group">
                <span className="form-label">Meta Description</span>
                <textarea
                  name="metaDescription"
                  rows={4}
                  defaultValue={product?.metaDescription ?? ""}
                  className="ft"
                />
              </label>
            </div>
          </section>
        </div>
      </div>

      <div className="topbar-right" style={{ justifyContent: "flex-start" }}>
        <button
          type="submit"
          disabled={isPending}
          className="btn btn-primary"
        >
          {isPending ? (mode === "create" ? "Creating..." : "Saving...") : "Save Product"}
        </button>

        {mode === "edit" && product ? (
          <button
            type="button"
            onClick={() => router.push(`/admin/products/new?duplicateFrom=${product.id}`)}
            className="btn"
          >
            Duplicate Product
          </button>
        ) : null}

        <button type="button" onClick={() => router.push("/admin/products")} className="btn">
          Cancel
        </button>
      </div>
    </form>
  )
}
