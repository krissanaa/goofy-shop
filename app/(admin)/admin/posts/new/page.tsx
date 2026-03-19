import Link from "next/link"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { PostForm } from "@/components/admin/post-form"

export default function AdminNewPostPage() {
  return (
    <div className="space-y-4">
      <Link href="/admin/posts" className="back">
        {"<-"} Back to Posts
      </Link>
      <AdminPageHeader eyebrow="Content" title="Create Post" subtitle="Publish a new editorial story" />
      <PostForm mode="create" />
    </div>
  )
}
