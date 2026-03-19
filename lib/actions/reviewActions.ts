"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

function normalizeString(value?: string) {
  const normalized = value?.trim()
  return normalized ? normalized : ""
}

export async function submitReview(data: {
  product_id: string
  reviewer_name: string
  rating: number
  comment?: string
}) {
  const productId = normalizeString(data.product_id)
  const reviewerName = normalizeString(data.reviewer_name)
  const rating = Math.min(5, Math.max(1, Number(data.rating) || 0))
  const comment = normalizeString(data.comment)

  if (!productId || !reviewerName || rating < 1) {
    throw new Error("Name and rating are required")
  }

  const supabase = await createClient()
  const { error } = await supabase.from("reviews").insert({
    product_id: productId,
    reviewer_name: reviewerName,
    rating,
    comment: comment || null,
    approved: false,
  })

  if (error) {
    throw new Error(error.message)
  }

  return {
    ok: true,
    message: "Review submitted for approval.",
  }
}

export async function approveReview(
  reviewId: string,
  productId: string,
  productSlug: string,
) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("reviews")
    .update({ approved: true })
    .eq("id", reviewId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/admin/products/${productId}`)
  revalidatePath("/admin/reviews")
  revalidatePath(`/shop/${productSlug}`)
}

export async function deleteReview(
  reviewId: string,
  productId: string,
  productSlug: string,
) {
  const supabase = await createClient()
  const { error } = await supabase.from("reviews").delete().eq("id", reviewId)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath(`/admin/products/${productId}`)
  revalidatePath("/admin/reviews")
  revalidatePath(`/shop/${productSlug}`)
}

async function revalidateReviewTargets(productIds: string[]) {
  const uniqueProductIds = Array.from(new Set(productIds.filter(Boolean)))

  revalidatePath("/admin/reviews")

  if (uniqueProductIds.length === 0) {
    return
  }

  const supabase = await createClient()
  const { data: products } = await supabase
    .from("products")
    .select("id, slug")
    .in("id", uniqueProductIds)

  for (const productId of uniqueProductIds) {
    revalidatePath(`/admin/products/${productId}`)
  }

  for (const product of products ?? []) {
    if (typeof product.slug === "string" && product.slug.trim()) {
      revalidatePath(`/shop/${product.slug}`)
    }
  }
}

export async function approveAllPendingReviews() {
  const supabase = await createClient()
  const { data: pendingReviews, error: selectError } = await supabase
    .from("reviews")
    .select("id, product_id")
    .eq("approved", false)

  if (selectError) {
    throw new Error(selectError.message)
  }

  if (!pendingReviews || pendingReviews.length === 0) {
    revalidatePath("/admin/reviews")
    return
  }

  const { error } = await supabase
    .from("reviews")
    .update({ approved: true })
    .eq("approved", false)

  if (error) {
    throw new Error(error.message)
  }

  await revalidateReviewTargets(
    pendingReviews.map((review) =>
      typeof review.product_id === "string" ? review.product_id : "",
    ),
  )
}

export async function deleteAllPendingReviews() {
  const supabase = await createClient()
  const { data: pendingReviews, error: selectError } = await supabase
    .from("reviews")
    .select("id, product_id")
    .eq("approved", false)

  if (selectError) {
    throw new Error(selectError.message)
  }

  if (!pendingReviews || pendingReviews.length === 0) {
    revalidatePath("/admin/reviews")
    return
  }

  const { error } = await supabase.from("reviews").delete().eq("approved", false)

  if (error) {
    throw new Error(error.message)
  }

  await revalidateReviewTargets(
    pendingReviews.map((review) =>
      typeof review.product_id === "string" ? review.product_id : "",
    ),
  )
}
