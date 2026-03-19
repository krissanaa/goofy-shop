import Link from "next/link"
import { Plus, Trash2 } from "lucide-react"
import { deleteParkAction } from "@/app/(admin)/admin/actions"
import { AdminBadge } from "@/components/admin/admin-badge"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { ParkForm } from "@/components/admin/park-form"
import { formatAdminDate } from "@/lib/admin"
import { getAdminParks } from "@/lib/admin-data"

interface ParksPageProps {
  searchParams: Promise<{
    q?: string
    id?: string
    new?: string
  }>
}

function buildHref(search: string, params: Record<string, string | null | undefined>) {
  const query = new URLSearchParams()
  if (search) query.set("q", search)
  for (const [key, value] of Object.entries(params)) {
    if (value) query.set(key, value)
  }
  const queryString = query.toString()
  return `/admin/parks${queryString ? `?${queryString}` : ""}`
}

function formatDifficultyLabel(difficulty: string) {
  if (!difficulty) {
    return "Beginner"
  }

  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
}

export default async function AdminParksPage({ searchParams }: ParksPageProps) {
  const params = await searchParams
  const search = params.q?.trim().toLowerCase() ?? ""
  const allParks = await getAdminParks()
  const parks = !search
    ? allParks
    : allParks.filter((park) =>
        [park.name, park.city, park.location, park.difficulty, park.slug]
          .join(" ")
          .toLowerCase()
          .includes(search),
      )
  const selectedPark = params.id ? allParks.find((park) => park.id === params.id) ?? null : null
  const creating = params.new === "1"

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Content"
        title="Parks"
        subtitle={`${allParks.length} skate parks`}
        actions={
          <Link
            href={buildHref(search, { new: "1", id: null })}
            className="btn btn-primary inline-flex items-center justify-center gap-2"
          >
            <Plus className="h-3.5 w-3.5" />
            New Park
          </Link>
        }
      />

      <div className="filter-bar">
        <form className="ml-auto">
          <input
            className="search-box"
            type="search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search name, city, or slug..."
          />
        </form>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>City</th>
              <th>Difficulty</th>
              <th>Photos</th>
              <th>Active</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {parks.length === 0 ? (
              <tr>
                <td colSpan={6} className="t-muted">
                  No parks found for this search.
                </td>
              </tr>
            ) : (
              parks.map((park) => (
                <tr key={park.id}>
                  <td>
                    <div className="t-main">{park.name}</div>
                    <div className="t-muted">{park.slug}</div>
                    <div className="t-muted">
                      {park.location || formatAdminDate(park.createdAt)}
                    </div>
                  </td>
                  <td className="t-muted">{park.city}</td>
                  <td>{formatDifficultyLabel(park.difficulty)}</td>
                  <td className="t-muted">
                    {park.photos.length} photo{park.photos.length === 1 ? "" : "s"}
                  </td>
                  <td>
                    <AdminBadge tone={park.active ? "active" : "draft"}>
                      {park.active ? "Active" : "Inactive"}
                    </AdminBadge>
                  </td>
                  <td>
                    <div className="flex items-center gap-[10px]">
                      <Link href={buildHref(search, { id: park.id, new: null })} className="t-link">
                        Edit
                      </Link>
                      <form action={deleteParkAction}>
                        <input type="hidden" name="id" value={park.id} />
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

      {creating || selectedPark ? (
        <section className="card">
          <div className="card-header">
            <div className="card-title">{selectedPark ? "Edit Park" : "Create Park"}</div>
            <Link href={buildHref(search, { id: null, new: null })} className="card-action">
              Close
            </Link>
          </div>
          <div className="card-body">
            <ParkForm
              key={selectedPark?.id ?? "new"}
              mode={selectedPark ? "edit" : "create"}
              park={selectedPark ?? undefined}
            />
          </div>
        </section>
      ) : null}
    </div>
  )
}
