import { z } from "zod"
import { getActiveDropEvent, getDropEventBySlug } from "@/lib/api"
import { supabase } from "@/lib/supabase"
import { router, procedure } from "../root"

export const dropEventRouter = router({
  getAll: procedure.query(async () => {
    const { data } = await supabase
      .from("drop_events")
      .select("*")
      .order("drop_date", { ascending: false })

    return data ?? []
  }),

  getActive: procedure.query(async () => {
    const activeDrop = await getActiveDropEvent()
    return activeDrop ? [activeDrop] : []
  }),

  getUpcoming: procedure.query(async () => {
    const now = new Date().toISOString()
    const { data } = await supabase
      .from("drop_events")
      .select("*")
      .gt("drop_date", now)
      .order("drop_date", { ascending: true })

    return data ?? []
  }),

  getBySlug: procedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => getDropEventBySlug(input.slug)),

  getLatestActive: procedure.query(async () => getActiveDropEvent()),
})
