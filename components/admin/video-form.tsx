"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { saveVideoAction } from "@/app/(admin)/admin/actions"
import { formatAdminDate, INITIAL_ACTION_STATE, slugify } from "@/lib/admin"
import { type AdminVideo } from "@/lib/admin-data"
import { getYouTubeThumbnailUrl } from "@/lib/video"

interface VideoFormProps {
  mode: "create" | "edit"
  video?: AdminVideo
}

const VIDEO_CATEGORIES = [
  { value: "edit", label: "Edit" },
  { value: "trick", label: "Trick" },
  { value: "spot", label: "Spot" },
  { value: "community", label: "Community" },
]

export function VideoForm({ mode, video }: VideoFormProps) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(saveVideoAction, INITIAL_ACTION_STATE)
  const [title, setTitle] = useState(video?.title ?? "")
  const [slug, setSlug] = useState(video?.slug ?? "")
  const [slugDirty, setSlugDirty] = useState(Boolean(video?.slug))
  const [youtubeUrl, setYouTubeUrl] = useState(video?.youtubeUrl ?? "")
  const [published, setPublished] = useState(video?.published ?? true)
  const [thumbnailMode, setThumbnailMode] = useState<"auto" | "manual">("auto")
  const [selectedThumbnailFile, setSelectedThumbnailFile] = useState<File | null>(null)
  const [selectedThumbnailPreview, setSelectedThumbnailPreview] = useState<string | null>(null)
  const lastMessageRef = useRef<string | undefined>(undefined)
  const fileInputRef = useRef<HTMLInputElement | null>(null)

  const autoThumbnailUrl = getYouTubeThumbnailUrl(youtubeUrl)
  const initialManualThumbnail =
    video?.thumbnailUrl && video.thumbnailUrl !== autoThumbnailUrl ? video.thumbnailUrl : null
  const [existingManualThumbnail, setExistingManualThumbnail] = useState<string | null>(
    initialManualThumbnail,
  )

  useEffect(() => {
    if (!slugDirty) {
      setSlug(slugify(title))
    }
  }, [title, slugDirty])

  useEffect(() => {
    if (existingManualThumbnail && existingManualThumbnail === autoThumbnailUrl) {
      setExistingManualThumbnail(null)
      setThumbnailMode("auto")
    }
  }, [autoThumbnailUrl, existingManualThumbnail])

  useEffect(() => {
    if (existingManualThumbnail) {
      setThumbnailMode("manual")
    }
  }, [existingManualThumbnail])

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
    router.push(state.redirectTo || "/admin/videos")
  }, [router, state])

  useEffect(() => {
    if (!selectedThumbnailFile) {
      setSelectedThumbnailPreview(null)
      return
    }

    const previewUrl = URL.createObjectURL(selectedThumbnailFile)
    setSelectedThumbnailPreview(previewUrl)

    return () => URL.revokeObjectURL(previewUrl)
  }, [selectedThumbnailFile])

  const previewThumbnailUrl =
    selectedThumbnailPreview ??
    (thumbnailMode === "manual" ? existingManualThumbnail : null) ??
    autoThumbnailUrl

  const clearManualThumbnail = () => {
    setThumbnailMode("auto")
    setExistingManualThumbnail(null)
    setSelectedThumbnailFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <form action={formAction} className="space-y-4">
      {video ? <input type="hidden" name="id" value={video.id} /> : null}
      <input type="hidden" name="slug" value={slug} />
      <input
        type="hidden"
        name="existingThumbnailUrl"
        value={thumbnailMode === "manual" ? existingManualThumbnail ?? "" : ""}
      />
      <input type="hidden" name="thumbnailMode" value={thumbnailMode} />
      <input type="checkbox" name="published" checked={published} readOnly className="sr-only" />

      <div className="grid gap-4 xl:grid-cols-[1fr_268px]">
        <div className="flex-col">
          <section className="card">
            <div className="card-header">
              <div className="card-title">Video Info</div>
            </div>
            <div className="card-body">
              <div className="form-grid max-md:grid-cols-1">
                <label className="form-group md:col-span-2">
                  <span className="form-label">
                    Video Title <em>*</em>
                  </span>
                  <input
                    name="title"
                    required
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    className="fi"
                  />
                </label>

                <label className="form-group md:col-span-2">
                  <span className="form-label">
                    YouTube URL <em>*</em>
                  </span>
                  <input
                    name="youtubeUrl"
                    required
                    value={youtubeUrl}
                    onChange={(event) => setYouTubeUrl(event.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="fi"
                  />
                </label>

                <label className="form-group">
                  <span className="form-label">
                    Category <em>*</em>
                  </span>
                  <select name="category" defaultValue={video?.category ?? "community"} className="fs">
                    {VIDEO_CATEGORIES.map((category) => (
                      <option key={category.value} value={category.value}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-group">
                  <span className="form-label">Slug</span>
                  <input value={slug} readOnly className="fi" />
                </label>
              </div>
            </div>
          </section>

          <section className="card">
            <div className="card-header">
              <div className="card-title">Thumbnail</div>
              {thumbnailMode === "manual" ? (
                <button type="button" onClick={clearManualThumbnail} className="card-action">
                  Use Auto Thumbnail
                </button>
              ) : null}
            </div>
            <div className="card-body space-y-4">
              {previewThumbnailUrl ? (
                <div className="img-thumbs">
                  <div className="img-thumb overflow-hidden p-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={previewThumbnailUrl}
                      alt={title || "Video thumbnail"}
                      className="h-full w-full object-cover"
                    />
                  </div>
                </div>
              ) : (
                <div className="t-muted">Paste a valid YouTube URL to generate a thumbnail.</div>
              )}

              <label className="upload-zone block">
                <input
                  ref={fileInputRef}
                  name="thumbnailFile"
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0] ?? null
                    setSelectedThumbnailFile(file)
                    setThumbnailMode(file ? "manual" : existingManualThumbnail ? "manual" : "auto")
                  }}
                  className="sr-only"
                />
                <div className="upload-txt">Upload custom thumbnail</div>
                <div className="upload-sub">Override the auto-generated YouTube thumbnail</div>
              </label>
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
                  <div className="toggle-lbl">Published</div>
                  <div className="toggle-sub">Visible on the videos page</div>
                </div>
                <button
                  type="button"
                  onClick={() => setPublished((value) => !value)}
                  className={`sw ${published ? "on" : ""}`}
                  aria-pressed={published}
                />
              </div>
            </div>
          </section>

          <section className="card">
            <div className="card-header">
              <div className="card-title">Summary</div>
            </div>
            <div className="card-body space-y-2 text-[10px] text-[var(--text3)]">
              <div>Slug: {slug || "video-slug"}</div>
              <div>Thumbnail: {thumbnailMode === "manual" ? "Manual override" : "Auto from YouTube"}</div>
              {video?.createdAt ? <div>Created: {formatAdminDate(video.createdAt)}</div> : null}
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
              ? "Create Video"
              : "Save Video"}
        </button>

        <button type="button" onClick={() => router.push("/admin/videos")} className="btn">
          Cancel
        </button>
      </div>
    </form>
  )
}
