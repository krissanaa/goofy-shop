import { Suspense } from 'react';
import type { PageSection } from '@/lib/types/cms';
import { DynamicHero } from '@/components/sections/dynamic-hero';
import { DynamicMarquee } from '@/components/sections/dynamic-marquee';
import { DynamicRetroBanner } from '@/components/sections/dynamic-retro-banner';
import { DynamicFeaturedDrops } from '@/components/sections/dynamic-featured-drops';
import { DynamicSlideshow } from '@/components/sections/dynamic-slideshow';
import { DynamicCategoryRow } from '@/components/sections/dynamic-category-row';
import { DynamicStreetsBanner } from '@/components/sections/dynamic-streets-banner';
import { DynamicNewArrivals } from '@/components/sections/dynamic-new-arrivals';
import { DynamicTestimonials } from '@/components/sections/dynamic-testimonials';
import { DynamicSponsorStrip } from '@/components/sections/dynamic-sponsor-strip';
import { DynamicYoutubeLinks } from '@/components/sections/dynamic-youtube-links';

interface DynamicZoneRendererProps {
  sections: PageSection[];
}

function SectionSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 lg:px-8">
      <div className="h-10 w-48 animate-pulse bg-muted mb-8" />
      <div className="h-64 animate-pulse bg-muted rounded-lg" />
    </div>
  );
}

export function DynamicZoneRenderer({ sections }: DynamicZoneRendererProps) {
  return (
    <>
      {sections.map((section, index) => {
        const key = `${section.__component}-${section.id}-${index}`;

        switch (section.__component) {
          case 'sections.slideshow':
            return <DynamicSlideshow key={key} data={section} />;

          case 'sections.hero-section':
            return <DynamicHero key={key} data={section} />;

          case 'sections.marquee-text':
            return <DynamicMarquee key={key} data={section} />;

          case 'sections.retro-banner':
            return <DynamicRetroBanner key={key} data={section} />;

          case 'sections.featured-drops':
            return (
              <Suspense key={key} fallback={<SectionSkeleton />}>
                <DynamicFeaturedDrops data={section} />
              </Suspense>
            );

          case 'sections.category-row':
            return <DynamicCategoryRow key={key} data={section} />;

          case 'sections.streets-banner':
            return <DynamicStreetsBanner key={key} data={section} />;

          case 'sections.new-arrivals':
            return (
              <Suspense key={key} fallback={<SectionSkeleton />}>
                <DynamicNewArrivals data={section} />
              </Suspense>
            );

          case 'sections.testimonials':
            return <DynamicTestimonials key={key} data={section} />;

          case 'sections.sponsor-strip':
            return <DynamicSponsorStrip key={key} data={section} />;

          case 'sections.youtube-links':
            return <DynamicYoutubeLinks key={key} data={section} />;

          default:
            console.warn(`[DynamicZone] Unknown component: ${(section as any).__component}`);
            return null;
        }
      })}
    </>
  );
}
