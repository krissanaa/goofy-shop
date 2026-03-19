import { notFound } from "next/navigation"
import Link from "next/link"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { PostForm } from "@/components/admin/post-form"
import { getAdminPost } from "@/lib/admin-data"

interface EditPostPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function AdminEditPostPage({ params }: EditPostPageProps) {
  const { id } = await params
  const post = await getAdminPost(id)

  if (!post) {
    notFound()
  }

  return (
    <div className="space-y-4">
      <Link href="/admin/posts" className="back">
        {"<-"} Back to Posts
      </Link>
      <AdminPageHeader eyebrow="Content" title="Edit Post" subtitle={post.title} />
      <PostForm mode="edit" post={post} />
    </div>
  )
}
