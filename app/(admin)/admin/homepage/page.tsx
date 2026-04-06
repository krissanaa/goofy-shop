import { AdminPageHeader } from "@/components/admin/admin-page-header"
import { HomepageContentForm } from "@/components/admin/homepage-content-form"
import {
  getHomepageContent,
  getHomepageContentStorageMode,
  getHomepageLiveSourceSummary,
} from "@/lib/homepage-content.server"

function getStorageLabel(storageMode: Awaited<ReturnType<typeof getHomepageContentStorageMode>>) {
  return storageMode === "settings" ? "settings key-value store" : "fallback defaults only"
}

export default async function AdminHomepagePage() {
  const [content, storageMode, sourceSummary] = await Promise.all([
    getHomepageContent(),
    getHomepageContentStorageMode(),
    getHomepageLiveSourceSummary(),
  ])

  const heroSource =
    sourceSummary.activeBannerCount > 0
      ? `Live banners (${sourceSummary.activeBannerCount} active)`
      : "Homepage fallback slides"
  const storySource =
    sourceSummary.publishedPostCount >= 3
      ? `Live posts (${sourceSummary.publishedPostCount} published)`
      : `Mixed: ${sourceSummary.publishedPostCount} live post${sourceSummary.publishedPostCount === 1 ? "" : "s"} + fallback stories`
  const parkSource =
    sourceSummary.skateparkCount >= 4
      ? `Live skateparks (${sourceSummary.skateparkCount} rows)`
      : `Mixed: ${sourceSummary.skateparkCount} live spot${sourceSummary.skateparkCount === 1 ? "" : "s"} + fallback spots`

  return (
    <div className="space-y-4">
      <AdminPageHeader
        eyebrow="Content"
        title="Homepage"
        subtitle={`Edit homepage fallback content // ${getStorageLabel(storageMode)}`}
        actions={
          <button
            form="homepage-content-form"
            type="submit"
            className="btn btn-primary"
            disabled={storageMode === "unsupported"}
          >
            Save Changes
          </button>
        }
      />

      {storageMode === "unsupported" ? (
        <div className="alert alert-warning">
          <span>!</span>
          <span>
            Homepage CMS storage is not configured. You can review the current fallback values
            here, but saving requires key-value settings storage.
          </span>
        </div>
      ) : null}

      <section className="card">
        <div className="card-header">
          <div className="card-title">Homepage Source Summary</div>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>Section</th>
              <th>Current Source</th>
              <th>Behavior</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="t-main">Top Marquee</td>
              <td className="t-muted">Homepage CMS</td>
              <td className="t-muted">Always uses the text saved on this page.</td>
            </tr>
            <tr>
              <td className="t-main">Hero Slider</td>
              <td className="t-muted">{heroSource}</td>
              <td className="t-muted">
                Active banner rows from /admin/banners override the fallback slides here.
              </td>
            </tr>
            <tr>
              <td className="t-main">Magazine Stories</td>
              <td className="t-muted">{storySource}</td>
              <td className="t-muted">
                Published posts fill the section first, then fallback stories fill any empty slots.
              </td>
            </tr>
            <tr>
              <td className="t-main">Find Your Spot</td>
              <td className="t-muted">{parkSource}</td>
              <td className="t-muted">
                Skatepark rows fill the section first, then fallback spots fill any empty slots.
              </td>
            </tr>
            <tr>
              <td className="t-main">Featured Video Controls</td>
              <td className="t-muted">Mixed</td>
              <td className="t-muted">
                Video title/description come from live videos ({sourceSummary.videoCount} row
                {sourceSummary.videoCount === 1 ? "" : "s"}). URL and CTA controls come from this
                page.
              </td>
            </tr>
            <tr>
              <td className="t-main">Products / Categories</td>
              <td className="t-muted">Live products ({sourceSummary.activeProductCount} active)</td>
              <td className="t-muted">
                Product sections are DB-driven and are not edited from this page.
              </td>
            </tr>
            <tr>
              <td className="t-main">Ready To Skate</td>
              <td className="t-muted">Homepage CMS</td>
              <td className="t-muted">Always uses the background image and CTA saved on this page.</td>
            </tr>
          </tbody>
        </table>
      </section>

      <HomepageContentForm content={content} canSave={storageMode === "settings"} />
    </div>
  )
}
