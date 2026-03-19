import Link from "next/link"
import { Plus, Trash2 } from "lucide-react"
import { deleteVideoAction } from "@/app/(admin)/admin/actions"
import { AdminBadge } from "@/components/admin/admin-badge"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { VideoForm } from "@/components/admin/video-form"
import { formatAdminDate } from "@/lib/admin"
import { getAdminVideos } from "@/lib/admin-data"

interface VideosPageProps {
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
  return `/admin/videos${queryString ? `?${queryString}` : ""}`
}

function formatCategoryLabel(category: string) {
  if (!category) {
    return "Community"
  }

  return category.charAt(0).toUpperCase() + category.slice(1)
}

export default async function AdminVideosPage({ searchParams }: VideosPageProps) {
  const params = await searchParams
  const search = params.q?.trim().toLowerCase() ?? ""
  const allVideos = await getAdminVideos()
  const videos = !search
    ? allVideos
    : allVideos.filter((video) =>
        [video.title, video.category, video.slug].join(" ").toLowerCase().includes(search),
      )
  const selectedVideo = params.id ? allVideos.find((video) => video.id === params.id) ?? null : null
  const creating = params.new === "1"

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Content"
        title="Videos"
        subtitle={`${allVideos.length} video entries`}
        actions={
          <Link
            href={buildHref(search, { new: "1", id: null })}
            className="btn btn-primary inline-flex items-center justify-center gap-2"
          >
            <Plus className="h-3.5 w-3.5" />
            New Video
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
            placeholder="Search video title..."
          />
        </form>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Thumbnail</th>
              <th>Title</th>
              <th>Category</th>
              <th>Published</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {videos.length === 0 ? (
              <tr>
                <td colSpan={5} className="t-muted">
                  No videos found for this search.
                </td>
              </tr>
            ) : (
              videos.map((video) => (
                <tr key={video.id}>
                  <td>
                    {video.thumbnailUrl ? (
                      <div className="img-thumb overflow-hidden p-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={video.thumbnailUrl}
                          alt={video.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="img-thumb text-[8px] text-[var(--text3)]">No Img</div>
                    )}
                  </td>
                  <td>
                    <div className="t-main">{video.title}</div>
                    <div className="t-muted">{video.slug}</div>
                  </td>
                  <td className="t-muted">{formatCategoryLabel(video.category)}</td>
                  <td>
                    <AdminBadge tone={video.published ? "active" : "draft"}>
                      {video.published ? "Published" : "Draft"}
                    </AdminBadge>
                    <div className="t-muted">{formatAdminDate(video.createdAt)}</div>
                  </td>
                  <td>
                    <div className="flex items-center gap-[10px]">
                      <Link href={buildHref(search, { id: video.id, new: null })} className="t-link">
                        Edit
                      </Link>
                      <form action={deleteVideoAction}>
                        <input type="hidden" name="id" value={video.id} />
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

      {creating || selectedVideo ? (
        <section className="card">
          <div className="card-header">
            <div className="card-title">{selectedVideo ? "Edit Video" : "Create Video"}</div>
            <Link href={buildHref(search, { id: null, new: null })} className="card-action">
              Close
            </Link>
          </div>
          <div className="card-body">
            <VideoForm
              key={selectedVideo?.id ?? "new"}
              mode={selectedVideo ? "edit" : "create"}
              video={selectedVideo ?? undefined}
            />
          </div>
        </section>
      ) : null}
    </div>
  )
}
