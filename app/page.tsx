import type { Metadata } from "next"
import { defaultSeoDescription, defaultSeoTitle } from "@/config/defaults"
import { getHomepageContent } from "@/lib/homepage-content.server"
import { supabase } from "@/lib/supabase"
import { GoofyHomepage } from "@/components/home/GoofyHomepage"

type GenericRow = Record<string, unknown>

export async function generateMetadata(): Promise<Metadata> {
    return {
        title: defaultSeoTitle,
        description: defaultSeoDescription,
        openGraph: { title: defaultSeoTitle, description: defaultSeoDescription, type: "website" },
    }
}

function getString(r: GenericRow | null | undefined, keys: string[], fb = "") {
    if (!r) return fb
    for (const k of keys) { const v = r[k]; if (typeof v === "string" && v.trim()) return v.trim() }
    return fb
}

function getNumber(r: GenericRow | null | undefined, keys: string[], fb = 0) {
    if (!r) return fb
    for (const k of keys) {
        const v = r[k]
        if (typeof v === "number" && Number.isFinite(v)) return v
        if (typeof v === "string" && v.trim()) { const p = Number(v); if (Number.isFinite(p)) return p }
    }
    return fb
}

function getImage(r: GenericRow | null | undefined, keys = ["image","image_url","hero_image","desktop_image","cover_image","thumbnail","photo","images"]) {
    if (!r) return null
    for (const k of keys) {
        const v = r[k]
        if (typeof v === "string" && v.trim()) return v.trim()
        if (Array.isArray(v)) {
            for (const item of v) {
                if (typeof item === "string" && item.trim()) return item.trim()
                if (item && typeof item === "object") { const n = getString(item as GenericRow, ["url","src","image"]); if (n) return n }
            }
        }
        if (v && typeof v === "object") { const n = getString(v as GenericRow, ["url","src","image"]); if (n) return n }
    }
    return null
}

function getExcerpt(post: GenericRow) {
    const e = getString(post, ["excerpt","summary","description","dek"])
    if (e) return e
    const b = getString(post, ["content","body"])
    if (!b) return "Vientiane street culture and new community stories."
    return b.length > 130 ? `${b.slice(0, 127).trim()}...` : b
}

function formatDate(v?: string | null) {
    if (!v) return "2026"
    const d = new Date(v)
    if (Number.isNaN(d.getTime())) return "2026"
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(d)
}

function slugify(v: string) {
    return v.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
}

function normCatKey(v: string) {
    const n = v.trim().toLowerCase()
    if (n.includes("deck")) return "decks"
    if (n.includes("truck")) return "trucks"
    if (n.includes("wheel")) return "wheels"
    if (n.includes("shoe")) return "shoes"
    if (n.includes("apparel")) return "apparel"
    const s = slugify(v)
    return s ? (s.endsWith("s") ? s : `${s}s`) : null
}

function getYouTubeId(url: string) {
    if (!url) return ""
    try {
        const p = new URL(url)
        if (p.hostname.includes("youtu.be")) return p.pathname.replace("/", "")
        return p.searchParams.get("v") || ""
    } catch { return "" }
}

export default async function HomePage() {
    const [bannerRes, postsRes, productsRes, videoRes, parksRes, homepageContent] = await Promise.all([
        supabase.from("banners").select("*").eq("active", true).order("created_at", { ascending: false }).limit(1),
        supabase.from("posts").select("*").eq("published", true).order("published_at", { ascending: false }).limit(6),
        supabase.from("products").select("*").eq("active", true).order("created_at", { ascending: false }).limit(20),
        supabase.from("videos").select("*").order("created_at", { ascending: false }).limit(1),
        supabase.from("skateparks").select("*").order("created_at", { ascending: false }).limit(4),
        getHomepageContent(),
    ])

    let productRows = productsRes.data ?? []
    if (!productRows.length && productsRes.error) {
        const fb = await supabase.from("products").select("*").order("created_at", { ascending: false }).limit(20)
        productRows = fb.data ?? []
    }
    const postsRows = postsRes.data ?? []
    let videoRows = videoRes.data ?? []
    if (!videoRows.length && videoRes.error) {
        const fb = await supabase.from("videos").select("*").order("published_date", { ascending: false }).limit(1)
        videoRows = fb.data ?? []
    }
    let parkRows = parksRes.data ?? []
    if (!parkRows.length && parksRes.error) {
        const fb = await supabase.from("skateparks").select("*").limit(4)
        parkRows = fb.data ?? []
    }

    const banner = (bannerRes.data?.[0] ?? null) as GenericRow | null
    const heroImage = getImage(banner)

    const badgeOptions = ["NEW", "HOT", "SALE", "COLLAB", "DROP"]
    const products = (productRows as GenericRow[]).map((p, i) => {
        const slug = getString(p, ["slug"], `product-${i}`)
        const cat = getString(p, ["category"], "deck")
        const badge = getString(p, ["badge"], badgeOptions[i % 5]).toUpperCase()
        return {
            id: `${slug}-${i}`, slug,
            name: getString(p, ["name"], "Product"),
            price: getNumber(p, ["price"], 0),
            image: getImage(p),
            category: cat,
            badge: badgeOptions.includes(badge) ? badge : badgeOptions[i % 5],
        }
    })

    const catMap = new Map<string, typeof products>()
    for (const p of products) {
        const key = normCatKey(p.category)
        if (!key) continue
        const arr = catMap.get(key) ?? []
        arr.push(p)
        catMap.set(key, arr)
    }
    const catOrder = ["decks", "trucks", "wheels", "shoes", "apparel"]
    const categories = [...catOrder, ...Array.from(catMap.keys()).filter(k => !catOrder.includes(k))].map(key => {
        const prods = catMap.get(key) ?? []
        return { key, name: key.toUpperCase(), slug: key.replace(/s$/, ""), image: prods[0]?.image ?? null, products: prods }
    }).filter(c => c.products.length > 0)

    const stories = (postsRows as GenericRow[]).slice(0, 3).map((post, i) => ({
        id: getString(post, ["id", "slug"], `post-${i}`),
        title: getString(post, ["title", "name"], `Story ${i + 1}`),
        image: getImage(post),
        href: `/news/${getString(post, ["slug"], `story-${i + 1}`)}`,
        category: getString(post, ["category", "type"], "Story").toUpperCase(),
        date: formatDate(getString(post, ["published_at", "created_at"])),
    }))

    const spots = (parkRows as GenericRow[]).slice(0, 4).map((park, i) => {
        const name = getString(park, ["name", "title"], `Spot ${i + 1}`)
        const loc = getString(park, ["city", "address"], "Vientiane, Laos")
        const mapUrl = getString(park, ["map_url", "google_maps_url", "link", "url"])
        return {
            id: getString(park, ["id"], `park-${i + 1}`), name,
            image: getImage(park, ["photo", "image", "image_url", "thumbnail"]),
            mapUrl: mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${loc}`)}`,
        }
    })

    const latestVideo = (videoRows[0] ?? null) as GenericRow | null
    const videoUrl = homepageContent.featuredVideo.videoUrl || "https://www.youtube.com/watch?v=2WapgjbfXNM"
    const videoId = getYouTubeId(videoUrl)
    const videoThumbnail = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : getImage(latestVideo)

    return (
        <GoofyHomepage
            products={products}
            categories={categories}
            stories={stories}
            spots={spots}
            videoTitle={getString(latestVideo, ["title", "name"], "Latest Video")}
            videoDescription={getExcerpt(latestVideo ?? {})}
            videoThumbnail={videoThumbnail}
            videoUrl={videoUrl}
            heroImage={heroImage}
            heroSlides={homepageContent.heroSlides}
        />
    )
}