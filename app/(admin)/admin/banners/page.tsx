import Link from "next/link"
import { Plus } from "lucide-react"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { BannersTable } from "@/components/admin/banners-table"
import { BannerForm } from "@/components/admin/banner-form"
import { filterAdminBanners } from "@/lib/admin-content"
import { getAdminBanners } from "@/lib/admin-data"

interface AdminBannersPageProps {
  searchParams: Promise<{
    q?: string
    id?: string
    new?: string
    state?: string
  }>
}

const BANNER_TABS = [
  { value: "ALL", label: "All" },
  { value: "LIVE", label: "Live" },
  { value: "OFF", label: "Off" },
] as const

function buildHref(
  search: string,
  state: string,
  params: Record<string, string | null | undefined>,
) {
  const query = new URLSearchParams()

  if (search) {
    query.set("q", search)
  }

  if (state && state !== "ALL") {
    query.set("state", state)
  }

  for (const [key, value] of Object.entries(params)) {
    if (value) {
      query.set(key, value)
    }
  }

  const queryString = query.toString()
  return `/admin/banners${queryString ? `?${queryString}` : ""}`
}

export default async function AdminBannersPage({
  searchParams,
}: AdminBannersPageProps) {
  const params = await searchParams
  const search = params.q?.trim() ?? ""
  const state = (params.state ?? "ALL").toUpperCase()
  const allBanners = await getAdminBanners()
  const searchedBanners = filterAdminBanners(allBanners, search)
  const banners = searchedBanners.filter((banner) => {
    if (state === "LIVE") return banner.active
    if (state === "OFF") return !banner.active
    return true
  })

  const selectedFromParams = params.id
    ? allBanners.find((banner) => banner.id === params.id) ?? null
    : null
  const creating = params.new === "1"
  const selectedBanner = creating ? null : selectedFromParams

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Content"
        title="Hero Banners"
        subtitle="Homepage slideshow"
        actions={
          <Link
            href={buildHref(search, state, { new: "1", id: null })}
            className="btn btn-primary inline-flex items-center justify-center gap-2"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Banner
          </Link>
        }
      />

      <div className="filter-bar">
        {BANNER_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={buildHref(search, tab.value, { id: null, new: null })}
            className={`ftab ${state === tab.value ? "active" : ""}`}
          >
            {tab.label}
          </Link>
        ))}

        <form className="ml-auto">
          {state !== "ALL" ? <input type="hidden" name="state" value={state} /> : null}
          <input
            className="search-box"
            type="search"
            name="q"
            defaultValue={search}
            placeholder="Search title, tag, or CTA..."
          />
        </form>
      </div>

      <div className="card">
        <BannersTable banners={banners} allBanners={allBanners} search={search} state={state} />
      </div>

      {creating || selectedBanner ? (
        <section className="card">
          <div className="card-header">
            <div className="card-title">{selectedBanner ? "Edit Banner" : "Create Banner"}</div>
            <Link
              href={buildHref(search, state, { id: null, new: null })}
              className="card-action"
            >
              Close
            </Link>
          </div>
          <div className="card-body">
            <BannerForm
              key={selectedBanner?.id ?? "new"}
              mode={selectedBanner ? "edit" : "create"}
              banner={selectedBanner ?? undefined}
              nextOrder={(allBanners[allBanners.length - 1]?.order ?? 0) + 1}
            />
          </div>
        </section>
      ) : null}
    </div>
  )
}
