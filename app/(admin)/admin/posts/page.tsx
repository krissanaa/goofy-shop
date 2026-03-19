import Link from "next/link"
import { Plus, Trash2 } from "lucide-react"
import { deletePostAction } from "@/app/(admin)/admin/actions"
import { AdminBadge } from "@/components/admin/admin-badge"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { formatAdminDate } from "@/lib/admin"
import { getAdminPosts } from "@/lib/admin-data"

interface AdminPostsPageProps {
  searchParams: Promise<{
    q?: string
    category?: string
  }>
}

const POST_TABS = [
  { value: "ALL", label: "All" },
  { value: "NEWS", label: "News" },
  { value: "EVENT", label: "Event" },
  { value: "SPOT", label: "Spot" },
  { value: "INTERVIEW", label: "Interview" },
  { value: "TRICK", label: "Trick" },
] as const

function buildHref(search: string, category: string) {
  const query = new URLSearchParams()

  if (search) {
    query.set("q", search)
  }

  if (category && category !== "ALL") {
    query.set("category", category)
  }

  const queryString = query.toString()
  return `/admin/posts${queryString ? `?${queryString}` : ""}`
}

function getCategoryTone(category: string): "news" | "spot" | "interview" | "draft" {
  if (category === "NEWS" || category === "EVENT" || category === "TRICK") {
    return "news"
  }

  if (category === "SPOT") {
    return "spot"
  }

  if (category === "INTERVIEW") {
    return "interview"
  }

  return "draft"
}

export default async function AdminPostsPage({ searchParams }: AdminPostsPageProps) {
  const params = await searchParams
  const search = params.q?.trim().toLowerCase() ?? ""
  const category = (params.category ?? "ALL").toUpperCase()
  const allPosts = await getAdminPosts()
  const searchedPosts = !search
    ? allPosts
    : allPosts.filter((post) => post.title.toLowerCase().includes(search))
  const posts =
    category === "ALL"
      ? searchedPosts
      : searchedPosts.filter((post) => post.category === category)

  return (
    <div>
      <AdminPageHeader
        eyebrow="Content"
        title="Posts"
        subtitle={`${allPosts.length} editorial entries`}
        actions={
          <Link
            href="/admin/posts/new"
            className="btn btn-primary inline-flex items-center justify-center gap-2"
          >
            <Plus className="h-3.5 w-3.5" />
            New Post
          </Link>
        }
      />

      <div className="filter-bar">
        {POST_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={buildHref(search, tab.value)}
            className={`ftab ${category === tab.value ? "active" : ""}`}
          >
            {tab.label}
          </Link>
        ))}

        <form className="ml-auto">
          {category !== "ALL" ? <input type="hidden" name="category" value={category} /> : null}
          <input
            className="search-box"
            type="search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search by title..."
          />
        </form>
      </div>

      <div className="card">
        {posts.length === 0 ? (
          <div className="card-body">
            <div className="page-title" style={{ fontSize: "34px" }}>
              No Posts
            </div>
            <div className="page-sub">Start a story or change the title search.</div>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Cover</th>
                <th>Title</th>
                <th>Category</th>
                <th>Status</th>
                <th>Published Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td>
                    <div className="prod-img overflow-hidden p-0">
                      {post.coverImage ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.coverImage}
                          alt={post.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <span className="t-muted">-</span>
                      )}
                    </div>
                  </td>
                  <td className="t-main">{post.title}</td>
                  <td>
                    <AdminBadge tone={getCategoryTone(post.category)}>{post.category}</AdminBadge>
                  </td>
                  <td>
                    <AdminBadge tone={post.published ? "active" : "draft"}>
                      {post.published ? "Published" : "Draft"}
                    </AdminBadge>
                  </td>
                  <td className="t-muted">{formatAdminDate(post.publishedAt || post.createdAt)}</td>
                  <td>
                    <div className="flex items-center gap-[10px]">
                      <Link href={`/admin/posts/${post.id}`} className="t-link">
                        Edit
                      </Link>
                      <form action={deletePostAction}>
                        <input type="hidden" name="id" value={post.id} />
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
