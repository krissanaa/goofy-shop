import type { HomepageHeroSlide } from "@/lib/homepage-content"

export interface GoofyProduct {
    id: string
    slug: string
    name: string
    price: number
    image: string | null
    category: string
    badge?: string
}

export interface GoofyCategory {
    key: string
    name: string
    slug: string
    image: string | null
    products: GoofyProduct[]
}

export interface GoofyStory {
    id: string
    title: string
    image: string | null
    href: string
    category: string
    date: string
}

export interface GoofySpot {
    id: string
    name: string
    image: string | null
    mapUrl: string
}

export interface GoofyHomepageProps {
    products: GoofyProduct[]
    categories: GoofyCategory[]
    stories: GoofyStory[]
    spots: GoofySpot[]
    videoTitle: string
    videoDescription: string
    videoThumbnail: string | null
    videoUrl: string
    heroImage: string | null
    heroSlides?: HomepageHeroSlide[]
}
