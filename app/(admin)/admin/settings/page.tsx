import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { SettingsForm } from "@/components/admin/settings-form"
import { getAdminAuthUsers, getAdminSettings } from "@/lib/admin-data"
import { createClient } from "@/lib/supabase/server"

export default async function AdminSettingsPage() {
  const supabase = await createClient()
  const [
    settings,
    adminUsers,
    {
      data: { user },
    },
  ] = await Promise.all([
    getAdminSettings(),
    getAdminAuthUsers(),
    supabase.auth.getUser(),
  ])

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="System"
        title="Settings"
        actions={
          <button form="settings-form" type="submit" className="btn btn-primary">
            Save Changes
          </button>
        }
      />
      <SettingsForm
        settings={settings}
        adminUsers={adminUsers}
        currentUserEmail={user?.email ?? null}
      />
    </div>
  )
}
