"use client"

import { useMemo, useState, useTransition } from "react"
import { submitReview } from "@/lib/actions/reviewActions"
import { formatReviewDate, type ProductReview } from "@/lib/reviews"

interface ProductReviewsProps {
  productId: string
  initialReviews: ProductReview[]
}

function renderStars(rating: number) {
  return Array.from({ length: 5 }, (_, index) => (
    <span
      key={`${rating}-${index}`}
      className={index < rating ? "text-[var(--gold)]" : "text-white/16"}
    >
      ★
    </span>
  ))
}

export function ProductReviews({
  productId,
  initialReviews,
}: ProductReviewsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [visibleCount, setVisibleCount] = useState(5)
  const [reviewerName, setReviewerName] = useState("")
  const [comment, setComment] = useState("")
  const [rating, setRating] = useState(5)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const summary = useMemo(() => {
    const total = initialReviews.length
    const average =
      total > 0
        ? initialReviews.reduce((accumulator, review) => accumulator + review.rating, 0) / total
        : 0

    const distribution = [5, 4, 3, 2, 1].map((score) => {
      const count = initialReviews.filter((review) => review.rating === score).length
      return {
        score,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
      }
    })

    return {
      total,
      average,
      distribution,
    }
  }, [initialReviews])

  const handleSubmit = () => {
    if (!reviewerName.trim()) {
      setError("Name is required.")
      return
    }

    setError(null)
    setMessage(null)

    startTransition(async () => {
      try {
        await submitReview({
          product_id: productId,
          reviewer_name: reviewerName,
          rating,
          comment,
        })

        setReviewerName("")
        setComment("")
        setRating(5)
        setIsOpen(false)
        setMessage("Review submitted for approval.")
      } catch (submitError) {
        setError(
          submitError instanceof Error ? submitError.message : "Unable to submit review.",
        )
      }
    })
  }

  return (
    <section className="mt-16 border-t border-[var(--bordw)] pt-8">
      <div className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <div className="space-y-6">
          <div>
            <p className="goofy-mono text-[8px] uppercase tracking-[0.22em] text-[var(--gold)]">
              Reviews
            </p>
            <h2 className="goofy-display mt-3 text-[clamp(28px,3vw,44px)] leading-none text-[var(--white)]">
              What The Streets Say
            </h2>
          </div>

          <div className="border border-[var(--bordw)] bg-white/[0.02] p-5">
            <div className="goofy-display text-[56px] leading-none text-[var(--white)]">
              {summary.total > 0 ? summary.average.toFixed(1) : "0.0"}
            </div>
            <div className="mt-2 flex items-center gap-1 text-[20px]">
              {renderStars(Math.round(summary.average))}
            </div>
            <p className="goofy-mono mt-2 text-[8px] uppercase tracking-[0.18em] text-white/35">
              {summary.total} approved reviews
            </p>

            <div className="mt-5 space-y-2">
              {summary.distribution.map((row) => (
                <div key={row.score} className="grid grid-cols-[34px_1fr_30px] items-center gap-3">
                  <span className="goofy-mono text-[8px] uppercase tracking-[0.14em] text-white/45">
                    {row.score}★
                  </span>
                  <div className="h-1.5 bg-white/8">
                    <div
                      className="h-full bg-[var(--gold)]"
                      style={{ width: `${row.percentage}%` }}
                    />
                  </div>
                  <span className="goofy-mono text-[8px] uppercase tracking-[0.14em] text-white/35">
                    {row.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="goofy-mono text-[8px] uppercase tracking-[0.18em] text-white/35">
              Approved reviews only
            </p>
            <button
              type="button"
              onClick={() => setIsOpen((current) => !current)}
              className="goofy-mono text-[8px] uppercase tracking-[0.18em] text-[var(--white)] transition-colors hover:text-[var(--gold)]"
            >
              Write a Review
            </button>
          </div>

          {message ? (
            <div className="border border-emerald-400/20 bg-emerald-500/8 p-4">
              <p className="goofy-mono text-[8px] uppercase tracking-[0.14em] text-emerald-300">
                {message}
              </p>
            </div>
          ) : null}

          {isOpen ? (
            <div className="border border-[var(--bordw)] bg-white/[0.02] p-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="goofy-mono text-[8px] uppercase tracking-[0.18em] text-white/35">
                    Your Name
                  </label>
                  <input
                    type="text"
                    value={reviewerName}
                    onChange={(event) => setReviewerName(event.target.value)}
                    className="mt-2 h-11 w-full border border-[var(--bordw)] bg-transparent px-3 goofy-mono text-[10px] tracking-[0.08em] text-[var(--white)] outline-none transition-colors focus:border-[var(--gold)]"
                  />
                </div>

                <div>
                  <label className="goofy-mono text-[8px] uppercase tracking-[0.18em] text-white/35">
                    Rating
                  </label>
                  <div className="mt-2 flex items-center gap-2 text-[24px]">
                    {Array.from({ length: 5 }, (_, index) => {
                      const nextRating = index + 1
                      return (
                        <button
                          key={nextRating}
                          type="button"
                          onClick={() => setRating(nextRating)}
                          className={nextRating <= rating ? "text-[var(--gold)]" : "text-white/16"}
                        >
                          ★
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="mt-4">
                <label className="goofy-mono text-[8px] uppercase tracking-[0.18em] text-white/35">
                  Comment
                </label>
                <textarea
                  rows={4}
                  value={comment}
                  onChange={(event) => setComment(event.target.value)}
                  className="mt-2 w-full border border-[var(--bordw)] bg-transparent px-3 py-3 goofy-mono text-[10px] leading-[1.7] tracking-[0.08em] text-[var(--white)] outline-none transition-colors focus:border-[var(--gold)]"
                />
              </div>

              {error ? (
                <p className="mt-3 goofy-mono text-[8px] uppercase tracking-[0.14em] text-rose-300">
                  {error}
                </p>
              ) : null}

              <button
                type="button"
                disabled={isPending}
                onClick={handleSubmit}
                className="mt-4 inline-flex items-center justify-center bg-[var(--gold)] px-5 py-3 goofy-mono text-[9px] uppercase tracking-[0.18em] text-[var(--black)] transition-colors hover:bg-[var(--white)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isPending ? "Submitting..." : "Submit Review"}
              </button>
            </div>
          ) : null}

          {initialReviews.length === 0 ? (
            <div className="border border-[var(--bordw)] bg-white/[0.02] p-5">
              <p className="goofy-mono text-[9px] uppercase tracking-[0.18em] text-white/35">
                No reviews yet. Be the first to leave one.
              </p>
            </div>
          ) : (
            <>
              {initialReviews.slice(0, visibleCount).map((review) => (
                <article
                  key={review.id}
                  className="border border-[var(--bordw)] bg-white/[0.02] p-5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1 text-[18px]">
                        {renderStars(review.rating)}
                      </div>
                      <p className="goofy-mono mt-2 text-[8px] uppercase tracking-[0.18em] text-white/32">
                        {review.reviewerName} / {formatReviewDate(review.createdAt)}
                      </p>
                    </div>
                  </div>

                  {review.comment ? (
                    <p className="mt-4 goofy-mono text-[10px] leading-[1.8] text-white/70">
                      {review.comment}
                    </p>
                  ) : null}
                </article>
              ))}

              {visibleCount < initialReviews.length ? (
                <button
                  type="button"
                  onClick={() => setVisibleCount((current) => current + 5)}
                  className="goofy-mono text-[8px] uppercase tracking-[0.18em] text-[var(--white)] transition-colors hover:text-[var(--gold)]"
                >
                  Load More
                </button>
              ) : null}
            </>
          )}
        </div>
      </div>
    </section>
  )
}
