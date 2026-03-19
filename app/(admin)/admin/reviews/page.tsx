import Link from "next/link"
import { AdminBadge } from "@/components/admin/admin-badge"
import { AdminPageHeader } from "@/components/admin/admin-page-header"
import {
  approveAllPendingReviews,
  approveReview,
  deleteAllPendingReviews,
  deleteReview,
} from "@/lib/actions/reviewActions"
import { formatReviewDate } from "@/lib/reviews"
import { getAdminReviews } from "@/lib/admin-data"

interface ReviewsPageProps {
  searchParams: Promise<{
    q?: string
    state?: string
  }>
}

const REVIEW_TABS = [
  { value: "PENDING", label: "Pending Approval" },
  { value: "APPROVED", label: "Approved" },
  { value: "ALL", label: "All" },
] as const

function buildHref(search: string, state: string) {
  const query = new URLSearchParams()
  if (search) query.set("q", search)
  if (state !== "ALL") query.set("state", state)
  const queryString = query.toString()
  return `/admin/reviews${queryString ? `?${queryString}` : ""}`
}

export default async function AdminReviewsPage({ searchParams }: ReviewsPageProps) {
  const params = await searchParams
  const search = params.q?.trim().toLowerCase() ?? ""
  const state = (params.state ?? "ALL").toUpperCase()
  const allReviews = await getAdminReviews()
  const searched = !search
    ? allReviews
    : allReviews.filter((review) =>
        [review.productName, review.reviewerName, review.comment]
          .join(" ")
          .toLowerCase()
          .includes(search),
      )
  const reviews = searched.filter((review) => {
    if (state === "PENDING") return !review.approved
    if (state === "APPROVED") return review.approved
    return true
  })
  const pendingCount = allReviews.filter((review) => !review.approved).length
  const averageRating =
    allReviews.length > 0
      ? (
          allReviews.reduce((sum, review) => sum + review.rating, 0) / allReviews.length
        ).toFixed(1)
      : "0.0"

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Content"
        title="Reviews"
        subtitle={`${allReviews.length} submitted reviews`}
      />

      <div
        className="stats-grid"
        style={{ gridTemplateColumns: "repeat(3, minmax(0, 1fr))" }}
      >
        <div className="stat-card c-gold">
          <div className="stat-label">Total Reviews</div>
          <div className="stat-value">{allReviews.length}</div>
        </div>
        <div className="stat-card c-success">
          <div className="stat-label">Average Rating</div>
          <div className="stat-value">{averageRating}</div>
        </div>
        <div className="stat-card c-warning">
          <div className="stat-label">Pending Count</div>
          <div className="stat-value">{pendingCount}</div>
        </div>
      </div>

      <div className="filter-bar">
        {REVIEW_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={buildHref(search, tab.value)}
            className={`ftab ${state === tab.value ? "active" : ""}`}
          >
            {tab.label}
          </Link>
        ))}

        {pendingCount > 0 ? (
          <>
            <form action={approveAllPendingReviews}>
              <button type="submit" className="btn">
                Approve All Pending
              </button>
            </form>

            <form action={deleteAllPendingReviews}>
              <button type="submit" className="btn" style={{ color: "var(--danger)", borderColor: "var(--danger)" }}>
                Delete All Pending
              </button>
            </form>
          </>
        ) : null}

        <form className="ml-auto">
          {state !== "ALL" ? <input type="hidden" name="state" value={state} /> : null}
          <input
            className="search-box"
            type="search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search product or reviewer..."
          />
        </form>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Reviewer</th>
              <th>Rating</th>
              <th>Comment</th>
              <th>Date</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {reviews.length === 0 ? (
              <tr>
                <td colSpan={6} className="t-muted">
                  No reviews found for this filter.
                </td>
              </tr>
            ) : (
              reviews.map((review) => (
                <tr key={review.id}>
                  <td>
                    <div className="t-main">{review.productName}</div>
                    <div className="t-muted">{review.approved ? "Approved" : "Pending"}</div>
                  </td>
                  <td className="t-muted">{review.reviewerName}</td>
                  <td>
                    <div className="t-accent">{"★".repeat(review.rating)}</div>
                    <div className="t-muted">{review.rating}/5</div>
                  </td>
                  <td className="t-muted">{review.comment || "No comment"}</td>
                  <td className="t-muted">{formatReviewDate(review.createdAt)}</td>
                  <td>
                    <div className="flex items-center gap-[10px]">
                      {!review.approved ? (
                        <form
                          action={approveReview.bind(
                            null,
                            review.id,
                            review.productId,
                            review.productSlug,
                          )}
                        >
                          <button type="submit" className="t-link">
                            Approve
                          </button>
                        </form>
                      ) : (
                        <AdminBadge tone="active">Approved</AdminBadge>
                      )}
                      <form
                        action={deleteReview.bind(
                          null,
                          review.id,
                          review.productId,
                          review.productSlug,
                        )}
                      >
                        <button type="submit" className="t-danger">
                          Delete
                        </button>
                      </form>
                      <Link href={`/shop/${review.productSlug}`} className="t-link">
                        View Product
                      </Link>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
