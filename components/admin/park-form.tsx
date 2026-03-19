"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { saveParkAction } from "@/app/(admin)/admin/actions"
import { formatAdminDate, INITIAL_ACTION_STATE, slugify } from "@/lib/admin"
import { type AdminPark } from "@/lib/admin-data"

interface ParkFormProps {
  mode: "create" | "edit"
  park?: AdminPark
}

const PARK_DIFFICULTIES = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
]

export function ParkForm({ mode, park }: ParkFormProps) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(saveParkAction, INITIAL_ACTION_STATE)
  const [name, setName] = useState(park?.name ?? "")
  const [slug, setSlug] = useState(park?.slug ?? "")
  const [slugDirty, setSlugDirty] = useState(Boolean(park?.slug))
  const [isActive, setIsActive] = useState(park?.active ?? true)
  const [existingPhotos, setExistingPhotos] = useState<string[]>(park?.photos ?? [])
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const lastMessageRef = useRef<string | undefined>(undefined)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

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
    router.push(state.redirectTo || "/admin/parks")
  }, [router, state])

  const syncSelectedFiles = (files: File[]) => {
    if (!fileInputRef.current || typeof DataTransfer === "undefined") {
      return
    }

    const dataTransfer = new DataTransfer()
    files.forEach((file) => dataTransfer.items.add(file))
    fileInputRef.current.files = dataTransfer.files
  }

  const handlePhotoSelection = (nextFiles: File[]) => {
    if (nextFiles.length === 0) {
      return
    }

    setSelectedFiles((current) => {
      const remainingSlots = Math.max(0, 6 - existingPhotos.length - current.length)
      const mergedFiles = [...current, ...nextFiles.slice(0, remainingSlots)]
      syncSelectedFiles(mergedFiles)
      return mergedFiles
    })
  }

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((current) => {
      const next = current.filter((_, fileIndex) => fileIndex !== index)
      syncSelectedFiles(next)
      return next
    })
  }

  const totalPhotos = existingPhotos.length + selectedFiles.length

  return (
    <form action={formAction} className="space-y-4">
      {park ? <input type="hidden" name="id" value={park.id} /> : null}
      <input type="hidden" name="existingPhotos" value={JSON.stringify(existingPhotos)} />
      <input type="checkbox" name="active" checked={isActive} readOnly className="sr-only" />

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
                    Park Name <em>*</em>
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
                  <span className="form-label">
                    City <em>*</em>
                  </span>
                  <input name="city" required defaultValue={park?.city ?? ""} className="fi" />
                </label>

                <label className="form-group">
                  <span className="form-label">
                    Difficulty <em>*</em>
                  </span>
                  <select name="difficulty" defaultValue={park?.difficulty ?? "beginner"} className="fs">
                    {PARK_DIFFICULTIES.map((difficulty) => (
                      <option key={difficulty.value} value={difficulty.value}>
                        {difficulty.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-group md:col-span-2">
                  <span className="form-label">Location / Maps Link</span>
                  <input
                    name="location"
                    defaultValue={park?.location ?? ""}
                    placeholder="Google Maps link or location note"
                    className="fi"
                  />
                </label>

                <label className="form-group md:col-span-2">
                  <span className="form-label">Description</span>
                  <textarea
                    name="description"
                    rows={8}
                    defaultValue={park?.description ?? ""}
                    placeholder="Describe the park, street spot, or community vibe..."
                    className="ft"
                  />
                </label>
              </div>
            </div>
          </section>

          <section className="card">
            <div className="card-header">
              <div className="card-title">Photos</div>
            </div>
            <div className="card-body space-y-4">
              <label
                className={`upload-zone block ${totalPhotos >= 6 ? "pointer-events-none opacity-50" : ""}`}
              >
                <input
                  ref={fileInputRef}
                  name="photos"
                  type="file"
                  accept="image/*"
                  multiple
                  disabled={totalPhotos >= 6}
                  onChange={(event) => handlePhotoSelection(Array.from(event.target.files ?? []))}
                  className="sr-only"
                />
                <div className="upload-txt">Upload park photos</div>
                <div className="upload-sub">Stored in the parks bucket, max 6 images</div>
              </label>

              {existingPhotos.length > 0 || selectedFiles.length > 0 ? (
                <div className="img-thumbs">
                  {existingPhotos.map((photoUrl) => (
                    <div key={photoUrl} className="space-y-1">
                      <div className="img-thumb overflow-hidden p-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={photoUrl}
                          alt={name || "Park photo"}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setExistingPhotos((current) =>
                            current.filter((photo) => photo !== photoUrl),
                          )
                        }
                        className="t-danger"
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  {selectedFiles.map((file, index) => (
                    <div key={`${file.name}-${index}`} className="space-y-1">
                      <div className="img-thumb px-2 text-center text-[8px] leading-tight text-[var(--text3)]">
                        {file.name}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSelectedFile(index)}
                        className="t-danger"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
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
                  <div className="toggle-sub">Visible on the parks page</div>
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
              <div className="card-title">Summary</div>
            </div>
            <div className="card-body space-y-2 text-[10px] text-[var(--text3)]">
              <div>Slug: {slug || "park-slug"}</div>
              <div>Photos: {totalPhotos} / 6</div>
              <div>Bucket: parks</div>
              {park?.createdAt ? <div>Created: {formatAdminDate(park.createdAt)}</div> : null}
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
              ? "Create Park"
              : "Save Park"}
        </button>

        <button type="button" onClick={() => router.push("/admin/parks")} className="btn">
          Cancel
        </button>
      </div>
    </form>
  )
}
