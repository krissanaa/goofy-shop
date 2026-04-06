"use client"

import { useActionState, useEffect, useRef } from "react"
import toast from "react-hot-toast"
import { saveHomepageContentAction } from "@/app/(admin)/admin/actions"
import { INITIAL_ACTION_STATE, type AdminActionState } from "@/lib/admin"
import { type HomepageContent } from "@/lib/homepage-content"

interface HomepageContentFormProps {
  content: HomepageContent
  canSave: boolean
}

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

export function HomepageContentForm({ content, canSave }: HomepageContentFormProps) {
  const [state, formAction, isPending] = useActionState(
    saveHomepageContentAction,
    INITIAL_ACTION_STATE,
  )

  useActionToast(state)

  return (
    <form id="homepage-content-form" action={formAction} className="space-y-4">
      <section className="card">
        <div className="card-header">
          <div className="card-title">How This Works</div>
        </div>
        <div className="card-body space-y-2 text-sm text-[var(--text2)]">
          <p>
            Edit the homepage fallback content here. These values are used for sections that still
            have mock/default content in code.
          </p>
          <p>
            Hero banners, posts, parks, videos, and products can still override some of these
            values when live rows exist.
          </p>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <div className="card-title">Top Marquee</div>
        </div>
        <div className="card-body">
          <label className="form-group">
            <span className="form-label">Marquee Text</span>
            <textarea
              name="topMarqueeText"
              rows={3}
              defaultValue={content.topMarqueeText}
              className="ft"
            />
          </label>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <div className="card-title">Hero Fallback Slides</div>
        </div>
        <div className="card-body space-y-4">
          {content.heroSlides.map((slide, index) => (
            <div
              key={slide.id}
              className="rounded-[14px] border border-[var(--border)] bg-[var(--surface2)] p-4"
            >
              <input type="hidden" name={`heroSlides.${index}.id`} value={slide.id} />
              <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text3)]">
                Slide {index + 1}
              </div>

              <div className="form-grid max-md:grid-cols-1">
                <label className="form-group">
                  <span className="form-label">Tag</span>
                  <input
                    name={`heroSlides.${index}.tag`}
                    defaultValue={slide.tag}
                    className="fi"
                  />
                </label>

                <label className="form-group">
                  <span className="form-label">Right Tag</span>
                  <input
                    name={`heroSlides.${index}.rightTag`}
                    defaultValue={slide.rightTag}
                    className="fi"
                  />
                </label>

                <label className="form-group md:col-span-2">
                  <span className="form-label">Left Headline Lines</span>
                  <textarea
                    name={`heroSlides.${index}.leftTitleLines`}
                    rows={4}
                    defaultValue={slide.leftTitleLines.join("\n")}
                    className="ft"
                  />
                </label>

                <label className="form-group md:col-span-2">
                  <span className="form-label">Left Subtitle</span>
                  <input
                    name={`heroSlides.${index}.leftSubtitle`}
                    defaultValue={slide.leftSubtitle}
                    className="fi"
                  />
                </label>

                <label className="form-group md:col-span-2">
                  <span className="form-label">Left Meta</span>
                  <input
                    name={`heroSlides.${index}.leftMeta`}
                    defaultValue={slide.leftMeta}
                    className="fi"
                  />
                </label>

                <label className="form-group">
                  <span className="form-label">Left CTA Label</span>
                  <input
                    name={`heroSlides.${index}.leftCtaLabel`}
                    defaultValue={slide.leftCtaLabel}
                    className="fi"
                  />
                </label>

                <label className="form-group">
                  <span className="form-label">Left CTA Link</span>
                  <input
                    name={`heroSlides.${index}.leftCtaHref`}
                    defaultValue={slide.leftCtaHref}
                    className="fi"
                  />
                </label>

                <label className="form-group md:col-span-2">
                  <span className="form-label">Right Image URL</span>
                  <input
                    name={`heroSlides.${index}.rightImage`}
                    defaultValue={slide.rightImage ?? ""}
                    className="fi"
                  />
                </label>

                <label className="form-group md:col-span-2">
                  <span className="form-label">Right Title</span>
                  <input
                    name={`heroSlides.${index}.rightTitle`}
                    defaultValue={slide.rightTitle}
                    className="fi"
                  />
                </label>

                <label className="form-group">
                  <span className="form-label">Right CTA Label</span>
                  <input
                    name={`heroSlides.${index}.rightCtaLabel`}
                    defaultValue={slide.rightCtaLabel}
                    className="fi"
                  />
                </label>

                <label className="form-group">
                  <span className="form-label">Right CTA Link</span>
                  <input
                    name={`heroSlides.${index}.rightCtaHref`}
                    defaultValue={slide.rightCtaHref}
                    className="fi"
                  />
                </label>

                <label className="form-group md:col-span-2 flex items-center gap-3 pt-7">
                  <input
                    type="checkbox"
                    name={`heroSlides.${index}.rightCtaGold`}
                    defaultChecked={slide.rightCtaGold}
                  />
                  <span className="form-label mb-0">Gold Right CTA</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <div className="card-title">Fallback Stories</div>
        </div>
        <div className="card-body space-y-4">
          {content.fallbackStories.map((story, index) => (
            <div
              key={story.id}
              className="rounded-[14px] border border-[var(--border)] bg-[var(--surface2)] p-4"
            >
              <input type="hidden" name={`fallbackStories.${index}.id`} value={story.id} />
              <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text3)]">
                Story {index + 1}
              </div>

              <div className="form-grid max-md:grid-cols-1">
                <label className="form-group md:col-span-2">
                  <span className="form-label">Title</span>
                  <input
                    name={`fallbackStories.${index}.title`}
                    defaultValue={story.title}
                    className="fi"
                  />
                </label>

                <label className="form-group">
                  <span className="form-label">Date</span>
                  <input
                    name={`fallbackStories.${index}.date`}
                    defaultValue={story.date}
                    className="fi"
                  />
                </label>

                <label className="form-group">
                  <span className="form-label">Tag</span>
                  <input
                    name={`fallbackStories.${index}.tag`}
                    defaultValue={story.tag}
                    className="fi"
                  />
                </label>

                <label className="form-group md:col-span-2">
                  <span className="form-label">Image URL</span>
                  <input
                    name={`fallbackStories.${index}.image`}
                    defaultValue={story.image ?? ""}
                    className="fi"
                  />
                </label>

                <label className="form-group md:col-span-2">
                  <span className="form-label">Link</span>
                  <input
                    name={`fallbackStories.${index}.href`}
                    defaultValue={story.href}
                    className="fi"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <div className="card-title">Fallback Spots</div>
        </div>
        <div className="card-body space-y-4">
          {content.fallbackSpots.map((spot, index) => (
            <div
              key={spot.id}
              className="rounded-[14px] border border-[var(--border)] bg-[var(--surface2)] p-4"
            >
              <input type="hidden" name={`fallbackSpots.${index}.id`} value={spot.id} />
              <div className="mb-4 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--text3)]">
                Spot {index + 1}
              </div>

              <div className="form-grid max-md:grid-cols-1">
                <label className="form-group">
                  <span className="form-label">Name</span>
                  <input
                    name={`fallbackSpots.${index}.name`}
                    defaultValue={spot.name}
                    className="fi"
                  />
                </label>

                <label className="form-group">
                  <span className="form-label">Map URL</span>
                  <input
                    name={`fallbackSpots.${index}.mapUrl`}
                    defaultValue={spot.mapUrl}
                    className="fi"
                  />
                </label>

                <label className="form-group md:col-span-2">
                  <span className="form-label">Image URL</span>
                  <input
                    name={`fallbackSpots.${index}.image`}
                    defaultValue={spot.image ?? ""}
                    className="fi"
                  />
                </label>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <div className="card-title">Featured Video Controls</div>
        </div>
        <div className="card-body">
          <div className="form-grid max-md:grid-cols-1">
            <label className="form-group md:col-span-2">
              <span className="form-label">Video URL</span>
              <input
                name="featuredVideo.videoUrl"
                defaultValue={content.featuredVideo.videoUrl}
                className="fi"
              />
            </label>

            <label className="form-group md:col-span-2">
              <span className="form-label">Meta Label</span>
              <input
                name="featuredVideo.metaLabel"
                defaultValue={content.featuredVideo.metaLabel}
                className="fi"
              />
            </label>

            <label className="form-group">
              <span className="form-label">Primary Button Label</span>
              <input
                name="featuredVideo.primaryButtonLabel"
                defaultValue={content.featuredVideo.primaryButtonLabel}
                className="fi"
              />
            </label>

            <label className="form-group">
              <span className="form-label">Primary Button Link</span>
              <input
                name="featuredVideo.primaryButtonHref"
                defaultValue={content.featuredVideo.primaryButtonHref}
                className="fi"
              />
            </label>

            <label className="form-group">
              <span className="form-label">Secondary Button Label</span>
              <input
                name="featuredVideo.secondaryButtonLabel"
                defaultValue={content.featuredVideo.secondaryButtonLabel}
                className="fi"
              />
            </label>

            <label className="form-group">
              <span className="form-label">Secondary Button Link</span>
              <input
                name="featuredVideo.secondaryButtonHref"
                defaultValue={content.featuredVideo.secondaryButtonHref}
                className="fi"
              />
            </label>

            <label className="form-group md:col-span-2">
              <span className="form-label">Footer Hint</span>
              <input
                name="featuredVideo.footerHint"
                defaultValue={content.featuredVideo.footerHint}
                className="fi"
              />
            </label>
          </div>
        </div>
      </section>

      <section className="card">
        <div className="card-header">
          <div className="card-title">Ready To Skate</div>
        </div>
        <div className="card-body">
          <div className="form-grid max-md:grid-cols-1">
            <label className="form-group md:col-span-2">
              <span className="form-label">Background Image</span>
              <input
                name="readyToSkate.backgroundImage"
                defaultValue={content.readyToSkate.backgroundImage}
                className="fi"
              />
            </label>

            <label className="form-group">
              <span className="form-label">Title Leading</span>
              <input
                name="readyToSkate.titleLeading"
                defaultValue={content.readyToSkate.titleLeading}
                className="fi"
              />
            </label>

            <label className="form-group">
              <span className="form-label">Title Accent</span>
              <input
                name="readyToSkate.titleAccent"
                defaultValue={content.readyToSkate.titleAccent}
                className="fi"
              />
            </label>

            <label className="form-group md:col-span-2">
              <span className="form-label">Subheading</span>
              <input
                name="readyToSkate.subheading"
                defaultValue={content.readyToSkate.subheading}
                className="fi"
              />
            </label>

            <label className="form-group">
              <span className="form-label">CTA Label</span>
              <input
                name="readyToSkate.ctaLabel"
                defaultValue={content.readyToSkate.ctaLabel}
                className="fi"
              />
            </label>

            <label className="form-group">
              <span className="form-label">CTA Link</span>
              <input
                name="readyToSkate.ctaHref"
                defaultValue={content.readyToSkate.ctaHref}
                className="fi"
              />
            </label>
          </div>
        </div>
      </section>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={!canSave || isPending}
          className="btn btn-primary inline-flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-60"
        >
          {!canSave ? "Saving Unavailable" : isPending ? "Saving..." : "Save Homepage Content"}
        </button>
      </div>
    </form>
  )
}
