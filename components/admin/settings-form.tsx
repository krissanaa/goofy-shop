"use client"

import { useActionState, useEffect, useRef, useState } from "react"
import toast from "react-hot-toast"
import {
  inviteAdminUserAction,
  revokeAdminUserAction,
  saveSettingsAction,
} from "@/app/(admin)/admin/actions"
import { formatAdminDate, INITIAL_ACTION_STATE, type AdminActionState } from "@/lib/admin"
import { type AdminAuthUsersData } from "@/lib/admin-data"
import { type AdminSettingsData } from "@/lib/admin-content"

interface SettingsFormProps {
  settings: AdminSettingsData
  adminUsers: AdminAuthUsersData
  currentUserEmail: string | null
}

type SettingsTab =
  | "SHOP"
  | "PAYMENT"
  | "SHIPPING"
  | "SOCIAL"
  | "NOTIFICATIONS"
  | "ADMIN_USERS"

const SETTINGS_TABS: Array<{ value: SettingsTab; label: string }> = [
  { value: "SHOP", label: "Shop" },
  { value: "PAYMENT", label: "Payment" },
  { value: "SHIPPING", label: "Shipping" },
  { value: "SOCIAL", label: "Social" },
  { value: "NOTIFICATIONS", label: "Notifications" },
  { value: "ADMIN_USERS", label: "Admin Users" },
]

const SUPPORTED_CITY_OPTIONS = [
  "Vientiane",
  "Luang Prabang",
  "Vang Vieng",
  "Pakse",
  "Savannakhet",
  "Thakhek",
  "Xieng Khouang",
  "Boten",
] as const

function useActionToast(state: AdminActionState) {
  const lastMessageRef = useRef<string | undefined>(undefined)

  useEffect(() => {
    if (!state.message || state.message === lastMessageRef.current) {
      return
    }

    lastMessageRef.current = state.message

    if (state.status === "error") {
      toast.error(state.message)
      return
    }

    toast.success(state.message)
  }, [state])
}

export function SettingsForm({
  settings,
  adminUsers,
  currentUserEmail,
}: SettingsFormProps) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("SHOP")
  const [saveState, saveAction, isSaving] = useActionState(
    saveSettingsAction,
    INITIAL_ACTION_STATE,
  )
  const [inviteState, inviteAction, isInviting] = useActionState(
    inviteAdminUserAction,
    INITIAL_ACTION_STATE,
  )
  const [revokeState, revokeAction, isRevoking] = useActionState(
    revokeAdminUserAction,
    INITIAL_ACTION_STATE,
  )

  useActionToast(saveState)
  useActionToast(inviteState)
  useActionToast(revokeState)

  return (
    <div className="space-y-4">
      <div className="filter-bar">
        {SETTINGS_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={`ftab ${activeTab === tab.value ? "active" : ""}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "ADMIN_USERS" ? (
        <div className="space-y-4">
          <div className="card">
            <div className="card-header">
              <div className="card-title">Invite Admin</div>
            </div>
            <div
              className="card-body"
              style={{ display: "flex", flexDirection: "column", gap: 12 }}
            >
              {!adminUsers.available ? (
                <div className="alert alert-warning" style={{ marginBottom: 0 }}>
                  {adminUsers.errorMessage ?? "Admin user management is unavailable."}
                </div>
              ) : null}

              <form action={inviteAction} className="form-grid" style={{ marginBottom: 0 }}>
                <label className="form-group" style={{ gridColumn: "1 / -1" }}>
                  <div className="form-label">Admin Email</div>
                  <input
                    name="email"
                    type="email"
                    className="fi"
                    placeholder="admin@goofy.la"
                    disabled={!adminUsers.available || isInviting}
                  />
                </label>
                <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-start" }}>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={!adminUsers.available || isInviting}
                  >
                    {isInviting ? "Sending..." : "Send Invite"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="card">
            <div className="card-header">
              <div className="card-title">Admin Users</div>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Created</th>
                  <th>Last Sign In</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {adminUsers.users.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="t-muted">
                      {adminUsers.available
                        ? "No admin users found."
                        : "Service role key is required to list admin users."}
                    </td>
                  </tr>
                ) : (
                  adminUsers.users.map((user) => {
                    const isCurrentUser =
                      currentUserEmail !== null &&
                      user.email.toLowerCase() === currentUserEmail.toLowerCase()

                    return (
                      <tr key={user.id}>
                        <td>
                          <div className="t-main">{user.email}</div>
                          {isCurrentUser ? <div className="t-muted">Current session</div> : null}
                        </td>
                        <td className="t-muted">{user.role}</td>
                        <td className="t-muted">{formatAdminDate(user.createdAt)}</td>
                        <td className="t-muted">{formatAdminDate(user.lastSignInAt)}</td>
                        <td>
                          <form action={revokeAction}>
                            <input type="hidden" name="userId" value={user.id} />
                            <input type="hidden" name="email" value={user.email} />
                            <button
                              type="submit"
                              className="t-danger"
                              disabled={!adminUsers.available || isRevoking || isCurrentUser}
                              style={{
                                background: "transparent",
                                border: "none",
                                padding: 0,
                                opacity: !adminUsers.available || isRevoking || isCurrentUser ? 0.5 : 1,
                              }}
                            >
                              Revoke
                            </button>
                          </form>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <form id="settings-form" action={saveAction} className="space-y-4">
          <input type="hidden" name="existingLogoUrl" value={settings.logoUrl} />
          <input type="hidden" name="existingPaymentQrUrl" value={settings.paymentQrUrl} />

          {activeTab === "SHOP" ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Shop</div>
                </div>
                <div className="card-body">
                  <div className="form-grid">
                    <label className="form-group" style={{ gridColumn: "1 / -1" }}>
                      <div className="form-label">Shop Name</div>
                      <input name="shopName" required defaultValue={settings.shopName} className="fi" />
                    </label>
                    <label className="form-group" style={{ gridColumn: "1 / -1" }}>
                      <div className="form-label">Tagline</div>
                      <input name="shopTagline" defaultValue={settings.shopTagline} className="fi" />
                    </label>
                    <label className="form-group" style={{ gridColumn: "1 / -1" }}>
                      <div className="form-label">Address</div>
                      <input name="shopAddress" defaultValue={settings.shopAddress} className="fi" />
                    </label>
                    <label className="form-group">
                      <div className="form-label">Phone</div>
                      <input name="shopPhone" defaultValue={settings.shopPhone} className="fi" />
                    </label>
                    <label className="form-group">
                      <div className="form-label">Email</div>
                      <input
                        name="shopEmail"
                        type="email"
                        defaultValue={settings.shopEmail}
                        className="fi"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <div className="card-title">Logo Upload</div>
                </div>
                <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <label className="upload-zone">
                    <div className="upload-txt">Upload Logo</div>
                    <div className="upload-sub">PNG · SVG · WEBP</div>
                    <input name="logoFile" type="file" accept="image/*" style={{ display: "none" }} />
                  </label>
                  {settings.logoUrl ? (
                    <img
                      src={settings.logoUrl}
                      alt="Current shop logo"
                      style={{ width: "100%", border: "1px solid var(--border)", background: "var(--surface2)" }}
                    />
                  ) : (
                    <div className="slip-box" style={{ height: 120 }}>
                      No logo uploaded
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "PAYMENT" ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 16 }}>
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Payment Details</div>
                </div>
                <div className="card-body">
                  <div className="form-grid">
                    <label className="form-group">
                      <div className="form-label">Bank Name</div>
                      <input name="bankName" defaultValue={settings.bankName} className="fi" />
                    </label>
                    <label className="form-group">
                      <div className="form-label">Account Number</div>
                      <input
                        name="bankAccountNumber"
                        defaultValue={settings.bankAccountNumber}
                        className="fi"
                      />
                    </label>
                    <label className="form-group" style={{ gridColumn: "1 / -1" }}>
                      <div className="form-label">Account Name</div>
                      <input
                        name="bankAccountName"
                        defaultValue={settings.bankAccountName}
                        className="fi"
                      />
                    </label>
                    <label className="form-group" style={{ gridColumn: "1 / -1" }}>
                      <div className="form-label">Payment Instructions</div>
                      <textarea
                        name="paymentInstructions"
                        rows={6}
                        defaultValue={settings.paymentInstructions}
                        className="ft"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <div className="card-title">QR Code Upload</div>
                </div>
                <div className="card-body" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <label className="upload-zone">
                    <div className="upload-txt">Upload QR Code</div>
                    <div className="upload-sub">PNG · JPG · WEBP</div>
                    <input
                      name="paymentQrFile"
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                    />
                  </label>
                  {settings.paymentQrUrl ? (
                    <img
                      src={settings.paymentQrUrl}
                      alt="Current payment QR"
                      style={{ width: "100%", border: "1px solid var(--border)", background: "var(--surface2)" }}
                    />
                  ) : (
                    <div className="slip-box" style={{ height: 180 }}>
                      No QR uploaded
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "SHIPPING" ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Shipping Rules</div>
                </div>
                <div className="card-body">
                  <div className="form-grid">
                    <label className="form-group">
                      <div className="form-label">Default Shipping Cost (LAK)</div>
                      <input
                        name="shippingFee"
                        type="number"
                        min="0"
                        defaultValue={settings.shippingFee}
                        className="fi"
                      />
                    </label>
                    <label className="form-group">
                      <div className="form-label">Free Shipping Threshold (LAK)</div>
                      <input
                        name="freeShippingThreshold"
                        type="number"
                        min="0"
                        defaultValue={settings.freeShippingThreshold}
                        className="fi"
                      />
                    </label>
                    <label className="form-group" style={{ gridColumn: "1 / -1" }}>
                      <div className="form-label">Estimated Delivery Days</div>
                      <input
                        name="estimatedDeliveryDays"
                        defaultValue={settings.estimatedDeliveryDays}
                        className="fi"
                        placeholder="2-4 business days"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <div className="card-title">Supported Cities</div>
                </div>
                <div className="card-body" style={{ display: "grid", gap: 10 }}>
                  {SUPPORTED_CITY_OPTIONS.map((city) => (
                    <label
                      key={city}
                      className="toggle-row"
                      style={{ paddingTop: 10, paddingBottom: 10 }}
                    >
                      <div>
                        <div className="toggle-lbl">{city}</div>
                      </div>
                      <input
                        type="checkbox"
                        name="supportedCities"
                        value={city}
                        defaultChecked={settings.supportedCities.includes(city)}
                        style={{ width: 18, height: 18 }}
                      />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "SOCIAL" ? (
            <div className="card">
              <div className="card-header">
                <div className="card-title">Social Links</div>
              </div>
              <div className="card-body">
                <div className="form-grid">
                  <label className="form-group">
                    <div className="form-label">Instagram</div>
                    <input name="instagram" defaultValue={settings.instagram} className="fi" />
                  </label>
                  <label className="form-group">
                    <div className="form-label">Facebook</div>
                    <input name="facebook" defaultValue={settings.facebook} className="fi" />
                  </label>
                  <label className="form-group">
                    <div className="form-label">TikTok</div>
                    <input name="tiktok" defaultValue={settings.tiktok} className="fi" />
                  </label>
                  <label className="form-group">
                    <div className="form-label">YouTube</div>
                    <input name="youtube" defaultValue={settings.youtube} className="fi" />
                  </label>
                  <label className="form-group" style={{ gridColumn: "1 / -1" }}>
                    <div className="form-label">LINE ID</div>
                    <input name="lineId" defaultValue={settings.lineId} className="fi" />
                  </label>
                </div>
              </div>
            </div>
          ) : null}

          {activeTab === "NOTIFICATIONS" ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="card">
                <div className="card-header">
                  <div className="card-title">Alerts</div>
                </div>
                <div className="card-body">
                  <div className="form-grid">
                    <label className="form-group" style={{ gridColumn: "1 / -1" }}>
                      <div className="form-label">Admin Email for Order Alerts</div>
                      <input
                        name="notificationEmail"
                        type="email"
                        defaultValue={settings.notificationEmail}
                        className="fi"
                      />
                    </label>
                    <label className="form-group" style={{ gridColumn: "1 / -1" }}>
                      <div className="form-label">LINE Notify Token</div>
                      <input
                        name="lineNotifyToken"
                        defaultValue={settings.lineNotifyToken}
                        className="fi"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <div className="card">
                <div className="card-header">
                  <div className="card-title">Low Stock Rules</div>
                </div>
                <div className="card-body">
                  <div className="form-grid">
                    <label className="form-group">
                      <div className="form-label">Default Low Stock Threshold</div>
                      <input
                        name="defaultLowStockThreshold"
                        type="number"
                        min="0"
                        defaultValue={settings.defaultLowStockThreshold}
                        className="fi"
                      />
                    </label>
                    <label className="form-group">
                      <div className="form-label">Notify When Stock Below</div>
                      <input
                        name="notifyStockBelow"
                        type="number"
                        min="0"
                        defaultValue={settings.notifyStockBelow}
                        className="fi"
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={isSaving}
              className="btn btn-primary disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
