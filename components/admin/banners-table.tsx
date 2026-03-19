"use client"

import Link from "next/link"
import { useEffect, useMemo, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import { GripVertical, Trash2 } from "lucide-react"
import toast from "react-hot-toast"
import {
  deleteBannerAction,
  reorderBannersAction,
  toggleBannerActiveAction,
} from "@/app/(admin)/admin/actions"
import { AdminBadge } from "@/components/admin/admin-badge"
import { type AdminBanner } from "@/lib/admin-content"

interface BannersTableProps {
  banners: AdminBanner[]
  allBanners: AdminBanner[]
  search: string
  state: string
}

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

function moveItem(ids: string[], draggedId: string, targetId: string) {
  const fromIndex = ids.indexOf(draggedId)
  const toIndex = ids.indexOf(targetId)

  if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) {
    return ids
  }

  const next = [...ids]
  const [moved] = next.splice(fromIndex, 1)
  next.splice(toIndex, 0, moved)
  return next
}

function mergeVisibleOrder(allIds: string[], visibleIds: string[], nextVisibleIds: string[]) {
  const visibleSet = new Set(visibleIds)
  let visibleIndex = 0

  return allIds.map((id) => {
    if (!visibleSet.has(id)) {
      return id
    }

    const replacement = nextVisibleIds[visibleIndex]
    visibleIndex += 1
    return replacement
  })
}

export function BannersTable({
  banners,
  allBanners,
  search,
  state,
}: BannersTableProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [draggedId, setDraggedId] = useState<string | null>(null)
  const [visibleOrder, setVisibleOrder] = useState<string[]>(banners.map((banner) => banner.id))
  const [orderMap, setOrderMap] = useState<Record<string, number>>(
    Object.fromEntries(allBanners.map((banner) => [banner.id, banner.order])),
  )
  const [activeMap, setActiveMap] = useState<Record<string, boolean>>(
    Object.fromEntries(allBanners.map((banner) => [banner.id, banner.active])),
  )

  useEffect(() => {
    setVisibleOrder(banners.map((banner) => banner.id))
  }, [banners])

  useEffect(() => {
    setOrderMap(Object.fromEntries(allBanners.map((banner) => [banner.id, banner.order])))
    setActiveMap(Object.fromEntries(allBanners.map((banner) => [banner.id, banner.active])))
  }, [allBanners])

  const bannersById = useMemo(
    () => new Map(allBanners.map((banner) => [banner.id, banner])),
    [allBanners],
  )

  const orderedBanners = visibleOrder
    .map((id) => bannersById.get(id))
    .filter((banner): banner is AdminBanner => Boolean(banner))

  const handleDrop = (targetId: string) => {
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null)
      return
    }

    const previousOrder = visibleOrder
    const nextVisibleOrder = moveItem(visibleOrder, draggedId, targetId)
    const fullOrder = mergeVisibleOrder(
      allBanners.map((banner) => banner.id),
      previousOrder,
      nextVisibleOrder,
    )
    const nextOrderMap = Object.fromEntries(fullOrder.map((id, index) => [id, index + 1]))

    setVisibleOrder(nextVisibleOrder)
    setOrderMap(nextOrderMap)
    setDraggedId(null)

    startTransition(async () => {
      const result = await reorderBannersAction(fullOrder)

      if (result.status === "error") {
        setVisibleOrder(previousOrder)
        setOrderMap(Object.fromEntries(allBanners.map((banner) => [banner.id, banner.order])))
        toast.error(result.message)
        return
      }

      toast.success(result.message)
      router.refresh()
    })
  }

  const handleToggleActive = (bannerId: string) => {
    const previousValue = activeMap[bannerId] ?? false
    const nextValue = !previousValue

    setActiveMap((current) => ({ ...current, [bannerId]: nextValue }))

    startTransition(async () => {
      const result = await toggleBannerActiveAction(bannerId, nextValue)

      if (result.status === "error") {
        setActiveMap((current) => ({ ...current, [bannerId]: previousValue }))
        toast.error(result.message)
        return
      }

      toast.success(result.message)
      router.refresh()
    })
  }

  if (orderedBanners.length === 0) {
    return (
      <div className="card-body">
        <div className="page-title" style={{ fontSize: "34px" }}>
          No Banners
        </div>
        <div className="page-sub">Try another filter or search query.</div>
      </div>
    )
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Order</th>
          <th>Tag</th>
          <th>Title</th>
          <th>CTA Button</th>
          <th>CTA Link</th>
          <th>Image</th>
          <th>Active</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {orderedBanners.map((banner) => {
          const isActive = activeMap[banner.id] ?? banner.active

          return (
            <tr
              key={banner.id}
              draggable
              onDragStart={() => setDraggedId(banner.id)}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDrop(banner.id)}
            >
              <td>
                <div className="flex items-center gap-[10px]">
                  <GripVertical className="h-4 w-4 text-[var(--text3)]" />
                  <span className="t-muted">
                    {String(orderMap[banner.id] ?? banner.order).padStart(2, "0")}
                  </span>
                </div>
              </td>
              <td>
                {banner.tag ? (
                  <AdminBadge tone="new">{banner.tag}</AdminBadge>
                ) : (
                  <span className="t-muted">-</span>
                )}
              </td>
              <td className="t-main">{banner.title}</td>
              <td className="t-muted">{banner.ctaText || "-"}</td>
              <td className="t-muted">{banner.ctaLink || "/"}</td>
              <td>
                {banner.imageUrl ? (
                  <div className="img-thumb overflow-hidden p-0">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={banner.imageUrl}
                      alt={banner.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="img-thumb text-[8px] text-[var(--text3)]">No Img</div>
                )}
              </td>
              <td>
                <div className="flex items-center gap-[12px]">
                  <button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleToggleActive(banner.id)}
                    className={`sw ${isActive ? "on" : ""}`}
                    aria-pressed={isActive}
                  />
                  <AdminBadge tone={isActive ? "active" : "draft"}>
                    {isActive ? "LIVE" : "OFF"}
                  </AdminBadge>
                </div>
              </td>
              <td>
                <div className="flex items-center gap-[10px]">
                  <Link
                    href={buildHref(search, state, { id: banner.id, new: null })}
                    className="t-link"
                  >
                    Edit
                  </Link>
                  <form action={deleteBannerAction}>
                    <input type="hidden" name="id" value={banner.id} />
                    <button type="submit" className="t-danger inline-flex items-center gap-1">
                      <Trash2 className="h-3.5 w-3.5" />
                      Del
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
