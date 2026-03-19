import Link from "next/link"
import { Download } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { formatAdminDate } from "@/lib/admin"
import { getAdminNotifyEntries } from "@/lib/admin-data"

interface NotifyPageProps {
  searchParams: Promise<{
    drop?: string
  }>
}

function buildPageHref(drop: string) {
  const query = new URLSearchParams()

  if (drop && drop !== "ALL") {
    query.set("drop", drop)
  }

  const queryString = query.toString()
  return `/admin/notify${queryString ? `?${queryString}` : ""}`
}

function buildExportHref(drop: string) {
  const query = new URLSearchParams()

  if (drop && drop !== "ALL") {
    query.set("drop", drop)
  }

  const queryString = query.toString()
  return `/admin/notify/export${queryString ? `?${queryString}` : ""}`
}

export default async function AdminNotifyPage({ searchParams }: NotifyPageProps) {
  const params = await searchParams
  const dropFilter = params.drop?.trim() || "ALL"
  const allEntries = await getAdminNotifyEntries()
  const dropOptions = Array.from(
    new Map(
      allEntries.map((entry) => [
        entry.dropId ?? `unknown:${entry.dropTitle}`,
        {
          id: entry.dropId ?? "",
          title: entry.dropTitle,
        },
      ]),
    ).values(),
  ).sort((left, right) => left.title.localeCompare(right.title))

  const filteredEntries =
    dropFilter === "ALL"
      ? allEntries
      : allEntries.filter((entry) => (entry.dropId ?? "") === dropFilter)

  const groupedEntries = Array.from(
    filteredEntries.reduce(
      (groups, entry) => {
        const key = entry.dropId ?? `unknown:${entry.dropTitle}`
        const existing = groups.get(key)

        if (existing) {
          existing.items.push(entry)
          return groups
        }

        groups.set(key, {
          dropId: entry.dropId,
          dropTitle: entry.dropTitle,
          items: [entry],
        })

        return groups
      },
      new Map<
        string,
        {
          dropId: string | null
          dropTitle: string
          items: typeof filteredEntries
        }
      >(),
    ).values(),
  ).sort((left, right) => left.dropTitle.localeCompare(right.dropTitle))

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Drops"
        title="Notify List"
        subtitle={`${filteredEntries.length} waitlist entries`}
        actions={
          <Link href={buildExportHref(dropFilter)} className="btn btn-primary inline-flex items-center gap-2">
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </Link>
        }
      />

      <div className="filter-bar">
        <form className="flex flex-wrap items-center gap-2">
          <select name="drop" defaultValue={dropFilter} className="fs min-w-[220px]">
            <option value="ALL">All Drops</option>
            {dropOptions.map((drop) => (
              <option key={drop.id || drop.title} value={drop.id || "ALL"}>
                {drop.title}
              </option>
            ))}
          </select>
          <button type="submit" className="btn">
            Filter
          </button>
        </form>
      </div>

      {groupedEntries.length === 0 ? (
        <div className="card">
          <div className="card-body">
            <div className="page-title" style={{ fontSize: "34px" }}>
              No Signups
            </div>
            <div className="page-sub">No notify list entries match this filter.</div>
          </div>
        </div>
      ) : (
        groupedEntries.map((group) => (
          <div key={group.dropId ?? group.dropTitle} className="card">
            <div className="card-header">
              <div className="card-title">{group.dropTitle}</div>
              <div className="card-action">{group.items.length} signups</div>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Drop Name</th>
                  <th>Phone</th>
                  <th>Email</th>
                  <th>Signed Up At</th>
                </tr>
              </thead>
              <tbody>
                {group.items.map((entry) => (
                  <tr key={entry.id}>
                    <td className="t-main">{entry.dropTitle}</td>
                    <td className="t-accent">{entry.phone}</td>
                    <td className="t-muted">{entry.email}</td>
                    <td className="t-muted">{formatAdminDate(entry.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  )
}
