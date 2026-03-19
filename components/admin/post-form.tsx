"use client"

import { useActionState, useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { savePostAction } from "@/app/(admin)/admin/actions"
import { INITIAL_ACTION_STATE, slugify } from "@/lib/admin"
import {
  ADMIN_POST_CATEGORIES,
  formatAdminDateTimeInput,
  type AdminPost,
} from "@/lib/admin-content"

interface PostFormProps {
  mode: "create" | "edit"
  post?: AdminPost
}

function renderMarkdownPreview(content: string): string {
  const escaped = content
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

  return escaped
    .split(/\n{2,}/)
    .map((block) => {
      if (/^###\s+/.test(block)) {
        return `<h3>${block.replace(/^###\s+/, "")}</h3>`
      }
      if (/^##\s+/.test(block)) {
        return `<h2>${block.replace(/^##\s+/, "")}</h2>`
      }
      if (/^#\s+/.test(block)) {
        return `<h1>${block.replace(/^#\s+/, "")}</h1>`
      }
      if (block.split("\n").every((line) => line.trim().startsWith("- "))) {
        const items = block
          .split("\n")
          .map((line) => `<li>${line.trim().replace(/^- /, "")}</li>`)
          .join("")
        return `<ul>${items}</ul>`
      }

      return `<p>${block.replace(/\n/g, "<br />")}</p>`
    })
    .join("")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
}

export function PostForm({ mode, post }: PostFormProps) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(savePostAction, INITIAL_ACTION_STATE)
  const [published, setPublished] = useState(post?.published ?? false)
  const [title, setTitle] = useState(post?.title ?? "")
  const [slug, setSlug] = useState(post?.slug ?? "")
  const [slugDirty, setSlugDirty] = useState(Boolean(post))
  const [content, setContent] = useState(post?.content ?? "")
  const [previewMode, setPreviewMode] = useState(false)
  const lastMessageRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (!slugDirty) {
      setSlug(slugify(title))
    }
  }, [title, slugDirty])

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
    router.push(state.redirectTo || "/admin/posts")
  }, [router, state])

  const previewHtml = useMemo(() => renderMarkdownPreview(content), [content])

  return (
    <form action={formAction} className="space-y-4">
      {post ? <input type="hidden" name="id" value={post.id} /> : null}
      <input type="hidden" name="existingCoverImage" value={post?.coverImage ?? ""} />
      <input type="checkbox" name="published" checked={published} readOnly className="sr-only" />

      <div className="grid gap-4 xl:grid-cols-[1fr_268px]">
        <div className="flex-col">
          <section className="card">
            <div className="card-header">
              <div className="card-title">Story Info</div>
            </div>
            <div className="card-body">
              <div className="form-grid max-md:grid-cols-1">
                <label className="form-group md:col-span-2">
                  <span className="form-label">
                    Title <em>*</em>
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
                    Category <em>*</em>
                  </span>
                  <select
                    name="category"
                    defaultValue={post?.category ?? "NEWS"}
                    className="fs"
                  >
                    {ADMIN_POST_CATEGORIES.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-group">
                  <span className="form-label">Published At</span>
                  <input
                    name="publishedAt"
                    type="datetime-local"
                    defaultValue={formatAdminDateTimeInput(post?.publishedAt ?? null)}
                    className="fi"
                  />
                </label>

                <label className="form-group md:col-span-2">
                  <span className="form-label">Excerpt</span>
                  <textarea
                    name="excerpt"
                    rows={3}
                    defaultValue={post?.excerpt ?? ""}
                    className="ft"
                  />
                </label>

                <div className="form-group md:col-span-2">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="form-label">
                      Content <em>*</em>
                    </span>
                    <button
                      type="button"
                      onClick={() => setPreviewMode((value) => !value)}
                      className="btn"
                    >
                      {previewMode ? "Edit Markdown" : "Preview"}
                    </button>
                  </div>

                  {previewMode ? (
                    <>
                      <div
                        className="ft min-h-[320px] overflow-y-auto"
                        dangerouslySetInnerHTML={{ __html: previewHtml || "<p>No content yet.</p>" }}
                      />
                      <textarea name="content" value={content} readOnly className="sr-only" />
                    </>
                  ) : (
                    <textarea
                      name="content"
                      required
                      rows={16}
                      value={content}
                      onChange={(event) => setContent(event.target.value)}
                      className="ft"
                    />
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="card">
            <div className="card-header">
              <div className="card-title">Media</div>
            </div>
            <div className="card-body">
              <label className="upload-zone block">
                <input name="coverImage" type="file" accept="image/*" className="sr-only" />
                <div className="upload-txt">Upload cover image</div>
                <div className="upload-sub">Stored in the posts bucket</div>
              </label>

              {post?.coverImage ? (
                <div className="img-thumbs">
                  <div className="img-thumb overflow-hidden p-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={post.coverImage}
                      alt={post.title}
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
                  <div className="toggle-lbl">Published</div>
                  <div className="toggle-sub">Published date defaults to now when enabled</div>
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
              ? "Create Post"
              : "Save Post"}
        </button>

        <button type="button" onClick={() => router.push("/admin/posts")} className="btn">
          Cancel
        </button>
      </div>
    </form>
  )
}
