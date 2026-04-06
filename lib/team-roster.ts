export const TEAM_STATUS_OPTIONS = ["PRO", "AM", "FLOW"] as const

export type TeamStatus = (typeof TEAM_STATUS_OPTIONS)[number]

export interface TeamRosterMember {
  id: string
  name: string
  status: TeamStatus
  image: string
  video: string
  published: boolean
  sortOrder: number
  createdAt: string | null
}

type GenericRow = Record<string, unknown>

function normalizeString(value: unknown): string | null {
  if (typeof value === "string") {
    const normalized = value.trim()
    return normalized.length > 0 ? normalized : null
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value)
  }

  return null
}

function normalizeNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

function normalizeBoolean(value: unknown): boolean {
  if (typeof value === "boolean") {
    return value
  }

  if (typeof value === "number") {
    return value > 0
  }

  if (typeof value === "string") {
    return ["true", "1", "yes", "active", "published"].includes(value.toLowerCase())
  }

  return false
}

function pickString(row: GenericRow, keys: string[]): string | null {
  for (const key of keys) {
    const value = normalizeString(row[key])
    if (value) {
      return value
    }
  }

  return null
}

function pickNumber(row: GenericRow, keys: string[]): number | null {
  for (const key of keys) {
    const value = normalizeNumber(row[key])
    if (value !== null) {
      return value
    }
  }

  return null
}

function slugifyTeamValue(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function normalizeStatus(value: unknown): TeamStatus {
  const normalized = normalizeString(value)?.toUpperCase()

  if (normalized && TEAM_STATUS_OPTIONS.includes(normalized as TeamStatus)) {
    return normalized as TeamStatus
  }

  return "FLOW"
}

export const DEFAULT_TEAM_ROSTER: TeamRosterMember[] = [
  {
    id: "xaiyasith",
    name: "XAIYASITH",
    status: "PRO",
    image: "/images/hero-1.jpg",
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    published: true,
    sortOrder: 1,
    createdAt: "2026-04-02T00:00:00.000Z",
  },
  {
    id: "bounpheng",
    name: "BOUNPHENG",
    status: "FLOW",
    image: "/images/hero-2.jpg",
    video: "https://www.w3schools.com/html/movie.mp4",
    published: true,
    sortOrder: 2,
    createdAt: "2026-04-02T00:00:00.000Z",
  },
  {
    id: "kevin",
    name: "KEVIN",
    status: "AM",
    image: "/images/drop-preview.jpg",
    video: "https://www.w3schools.com/html/mov_bbb.mp4",
    published: true,
    sortOrder: 3,
    createdAt: "2026-04-02T00:00:00.000Z",
  },
  {
    id: "anolith",
    name: "ANOLITH",
    status: "PRO",
    image: "/placeholder-user.jpg",
    video: "https://www.w3schools.com/html/movie.mp4",
    published: true,
    sortOrder: 4,
    createdAt: "2026-04-02T00:00:00.000Z",
  },
]

export function cloneDefaultTeamRoster(): TeamRosterMember[] {
  return DEFAULT_TEAM_ROSTER.map((member) => ({ ...member }))
}

export function normalizeTeamRosterMember(
  row: GenericRow,
  index: number,
): TeamRosterMember {
  const name = pickString(row, ["name", "title"]) ?? `Rider ${index + 1}`
  const publishedValue = row.published ?? row.active ?? row.is_active

  return {
    id:
      pickString(row, ["id"]) ??
      `${slugifyTeamValue(name) || "team-member"}-${index + 1}`,
    name,
    status: normalizeStatus(row.status),
    image:
      pickString(row, ["image", "image_url", "thumbnail", "photo"]) ??
      "/placeholder-user.jpg",
    video: pickString(row, ["video", "video_url", "youtube_url", "url"]) ?? "",
    published:
      publishedValue === undefined ? true : normalizeBoolean(publishedValue),
    sortOrder: pickNumber(row, ["sort_order", "sortOrder", "order", "position"]) ?? index + 1,
    createdAt: pickString(row, ["created_at", "createdAt", "updated_at"]),
  }
}

export function sortTeamRosterMembers(
  members: TeamRosterMember[],
): TeamRosterMember[] {
  return [...members].sort((left, right) => {
    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder
    }

    return left.name.localeCompare(right.name)
  })
}
