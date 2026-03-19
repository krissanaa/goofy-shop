import { AdminBadge } from "@/components/admin/admin-badge"
import { approveReview, deleteReview } from "@/lib/actions/reviewActions"
import { formatReviewDate, type ProductReview } from "@/lib/reviews"

interface ProductReviewsPanelProps {
  productId: string
  productSlug: string
  reviews: ProductReview[]
}

function ReviewStars({ rating }: { rating: number }) {
  return (
    <div className="text-[18px] text-[var(--gold)]">
      {Array.from({ length: 5 }, (_, index) => (
        <span key={index} className={index < rating ? "text-[var(--gold)]" : "text-[var(--text3)]"}>
          {index < rating ? "★" : "☆"}
        </span>
      ))}
    </div>
  )
}

function ReviewCard({
  review,
  productId,
  productSlug,
}: {
  review: ProductReview
  productId: string
  productSlug: string
}) {
  return (
    <article className="card">
      <div className="card-body">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <ReviewStars rating={review.rating} />
            <p className="page-sub mt-3">
              {review.reviewerName} / {formatReviewDate(review.createdAt)}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!review.approved ? (
              <form action={approveReview.bind(null, review.id, productId, productSlug)}>
                <button type="submit" className="btn">
                  Approve
                </button>
              </form>
            ) : (
              <AdminBadge tone="active">Approved</AdminBadge>
            )}

            <form action={deleteReview.bind(null, review.id, productId, productSlug)}>
              <button type="submit" className="btn border-[var(--danger)] text-[var(--danger)]">
                Delete
              </button>
            </form>
          </div>
        </div>

        {review.comment ? (
          <p className="mt-4 text-[10px] leading-[1.8] text-[var(--text2)]">
            {review.comment}
          </p>
        ) : null}
      </div>
    </article>
  )
}

export function ProductReviewsPanel({
  productId,
  productSlug,
  reviews,
}: ProductReviewsPanelProps) {
  const pendingReviews = reviews.filter((review) => !review.approved)
  const approvedReviews = reviews.filter((review) => review.approved)

  return (
    <section className="card">
      <div className="card-header">
        <div>
          <div className="page-eyebrow">Reviews</div>
          <div className="page-title text-[34px]">Product Reviews</div>
        </div>
        <div className="page-sub">
          {pendingReviews.length} pending / {approvedReviews.length} approved
        </div>
      </div>

      <div className="card-body">
        {reviews.length === 0 ? (
          <p className="page-sub">No reviews submitted for this product yet.</p>
        ) : (
          <div className="grid gap-6 xl:grid-cols-2">
            <div className="space-y-4">
              <div className="card-title">Pending</div>
              {pendingReviews.length > 0 ? (
                pendingReviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    productId={productId}
                    productSlug={productSlug}
                  />
                ))
              ) : (
                <p className="page-sub">No pending reviews.</p>
              )}
            </div>

            <div className="space-y-4">
              <div className="card-title">Approved</div>
              {approvedReviews.length > 0 ? (
                approvedReviews.map((review) => (
                  <ReviewCard
                    key={review.id}
                    review={review}
                    productId={productId}
                    productSlug={productSlug}
                  />
                ))
              ) : (
                <p className="page-sub">No approved reviews yet.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
