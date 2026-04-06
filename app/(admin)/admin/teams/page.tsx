import Link from "next/link"
import { Plus, Trash2 } from "lucide-react"
import { deleteTeamMemberAction } from "@/app/(admin)/admin/actions"
import { AdminBadge } from "@/components/admin/admin-badge"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { TeamForm } from "@/components/admin/team-form"
import { formatAdminDate } from "@/lib/admin"
import { getAdminTeamMembers } from "@/lib/admin-data"
import { getTeamRosterStorageMode } from "@/lib/team-roster.server"
import { type TeamStatus } from "@/lib/team-roster"

interface TeamsPageProps {
  searchParams: Promise<{
    q?: string
    id?: string
    new?: string
    error?: string
  }>
}

function buildHref(search: string, params: Record<string, string | null | undefined>) {
  const query = new URLSearchParams()
  if (search) query.set("q", search)

  for (const [key, value] of Object.entries(params)) {
    if (value) query.set(key, value)
  }

  const queryString = query.toString()
  return `/admin/teams${queryString ? `?${queryString}` : ""}`
}

function getStatusTone(status: TeamStatus) {
  switch (status) {
    case "PRO":
      return "hot" as const
    case "AM":
      return "processing" as const
    case "FLOW":
    default:
      return "draft" as const
  }
}

function getStatusLabel(status: TeamStatus) {
  return status === "FLOW" ? "Flow" : status === "AM" ? "Am" : "Pro"
}

function formatStorageLabel(storageMode: Awaited<ReturnType<typeof getTeamRosterStorageMode>>) {
  switch (storageMode) {
    case "table":
      return "team_members table"
    case "settings":
      return "settings key-value store"
    case "unsupported":
    default:
      return "fallback defaults only"
  }
}

export default async function AdminTeamsPage({ searchParams }: TeamsPageProps) {
  const params = await searchParams
  const search = params.q?.trim().toLowerCase() ?? ""
  const [allMembers, storageMode] = await Promise.all([
    getAdminTeamMembers(),
    getTeamRosterStorageMode(),
  ])

  const members = !search
    ? allMembers
    : allMembers.filter((member) =>
        [member.name, member.status, member.image, member.video]
          .join(" ")
          .toLowerCase()
          .includes(search),
      )

  const selectedMember = params.id
    ? allMembers.find((member) => member.id === params.id) ?? null
    : null
  const creating = params.new === "1"

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Content"
        title="Teams"
        subtitle={`${allMembers.length} roster entries // ${formatStorageLabel(storageMode)}`}
        actions={
          <Link
            href={buildHref(search, { new: "1", id: null })}
            className="btn btn-primary inline-flex items-center justify-center gap-2"
          >
            <Plus className="h-3.5 w-3.5" />
            New Rider
          </Link>
        }
      />

      {storageMode === "unsupported" ? (
        <div className="alert alert-warning">
          <span>!</span>
          <span>
            Team CMS storage is not configured. The public page is using fallback defaults until a
            `team_members` table or key-value `settings` backend is available.
          </span>
        </div>
      ) : null}

      {params.error ? (
        <div className="alert alert-warning">
          <span>!</span>
          <span>{params.error}</span>
        </div>
      ) : null}

      <div className="filter-bar">
        <form className="ml-auto">
          <input
            className="search-box"
            type="search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search rider or status..."
          />
        </form>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Preview</th>
              <th>Rider</th>
              <th>Status</th>
              <th>Visibility</th>
              <th>Order</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {members.length === 0 ? (
              <tr>
                <td colSpan={6} className="t-muted">
                  No team members found for this search.
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member.id}>
                  <td>
                    <div className="img-thumb overflow-hidden p-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={member.image}
                        alt={member.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </td>
                  <td>
                    <div className="t-main">{member.name}</div>
                    <div className="t-muted">{member.video}</div>
                    <div className="t-muted">{formatAdminDate(member.createdAt)}</div>
                  </td>
                  <td>
                    <AdminBadge tone={getStatusTone(member.status)}>
                      {getStatusLabel(member.status)}
                    </AdminBadge>
                  </td>
                  <td>
                    <AdminBadge tone={member.published ? "active" : "draft"}>
                      {member.published ? "Published" : "Draft"}
                    </AdminBadge>
                  </td>
                  <td className="t-muted">{member.sortOrder}</td>
                  <td>
                    <div className="flex items-center gap-[10px]">
                      <Link
                        href={buildHref(search, { id: member.id, new: null })}
                        className="t-link"
                      >
                        Edit
                      </Link>
                      <form action={deleteTeamMemberAction}>
                        <input type="hidden" name="id" value={member.id} />
                        <button type="submit" className="t-danger inline-flex items-center gap-1">
                          <Trash2 className="h-3.5 w-3.5" />
                          Del
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {creating || selectedMember ? (
        <section className="card">
          <div className="card-header">
            <div className="card-title">{selectedMember ? "Edit Rider" : "Create Rider"}</div>
            <Link href={buildHref(search, { id: null, new: null })} className="card-action">
              Close
            </Link>
          </div>
          <div className="card-body">
            <TeamForm
              key={selectedMember?.id ?? "new"}
              mode={selectedMember ? "edit" : "create"}
              member={selectedMember ?? undefined}
            />
          </div>
        </section>
      ) : null}
    </div>
  )
}
