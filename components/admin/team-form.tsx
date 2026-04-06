"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { saveTeamMemberAction } from "@/app/(admin)/admin/actions"
import { formatAdminDate, INITIAL_ACTION_STATE } from "@/lib/admin"
import {
  TEAM_STATUS_OPTIONS,
  type TeamRosterMember,
} from "@/lib/team-roster"

interface TeamFormProps {
  mode: "create" | "edit"
  member?: TeamRosterMember
}

const TEAM_STATUS_LABELS: Record<(typeof TEAM_STATUS_OPTIONS)[number], string> = {
  PRO: "Pro",
  AM: "Am",
  FLOW: "Flow",
}

export function TeamForm({ mode, member }: TeamFormProps) {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(
    saveTeamMemberAction,
    INITIAL_ACTION_STATE,
  )
  const [published, setPublished] = useState(member?.published ?? true)
  const [image, setImage] = useState(member?.image ?? "")
  const [video, setVideo] = useState(member?.video ?? "")
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
    router.push(state.redirectTo || "/admin/teams")
  }, [router, state])

  return (
    <form action={formAction} className="space-y-4">
      {member ? <input type="hidden" name="id" value={member.id} /> : null}
      <input
        type="checkbox"
        name="published"
        checked={published}
        readOnly
        className="sr-only"
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_268px]">
        <div className="flex-col">
          <section className="card">
            <div className="card-header">
              <div className="card-title">Rider Info</div>
            </div>
            <div className="card-body">
              <div className="form-grid max-md:grid-cols-1">
                <label className="form-group">
                  <span className="form-label">
                    Name <em>*</em>
                  </span>
                  <input
                    name="name"
                    required
                    defaultValue={member?.name ?? ""}
                    className="fi"
                  />
                </label>

                <label className="form-group">
                  <span className="form-label">
                    Status <em>*</em>
                  </span>
                  <select
                    name="status"
                    defaultValue={member?.status ?? "FLOW"}
                    className="fs"
                  >
                    {TEAM_STATUS_OPTIONS.map((status) => (
                      <option key={status} value={status}>
                        {TEAM_STATUS_LABELS[status]}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="form-group md:col-span-2">
                  <span className="form-label">
                    Image URL <em>*</em>
                  </span>
                  <input
                    name="image"
                    required
                    value={image}
                    onChange={(event) => setImage(event.target.value)}
                    placeholder="/images/hero-1.jpg"
                    className="fi"
                  />
                </label>

                <label className="form-group md:col-span-2">
                  <span className="form-label">
                    Video URL <em>*</em>
                  </span>
                  <input
                    name="video"
                    required
                    value={video}
                    onChange={(event) => setVideo(event.target.value)}
                    placeholder="https://..."
                    className="fi"
                  />
                </label>

                <label className="form-group">
                  <span className="form-label">Sort Order</span>
                  <input
                    name="sortOrder"
                    type="number"
                    min={0}
                    defaultValue={member?.sortOrder ?? 0}
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
              <div className="card-title">Preview</div>
            </div>
            <div className="card-body space-y-4">
              <div className="relative aspect-square overflow-hidden border border-[var(--border)] bg-[var(--admin-bg)]">
                {image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={image}
                    alt={member?.name ?? "Rider preview"}
                    className="h-full w-full object-cover grayscale"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-[0.18em] text-[var(--text3)]">
                    No image
                  </div>
                )}
              </div>
              <div className="space-y-2 text-[10px] text-[var(--text3)]">
                <div>Video: {video || "No video URL"}</div>
                {member?.createdAt ? (
                  <div>Created: {formatAdminDate(member.createdAt)}</div>
                ) : null}
              </div>
            </div>
          </section>

          <section className="card">
            <div className="card-header">
              <div className="card-title">Visibility</div>
            </div>
            <div className="card-body">
              <div className="toggle-row border-b-0 py-0">
                <div>
                  <div className="toggle-lbl">Published</div>
                  <div className="toggle-sub">Visible on the public teams page</div>
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
              ? "Create Rider"
              : "Save Rider"}
        </button>

        <button type="button" onClick={() => router.push("/admin/teams")} className="btn">
          Cancel
        </button>
      </div>
    </form>
  )
}
