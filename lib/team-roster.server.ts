import "server-only"

import { createClient } from "@/lib/supabase/server"
import {
  cloneDefaultTeamRoster,
  normalizeTeamRosterMember,
  sortTeamRosterMembers,
  type TeamRosterMember,
  type TeamStatus,
} from "@/lib/team-roster"

type GenericRow = Record<string, unknown>

export type TeamRosterStorageMode = "table" | "settings" | "unsupported"

const TEAM_ROSTER_SETTINGS_KEY = "team_roster"

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function parseSettingsMembers(value: unknown): TeamRosterMember[] {
  if (Array.isArray(value)) {
    return value
      .filter((entry): entry is GenericRow => isRecord(entry))
      .map((entry, index) => normalizeTeamRosterMember(entry, index))
  }

  if (isRecord(value)) {
    const items = Array.isArray(value.items)
      ? value.items
      : Array.isArray(value.members)
        ? value.members
        : []

    return items
      .filter((entry): entry is GenericRow => isRecord(entry))
      .map((entry, index) => normalizeTeamRosterMember(entry, index))
  }

  return []
}

async function getTeamRosterStorageModeWithClient(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<TeamRosterStorageMode> {
  const tableProbe = await supabase.from("team_members").select("id").limit(1)
  if (!tableProbe.error) {
    return "table"
  }

  const settingsProbe = await supabase
    .from("settings")
    .select("key, value")
    .eq("key", TEAM_ROSTER_SETTINGS_KEY)
    .maybeSingle()

  if (!settingsProbe.error) {
    return "settings"
  }

  return "unsupported"
}

async function loadTeamMembersFromTable(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<TeamRosterMember[]> {
  const primary = await supabase
    .from("team_members")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true })

  if (!primary.error) {
    return (primary.data ?? []).map((row, index) =>
      normalizeTeamRosterMember(row as GenericRow, index),
    )
  }

  const fallback = await supabase
    .from("team_members")
    .select("*")
    .order("created_at", { ascending: true })

  if (fallback.error) {
    return []
  }

  return (fallback.data ?? []).map((row, index) =>
    normalizeTeamRosterMember(row as GenericRow, index),
  )
}

async function loadTeamMembersFromSettings(
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<TeamRosterMember[]> {
  const { data, error } = await supabase
    .from("settings")
    .select("value")
    .eq("key", TEAM_ROSTER_SETTINGS_KEY)
    .maybeSingle()

  if (error) {
    return []
  }

  return parseSettingsMembers((data as GenericRow | null)?.value)
}

function buildSettingsPayload(members: TeamRosterMember[]) {
  return {
    items: members.map((member) => ({
      id: member.id,
      name: member.name,
      status: member.status,
      image: member.image,
      video: member.video,
      published: member.published,
      sort_order: member.sortOrder,
      created_at: member.createdAt,
    })),
  }
}

async function persistTeamMembersInSettings(
  supabase: Awaited<ReturnType<typeof createClient>>,
  members: TeamRosterMember[],
): Promise<{ errorMessage?: string }> {
  const payload = buildSettingsPayload(sortTeamRosterMembers(members))
  const timestamp = new Date().toISOString()
  const existing = await supabase
    .from("settings")
    .select("key")
    .eq("key", TEAM_ROSTER_SETTINGS_KEY)
    .maybeSingle()

  if (existing.error) {
    return {
      errorMessage: existing.error.message || "Unable to access team CMS settings.",
    }
  }

  if (existing.data) {
    const { error } = await supabase
      .from("settings")
      .update({
        value: payload,
        updated_at: timestamp,
      })
      .eq("key", TEAM_ROSTER_SETTINGS_KEY)

    return error
      ? { errorMessage: error.message || "Unable to update the team roster." }
      : {}
  }

  const { error } = await supabase.from("settings").insert({
    key: TEAM_ROSTER_SETTINGS_KEY,
    value: payload,
    updated_at: timestamp,
  })

  return error
    ? { errorMessage: error.message || "Unable to create the team roster settings row." }
    : {}
}

export async function getTeamRosterStorageMode(): Promise<TeamRosterStorageMode> {
  const supabase = await createClient()
  return getTeamRosterStorageModeWithClient(supabase)
}

export async function getTeamRoster({
  includeUnpublished = false,
  fallbackToDefaults = true,
}: {
  includeUnpublished?: boolean
  fallbackToDefaults?: boolean
} = {}): Promise<TeamRosterMember[]> {
  const supabase = await createClient()
  const storageMode = await getTeamRosterStorageModeWithClient(supabase)

  let members: TeamRosterMember[] = []

  if (storageMode === "table") {
    members = await loadTeamMembersFromTable(supabase)
  } else if (storageMode === "settings") {
    members = await loadTeamMembersFromSettings(supabase)
  }

  if (members.length === 0 && fallbackToDefaults) {
    members = cloneDefaultTeamRoster()
  }

  const sortedMembers = sortTeamRosterMembers(members)

  return includeUnpublished
    ? sortedMembers
    : sortedMembers.filter((member) => member.published)
}

export async function saveTeamRosterMember(input: {
  id?: string | null
  name: string
  status: TeamStatus
  image: string
  video: string
  published: boolean
  sortOrder: number
}): Promise<{ errorMessage?: string; memberId?: string }> {
  const supabase = await createClient()
  const storageMode = await getTeamRosterStorageModeWithClient(supabase)
  const timestamp = new Date().toISOString()

  if (storageMode === "unsupported") {
    return {
      errorMessage:
        "Team CMS storage is not configured. Add a team_members table or use key-value settings storage.",
    }
  }

  if (storageMode === "table") {
    const payload = {
      name: input.name,
      status: input.status,
      image: input.image,
      video: input.video,
      published: input.published,
      sort_order: input.sortOrder,
      updated_at: timestamp,
    }

    if (input.id) {
      const { error } = await supabase.from("team_members").update(payload).eq("id", input.id)

      return error
        ? { errorMessage: error.message || "Unable to update team member." }
        : { memberId: input.id }
    }

    const { data, error } = await supabase
      .from("team_members")
      .insert({
        ...payload,
        created_at: timestamp,
      })
      .select("id")
      .single()

    return error || !data
      ? { errorMessage: error?.message || "Unable to create team member." }
      : { memberId: String(data.id) }
  }

  const existingMembers = await loadTeamMembersFromSettings(supabase)

  if (input.id) {
    const index = existingMembers.findIndex((member) => member.id === input.id)

    if (index === -1) {
      return {
        errorMessage: "Team member not found.",
      }
    }

    const nextMembers = [...existingMembers]
    nextMembers[index] = {
      ...nextMembers[index],
      name: input.name,
      status: input.status,
      image: input.image,
      video: input.video,
      published: input.published,
      sortOrder: input.sortOrder,
    }

    const saveResult = await persistTeamMembersInSettings(supabase, nextMembers)
    return saveResult.errorMessage
      ? { errorMessage: saveResult.errorMessage }
      : { memberId: input.id }
  }

  const newMemberId = crypto.randomUUID()
  const nextMembers = [
    ...existingMembers,
    {
      id: newMemberId,
      name: input.name,
      status: input.status,
      image: input.image,
      video: input.video,
      published: input.published,
      sortOrder: input.sortOrder,
      createdAt: timestamp,
    },
  ]

  const saveResult = await persistTeamMembersInSettings(supabase, nextMembers)
  return saveResult.errorMessage
    ? { errorMessage: saveResult.errorMessage }
    : { memberId: newMemberId }
}

export async function deleteTeamRosterMember(
  id: string,
): Promise<{ errorMessage?: string }> {
  const supabase = await createClient()
  const storageMode = await getTeamRosterStorageModeWithClient(supabase)

  if (storageMode === "unsupported") {
    return {
      errorMessage:
        "Team CMS storage is not configured. Add a team_members table or use key-value settings storage.",
    }
  }

  if (storageMode === "table") {
    const { error } = await supabase.from("team_members").delete().eq("id", id)

    return error
      ? { errorMessage: error.message || "Unable to delete team member." }
      : {}
  }

  const existingMembers = await loadTeamMembersFromSettings(supabase)
  const nextMembers = existingMembers.filter((member) => member.id !== id)

  if (nextMembers.length === existingMembers.length) {
    return {
      errorMessage: "Team member not found.",
    }
  }

  return persistTeamMembersInSettings(supabase, nextMembers)
}
