import Link from "next/link"
import { Plus, Trash2 } from "lucide-react"
import { deleteDropAction } from "@/app/(admin)/admin/actions"
import { AdminBadge } from "@/components/admin/admin-badge"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { filterAdminDrops } from "@/lib/admin-content"
import { formatAdminDate } from "@/lib/admin"
import { getAdminDrops } from "@/lib/admin-data"

interface AdminDropsPageProps {
  searchParams: Promise<{
    q?: string
  }>
}

function buildHref(search: string) {
  const query = new URLSearchParams()

  if (search) {
    query.set("q", search)
  }

  const queryString = query.toString()
  return `/admin/drops${queryString ? `?${queryString}` : ""}`
}

export default async function AdminDropsPage({
  searchParams,
}: AdminDropsPageProps) {
  const params = await searchParams
  const search = params.q?.trim() ?? ""
  const allDrops = await getAdminDrops()
  const drops = filterAdminDrops(allDrops, search)

  return (
    <div>
      <AdminPageHeader
        eyebrow="Ecommerce"
        title="Drops"
        subtitle={`${allDrops.length} total drops`}
        actions={
          <Link href="/admin/drops/new" className="btn btn-primary inline-flex items-center justify-center gap-2">
            <Plus className="h-3.5 w-3.5" />
            New Drop
          </Link>
        }
      />

      <div className="filter-bar">
        <form className="ml-auto">
          <input
            className="search-box"
            type="search"
            name="q"
            defaultValue={search}
            placeholder="Search drops..."
          />
        </form>
      </div>

      <div className="card">
        {drops.length === 0 ? (
          <div className="card-body">
            <div className="page-title" style={{ fontSize: "34px" }}>
              No Drops
            </div>
            <div className="page-sub">Create a drop or change the search query.</div>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Drop Date</th>
                <th>Products Count</th>
                <th>Notify Signups</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {drops.map((drop) => (
                <tr key={drop.id}>
                  <td className="t-main">{drop.title}</td>
                  <td>
                    <AdminBadge
                      tone={
                        drop.status === "LIVE"
                          ? "active"
                          : drop.status === "UPCOMING"
                            ? "pending"
                            : "draft"
                      }
                    >
                      {drop.status === "LIVE"
                        ? "Active"
                        : drop.status === "UPCOMING"
                          ? "Upcoming"
                          : "Ended"}
                    </AdminBadge>
                  </td>
                  <td className="t-muted">{formatAdminDate(drop.dropDate)}</td>
                  <td className="t-muted">{drop.productsCount}</td>
                  <td className="t-muted">{drop.notifySignups}</td>
                  <td>
                    <div className={`sw ${drop.isFeatured ? "on" : ""}`} />
                  </td>
                  <td>
                    <div className="flex items-center gap-[10px]">
                      <Link href={`/admin/drops/${drop.id}`} className="t-link">
                        Edit
                      </Link>
                      <form action={deleteDropAction}>
                        <input type="hidden" name="id" value={drop.id} />
                        <input type="hidden" name="slug" value={drop.slug} />
                        <button type="submit" className="t-danger inline-flex items-center gap-1">
                          <Trash2 className="h-3.5 w-3.5" />
                          Del
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
