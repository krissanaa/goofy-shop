export interface HomepageHeroSlideInput {
  id: string
  title: string
  tag: string
  imageUrl: string
  ctaText: string
  ctaLink: string
  order: number
}

export interface HomepageFallbackStory {
  id: string
  title: string
  date: string
  tag: string
  image: string
  href: string
}

export interface HomepageFallbackSpot {
  id: string
  name: string
  mapUrl: string
  image: string
}

export interface HomepageMockContent {
  topMarqueeText: string
  featuredVideoUrl: string
  heroSlides: HomepageHeroSlideInput[]
  fallbackStories: HomepageFallbackStory[]
  fallbackSpots: HomepageFallbackSpot[]
}

export type HomepageSourceStatus = "live" | "fallback" | "mixed"

export interface HomepageSourceSummaryItem {
  key: string
  label: string
  status: HomepageSourceStatus
  source: string
  detail: string
}

export const DEFAULT_HOMEPAGE_MOCK_CONTENT: HomepageMockContent = {
  topMarqueeText:
    "First Skate Shop in Laos // New Drop Every Week // Free Shipping Over 500,000 LAK // Vientiane Street Culture // Shop // Community // Drops",
  featuredVideoUrl: "https://www.youtube.com/watch?v=2WapgjbfXNM",
  heroSlides: [
    {
      id: "hero-1",
      title: "The Streets Are Ours",
      tag: "Vol.01 // Spring 2026 // Vientiane",
      imageUrl: "",
      ctaText: "Explore Issue",
      ctaLink: "/shop",
      order: 1,
    },
    {
      id: "hero-2",
      title: "Fresh Decks Just Landed",
      tag: "New Arrivals // Spring 2026",
      imageUrl: "https://images.unsplash.com/photo-1547447134-cd3f5c716030?w=900&q=80",
      ctaText: "Shop Decks",
      ctaLink: "/shop?category=deck",
      order: 2,
    },
    {
      id: "hero-3",
      title: "Goofy x Local Artist",
      tag: "Limited Collab Drop",
      imageUrl: "https://images.unsplash.com/photo-1556821840-3a63f15732ce?w=900&q=80",
      ctaText: "View Collab",
      ctaLink: "/shop?badge=COLLAB",
      order: 3,
    },
    {
      id: "hero-4",
      title: "Vientiane Streets",
      tag: "Community // Vientiane",
      imageUrl: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=900&q=80",
      ctaText: "Find Spots",
      ctaLink: "/parks",
      order: 4,
    },
  ],
  fallbackStories: [
    {
      id: "story-1",
      title: "VIENTIANE: THE NEW WAVE",
      date: "12.03.2026",
      tag: "FEATURE",
      image:
        "https://images.unsplash.com/photo-1547447134-cd3f5c716030?auto=format&fit=crop&q=80&w=900",
      href: "/news",
    },
    {
      id: "story-2",
      title: "MEKONG RIVER SESSIONS",
      date: "10.03.2026",
      tag: "STORY",
      image:
        "https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&q=80&w=900",
      href: "/news",
    },
    {
      id: "story-3",
      title: "DIY SPOT: THE ABANDONED PLAZA",
      date: "08.03.2026",
      tag: "SPOTLIGHT",
      image:
        "https://images.unsplash.com/photo-1564982752979-3f7ba97481c6?auto=format&fit=crop&q=80&w=900",
      href: "/news",
    },
  ],
  fallbackSpots: [
    {
      id: "spot-1",
      name: "THAT LUANG PLAZA",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=That+Luang+Plaza",
      image:
        "https://images.unsplash.com/photo-1520045892732-304bc3ac5d8e?auto=format&fit=crop&q=80&w=900",
    },
    {
      id: "spot-2",
      name: "MEKONG CURB CUTS",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Mekong+Vientiane",
      image:
        "https://images.unsplash.com/photo-1547447134-cd3f5c716030?auto=format&fit=crop&q=80&w=900",
    },
    {
      id: "spot-3",
      name: "OLD CITY BANKS",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Old+City+Banks+Vientiane",
      image:
        "https://images.unsplash.com/photo-1564982752979-3f7ba97481c6?auto=format&fit=crop&q=80&w=900",
    },
    {
      id: "spot-4",
      name: "RIVERSIDE FLAT",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Riverside+Vientiane",
      image:
        "https://images.unsplash.com/photo-1508179522353-11ba468c4a1c?auto=format&fit=crop&q=80&w=900",
    },
  ],
}

export function cloneDefaultHomepageMockContent(): HomepageMockContent {
  return {
    topMarqueeText: DEFAULT_HOMEPAGE_MOCK_CONTENT.topMarqueeText,
    featuredVideoUrl: DEFAULT_HOMEPAGE_MOCK_CONTENT.featuredVideoUrl,
    heroSlides: DEFAULT_HOMEPAGE_MOCK_CONTENT.heroSlides.map((slide) => ({ ...slide })),
    fallbackStories: DEFAULT_HOMEPAGE_MOCK_CONTENT.fallbackStories.map((story) => ({ ...story })),
    fallbackSpots: DEFAULT_HOMEPAGE_MOCK_CONTENT.fallbackSpots.map((spot) => ({ ...spot })),
  }
}
