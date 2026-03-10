import type {
  StrapiGlobalConfig,
  StrapiHomePage,
  StrapiProductsPage,
  StrapiLocationsPage,
  StrapiLocationPark,
  ProductBadge,
  ResolvedGlobalConfig,
  ResolvedProductsPageConfig,
  ResolvedLocationsPageConfig,
  PageSection,
} from './strapi-types';
import {
  defaultGlobalConfig,
  defaultHomePageSections,
  defaultProductsPageConfig,
  defaultLocationsPageConfig,
  defaultSeoTitle,
  defaultSeoDescription,
} from '@/config/defaults';

// ─── Strapi Response Types ────────────────────────────────────────────────────

export interface StrapiImage {
  id: number;
  url: string;
  alternativeText: string | null;
  width: number;
  height: number;
  formats?: Record<string, { url: string; width: number; height: number }>;
}

export interface StrapiCategory {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  thumbnail: StrapiImage | null;
}

export interface StrapiProduct {
  id: number;
  documentId: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  compare_at_price: number | null;
  sku: string;
  badge: ProductBadge | null;
  stock_quantity: number;
  is_limited: boolean;
  is_sold_out: boolean;
  specs: Record<string, string> | null;
  images: StrapiImage[];
  category: StrapiCategory | null;
  createdAt?: string;
  publishedAt?: string;
}

export interface StrapiDropEvent {
  id: number;
  documentId: string;
  title: string;
  description: string | null;
  release_date: string;
  is_active: boolean;
  entryCount?: number;
  hero_banner: StrapiImage | null;
  featured_products: StrapiProduct[];
}

export interface StrapiCollectionResponse<T> {
  data: T[];
  meta: {
    pagination: { page: number; pageSize: number; pageCount: number; total: number };
  };
}

export interface StrapiSingleResponse<T> {
  data: T;
  meta: Record<string, unknown>;
}

// ─── Typed Data Fetchers ──────────────────────────────────────────────────────

export async function getProducts(opts?: {
  categorySlug?: string;
  badge?: ProductBadge;
  dropEventId?: number;
  limit?: number;
  revalidate?: number;
}) {
  const filters: Record<string, QueryValue> = {};

  if (opts?.categorySlug) {
    filters.category = { slug: { $eq: opts.categorySlug } };
  }

  if (opts?.badge) {
    filters.badge = { $eq: opts.badge };
  }

  if (typeof opts?.dropEventId === 'number' && Number.isFinite(opts.dropEventId)) {
    filters.drop_events = { id: { $eq: Math.floor(opts.dropEventId) } };
  }

  const hasFilters = Object.keys(filters).length > 0;
  const query: Record<string, QueryValue> = {
    populate: '*',
    sort: 'publishedAt:desc',
  };

  if (hasFilters) {
    query.filters = filters;
  }

  if (typeof opts?.limit === 'number') {
    query.pagination = { limit: Math.max(1, Math.floor(opts.limit)) };
  }

  return fetchAPI<StrapiCollectionResponse<StrapiProduct>>('/products', {
    query,
    revalidate: opts?.revalidate ?? 60,
  });
}

export async function getProductBySlug(slug: string) {
  return fetchAPI<StrapiCollectionResponse<StrapiProduct>>('/products', {
    query: {
      fields: [
        'name',
        'slug',
        'description',
        'price',
        'compare_at_price',
        'sku',
        'badge',
        'stock_quantity',
        'is_limited',
        'is_sold_out',
        'specs',
        'publishedAt',
        'createdAt',
      ],
      filters: { slug: { $eq: slug } },
      populate: {
        images: { fields: ['url', 'alternativeText', 'width', 'height', 'formats'] },
        category: { fields: ['title', 'slug'] },
      },
    },
    revalidate: 60,
  });
}

export async function getCategories() {
  return fetchAPI<StrapiCollectionResponse<StrapiCategory>>('/categories', {
    query: {
      fields: ['title', 'slug'],
      populate: {
        thumbnail: {
          fields: ['url', 'alternativeText', 'width', 'height', 'formats'],
        },
      },
      sort: ['title:asc'],
    },
    revalidate: 0,
  });
}

export async function getActiveDropEvent() {
  return fetchAPI<StrapiCollectionResponse<StrapiDropEvent>>('/drop-events', {
    query: {
      filters: { is_active: { $eq: true } },
      sort: ['release_date:desc'],
      pagination: { page: 1, pageSize: 1 },
      populate: {
        hero_banner: { fields: ['url', 'alternativeText', 'width', 'height', 'formats'] },
        featured_products: {
          fields: ['name', 'slug', 'description', 'price', 'compare_at_price', 'sku', 'stock_quantity', 'is_limited', 'is_sold_out', 'specs'],
          populate: {
            images: { fields: ['url', 'alternativeText', 'width', 'height', 'formats'] },
            category: {
              fields: ['title', 'slug'],
              populate: {
                thumbnail: { fields: ['url', 'alternativeText', 'width', 'height', 'formats'] },
              },
            },
          },
        },
      },
    },
    realtime: true,
  });
}

export async function getLatestDropEvent() {
  return fetchAPI<StrapiCollectionResponse<StrapiDropEvent>>('/drop-events', {
    query: {
      sort: ['release_date:desc'],
      pagination: { page: 1, pageSize: 1 },
      populate: {
        hero_banner: { fields: ['url', 'alternativeText', 'width', 'height', 'formats'] },
        featured_products: {
          fields: ['name', 'slug', 'description', 'price', 'compare_at_price', 'sku', 'stock_quantity', 'is_limited', 'is_sold_out', 'specs', 'badge'],
          populate: {
            images: { fields: ['url', 'alternativeText', 'width', 'height', 'formats'] },
            category: {
              fields: ['title', 'slug'],
              populate: {
                thumbnail: { fields: ['url', 'alternativeText', 'width', 'height', 'formats'] },
              },
            },
          },
        },
      },
    },
    realtime: true,
  });
}

// ─── Image URL Helper ─────────────────────────────────────────────────────────

export function getStrapiImageUrl(image: StrapiImage | null | undefined, size?: 'thumbnail' | 'small' | 'medium' | 'large'): string {
  if (!image) return '/images/placeholder.jpg';
  if (size && image.formats?.[size]) {
    const base = STRAPI_URL.replace(/\/$/, '');
    const fmt = image.formats[size];
    return fmt.url.startsWith('http') ? fmt.url : `${base}${fmt.url}`;
  }
  const base = STRAPI_URL.replace(/\/$/, '');
  return image.url.startsWith('http') ? image.url : `${base}${image.url}`;
}

// ─── Query Primitives ─────────────────────────────────────────────────────────

type QueryPrimitive = string | number | boolean | null | undefined;
type QueryValue = QueryPrimitive | QueryValue[] | { [key: string]: QueryValue };

export type FetchAPIOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  query?: Record<string, QueryValue>;
  data?: unknown;
  headers?: HeadersInit;
  realtime?: boolean;
  revalidate?: number;
};

export const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL ?? process.env.STRAPI_URL ?? 'http://localhost:1337';
const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

const DEFAULT_REVALIDATE_SECONDS = 3600;
let hasLoggedLocationsPageNotFound = false;

function appendQueryParam(params: URLSearchParams, key: string, value: QueryValue): void {
  if (value === undefined || value === null) {
    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => appendQueryParam(params, `${key}[${index}]`, item));
    return;
  }

  if (typeof value === 'object') {
    Object.entries(value).forEach(([nestedKey, nestedValue]) => {
      appendQueryParam(params, `${key}[${nestedKey}]`, nestedValue);
    });
    return;
  }

  params.append(key, String(value));
}

export function buildStrapiQuery(query?: Record<string, QueryValue>): string {
  if (!query) {
    return '';
  }

  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => appendQueryParam(params, key, value));

  const queryString = params.toString();
  return queryString ? `?${queryString}` : '';
}

export async function fetchAPI<T = unknown>(path: string, options: FetchAPIOptions = {}): Promise<T> {
  const {
    method = 'GET',
    query,
    data,
    headers: customHeaders,
    realtime = false,
    revalidate = DEFAULT_REVALIDATE_SECONDS,
  } = options;

  const normalizedPath = path.startsWith('/api') ? path : `/api${path.startsWith('/') ? path : `/${path}`}`;
  const url = `${STRAPI_URL.replace(/\/$/, '')}${normalizedPath}${buildStrapiQuery(query)}`;

  const headers = new Headers(customHeaders);
  if (data !== undefined && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  if (STRAPI_API_TOKEN && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${STRAPI_API_TOKEN}`);
  }

  const requestInit: RequestInit & { next?: { revalidate: number } } = {
    method,
    headers,
  };

  if (data !== undefined) {
    requestInit.body = JSON.stringify(data);
  }

  if (realtime) {
    requestInit.cache = 'no-store';
  } else {
    requestInit.next = { revalidate };
  }

  const response = await fetch(url, requestInit);

  if (!response.ok) {
    const errorText = await response.text();
    const error = new Error(
      `Strapi request failed (${response.status} ${response.statusText}): ${errorText}`,
    ) as Error & { status?: number; responseBody?: string };
    error.status = response.status;
    error.responseBody = errorText;
    throw error;
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

export const hypeDropCountdownQuery = {
  filters: {
    is_active: {
      $eq: true,
    },
  },
  sort: ['release_date:asc'],
  pagination: {
    page: 1,
    pageSize: 1,
  },
  populate: {
    hero_banner: {
      fields: ['url', 'alternativeText'],
    },
    featured_products: {
      fields: ['name', 'slug', 'price', 'compare_at_price', 'stock_quantity', 'is_sold_out'],
      populate: {
        images: {
          fields: ['url', 'alternativeText'],
        },
        category: {
          fields: ['title', 'slug'],
          populate: {
            thumbnail: { fields: ['url', 'alternativeText', 'width', 'height', 'formats'] },
          },
        },
      },
    },
  },
};

export async function getHypeDropCountdown<T = unknown>() {
  return fetchAPI<T>('/drop-events', {
    query: hypeDropCountdownQuery,
    realtime: true,
  });
}

export async function getRealtimeStock<T = unknown>() {
  return fetchAPI<T>('/products', {
    realtime: true,
    query: {
      fields: ['name', 'slug', 'sku', 'stock_quantity', 'is_sold_out'],
      populate: {
        images: {
          fields: ['url', 'alternativeText'],
        },
      },
    },
  });
}

export async function getStaticCategories<T = unknown>() {
  return fetchAPI<T>('/categories');
}

export const hypeDropQuery = {
  filters: {
    is_active: {
      $eq: true,
    },
  },
  sort: ['release_date:desc'],
  pagination: {
    page: 1,
    pageSize: 1,
  },
  populate: {
    hero_banner: {
      fields: ['url', 'alternativeText', 'width', 'height', 'formats'],
    },
    featured_products: {
      fields: [
        'name',
        'slug',
        'description',
        'price',
        'compare_at_price',
        'sku',
        'stock_quantity',
        'is_limited',
        'is_sold_out',
        'specs',
      ],
      populate: {
        images: {
          fields: ['url', 'alternativeText', 'width', 'height', 'formats'],
        },
        category: {
          fields: ['title', 'slug'],
          populate: {
            thumbnail: { fields: ['url', 'alternativeText', 'width', 'height', 'formats'] },
          },
        },
      },
    },
  },
};

export async function getHypeDrop<T = unknown>() {
  return fetchAPI<T>('/drop-events', {
    query: hypeDropQuery,
    realtime: true,
  });
}

// ─── Global Config & Home Page Fetchers ──────────────────────────────────────

export async function getGlobalConfig(): Promise<StrapiSingleResponse<StrapiGlobalConfig> | null> {
  try {
    return await fetchAPI<StrapiSingleResponse<StrapiGlobalConfig>>('/global-config', {
      query: {
        populate: {
          favicon: { fields: ['url', 'alternativeText', 'width', 'height'] },
          logo_pixel_art: { fields: ['url', 'alternativeText', 'width', 'height'] },
          mainMenu: { fields: ['label', 'url', 'icon_name', 'open_in_new_tab'] },
          socialLinks: { fields: ['platform', 'url'] },
          siteGodMode: {
            populate: {
              collabImage: { fields: ['url', 'alternativeText', 'width', 'height', 'formats'] },
              lookbookImage: { fields: ['url', 'alternativeText', 'width', 'height', 'formats'] },
            },
          },
        },
      },
      revalidate: 60,
    });
  } catch (error) {
    console.warn('[Strapi] GlobalConfig fetch failed, using defaults:', error);
    return null;
  }
}

function toStatsArray(value: unknown): { value: string; label: string }[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const obj = item as Record<string, unknown>;
      const rawValue = typeof obj.value === 'string' ? obj.value.trim() : '';
      const rawLabel = typeof obj.label === 'string' ? obj.label.trim() : '';
      if (!rawValue || !rawLabel) return null;
      return { value: rawValue, label: rawLabel };
    })
    .filter((item): item is { value: string; label: string } => Boolean(item));
}

function toTestimonialsArray(value: unknown): { quote: string; author: string }[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== 'object') return null;
      const obj = item as Record<string, unknown>;
      const quote = typeof obj.quote === 'string' ? obj.quote.trim() : '';
      const author = typeof obj.author === 'string' ? obj.author.trim() : '';
      if (!quote || !author) return null;
      return { quote, author };
    })
    .filter((item): item is { quote: string; author: string } => Boolean(item));
}

function toPressLogoUrl(url: string): string | undefined {
  if (!url || url === '#') return undefined;
  try {
    const hostname = new URL(url).hostname.replace(/^www\./, '');
    if (!hostname) return undefined;
    return `https://logo.clearbit.com/${hostname}`;
  } catch {
    return undefined;
  }
}

function toPressLogosArray(value: unknown): { name: string; url: string; logoUrl?: string }[] {
  if (!Array.isArray(value)) return [];
  const parsed: { name: string; url: string; logoUrl?: string }[] = [];

  for (const item of value) {
    if (!item || typeof item !== 'object') continue;

    const obj = item as Record<string, unknown>;
    const name = typeof obj.name === 'string' ? obj.name.trim() : '';
    const rawUrl = typeof obj.url === 'string' ? obj.url.trim() : '';
    const rawLogoUrl = typeof obj.logoUrl === 'string' ? obj.logoUrl.trim() : '';
    const rawLogoAlias = typeof obj.logo === 'string' ? obj.logo.trim() : '';
    if (!name) continue;

    const logoUrl = rawLogoUrl || rawLogoAlias || toPressLogoUrl(rawUrl);
    const logoEntry: { name: string; url: string; logoUrl?: string } = {
      name,
      url: rawUrl || '#',
    };
    if (logoUrl) {
      logoEntry.logoUrl = logoUrl;
    }

    parsed.push(logoEntry);
  }

  return parsed;
}

export async function getResolvedGlobalConfig(): Promise<ResolvedGlobalConfig> {
  const response = await getGlobalConfig();
  if (!response?.data) return defaultGlobalConfig;

  const d = response.data;
  const fallbackShopMenu = defaultGlobalConfig.navigation.shopMenu;
  const resolvedCategoryLimit =
    typeof d.shopMenuCategoryLimit === 'number' && d.shopMenuCategoryLimit > 0
      ? d.shopMenuCategoryLimit
      : fallbackShopMenu.categoryLimit;
  const resolvedTrendingLimit =
    typeof d.shopMenuTrendingLimit === 'number' && d.shopMenuTrendingLimit > 0
      ? d.shopMenuTrendingLimit
      : fallbackShopMenu.trendingLimit;
  const fallbackGodMode = defaultGlobalConfig.godMode;
  const gm = d.siteGodMode;
  const godModeEnabled = gm?.enabled ?? fallbackGodMode.enabled;
  const statsItems = toStatsArray(gm?.statsItems);
  const testimonials = toTestimonialsArray(gm?.testimonials);
  const pressLogos = toPressLogosArray(gm?.pressLogos);

  return {
    siteName: d.siteName || defaultGlobalConfig.siteName,
    siteDescription: d.siteDescription || defaultGlobalConfig.siteDescription,
    logoUrl: d.logo_pixel_art ? getStrapiImageUrl(d.logo_pixel_art) : defaultGlobalConfig.logoUrl,
    faviconUrl: d.favicon ? getStrapiImageUrl(d.favicon) : defaultGlobalConfig.faviconUrl,
    mainMenu: d.mainMenu?.length
      ? d.mainMenu.map((item) => ({
          label: item.label,
          url: item.url,
          iconName: item.icon_name,
          openInNewTab: item.open_in_new_tab,
        }))
      : defaultGlobalConfig.mainMenu,
    navigation: {
      shopMenu: {
        godMode: d.shopMenuGodMode ?? fallbackShopMenu.godMode,
        enabled: d.shopMenuEnabled ?? fallbackShopMenu.enabled,
        categoryLimit: resolvedCategoryLimit,
        trendingLimit: resolvedTrendingLimit,
      },
    },
    announcement: {
      active: d.isAnnouncementActive ?? defaultGlobalConfig.announcement.active,
      items: Array.isArray(d.topBarText) && d.topBarText.length
        ? d.topBarText
        : defaultGlobalConfig.announcement.items,
      barColor: d.barColor || defaultGlobalConfig.announcement.barColor,
    },
    theme: {
      primary: d.themeColorPrimary || defaultGlobalConfig.theme.primary,
      secondary: d.themeColorSecondary || defaultGlobalConfig.theme.secondary,
      background: d.themeBackground || defaultGlobalConfig.theme.background,
      foreground: d.themeForeground || defaultGlobalConfig.theme.foreground,
    },
    footer: {
      copyrightText: d.copyrightText || defaultGlobalConfig.footer.copyrightText,
      socialLinks: d.socialLinks?.length
        ? d.socialLinks.map((link) => ({ platform: link.platform, url: link.url }))
        : defaultGlobalConfig.footer.socialLinks,
    },
    ui: {
      addToCartText: d.addToCartText || defaultGlobalConfig.ui.addToCartText,
      soldOutText: d.soldOutText || defaultGlobalConfig.ui.soldOutText,
    },
    godMode: {
      enabled: godModeEnabled,
      aboveFold: {
        showNavbar: gm?.showNavbar ?? fallbackGodMode.aboveFold.showNavbar,
        showMarqueeTicker:
          gm?.showMarqueeTicker ?? fallbackGodMode.aboveFold.showMarqueeTicker,
        showHeroBanner:
          gm?.showHeroBanner ?? fallbackGodMode.aboveFold.showHeroBanner,
      },
      content: {
        showFeaturedDrops:
          gm?.showFeaturedDrops ?? fallbackGodMode.content.showFeaturedDrops,
        showCountdownTimer:
          gm?.showCountdownTimer ?? fallbackGodMode.content.showCountdownTimer,
        showCollabSpotlight:
          gm?.showCollabSpotlight ?? fallbackGodMode.content.showCollabSpotlight,
        showLookbookBanner:
          gm?.showLookbookBanner ?? fallbackGodMode.content.showLookbookBanner,
        showShopByCategory:
          gm?.showShopByCategory ?? fallbackGodMode.content.showShopByCategory,
        collabTitle: gm?.collabTitle || fallbackGodMode.content.collabTitle,
        collabDescription:
          gm?.collabDescription || fallbackGodMode.content.collabDescription,
        collabCtaText:
          gm?.collabCtaText || fallbackGodMode.content.collabCtaText,
        collabCtaLink:
          gm?.collabCtaLink || fallbackGodMode.content.collabCtaLink,
        collabImageUrl: gm?.collabImage
          ? getStrapiImageUrl(gm.collabImage, 'large')
          : fallbackGodMode.content.collabImageUrl,
        lookbookTitle:
          gm?.lookbookTitle || fallbackGodMode.content.lookbookTitle,
        lookbookSubtitle:
          gm?.lookbookSubtitle || fallbackGodMode.content.lookbookSubtitle,
        lookbookCtaText:
          gm?.lookbookCtaText || fallbackGodMode.content.lookbookCtaText,
        lookbookCtaLink:
          gm?.lookbookCtaLink || fallbackGodMode.content.lookbookCtaLink,
        lookbookImageUrl: gm?.lookbookImage
          ? getStrapiImageUrl(gm.lookbookImage, 'large')
          : fallbackGodMode.content.lookbookImageUrl,
      },
      socialProof: {
        showTestimonials:
          gm?.showTestimonials ?? fallbackGodMode.socialProof.showTestimonials,
        testimonials: testimonials.length
          ? testimonials
          : fallbackGodMode.socialProof.testimonials,
        showPressLogos:
          gm?.showPressLogos ?? fallbackGodMode.socialProof.showPressLogos,
        pressLogos: pressLogos.length
          ? pressLogos
          : fallbackGodMode.socialProof.pressLogos,
        showInstagramFeed:
          gm?.showInstagramFeed ?? fallbackGodMode.socialProof.showInstagramFeed,
        instagramEmbedUrl:
          gm?.instagramEmbedUrl || fallbackGodMode.socialProof.instagramEmbedUrl,
        instagramHandle:
          gm?.instagramHandle || fallbackGodMode.socialProof.instagramHandle,
        showNumberStats:
          gm?.showNumberStats ?? fallbackGodMode.socialProof.showNumberStats,
        statsItems: statsItems.length
          ? statsItems
          : fallbackGodMode.socialProof.statsItems,
      },
      conversion: {
        showEmailSignup:
          gm?.showEmailSignup ?? fallbackGodMode.conversion.showEmailSignup,
        showStickyCartSidebar:
          gm?.showStickyCartSidebar ??
          fallbackGodMode.conversion.showStickyCartSidebar,
        showStockWarning:
          gm?.showStockWarning ?? fallbackGodMode.conversion.showStockWarning,
        showPromoCodeBanner:
          gm?.showPromoCodeBanner ??
          fallbackGodMode.conversion.showPromoCodeBanner,
        promoBannerText:
          gm?.promoBannerText || fallbackGodMode.conversion.promoBannerText,
        promoBannerCode:
          gm?.promoBannerCode || fallbackGodMode.conversion.promoBannerCode,
        promoBannerCtaText:
          gm?.promoBannerCtaText ||
          fallbackGodMode.conversion.promoBannerCtaText,
        promoBannerCtaLink:
          gm?.promoBannerCtaLink ||
          fallbackGodMode.conversion.promoBannerCtaLink,
      },
      bottom: {
        showFooter:
          gm?.showFooter ?? fallbackGodMode.bottom.showFooter,
        showCookieBar:
          gm?.showCookieBar ?? fallbackGodMode.bottom.showCookieBar,
        cookieBarText:
          gm?.cookieBarText || fallbackGodMode.bottom.cookieBarText,
        cookiePolicyUrl:
          gm?.cookiePolicyUrl || fallbackGodMode.bottom.cookiePolicyUrl,
        cookieButtonText:
          gm?.cookieButtonText || fallbackGodMode.bottom.cookieButtonText,
      },
    },
  };
}

export async function getHomePage(): Promise<{
  seoTitle: string;
  seoDescription: string;
  sections: PageSection[];
}> {
  try {
    const response = await fetchAPI<StrapiSingleResponse<StrapiHomePage>>('/home-page', {
      query: {
        populate: {
          page_sections: {
            on: {
              'sections.slideshow': {
                populate: {
                  slides: { fields: ['url', 'alternativeText', 'width', 'height', 'formats'] },
                },
              },
              'sections.hero-section': {
                populate: {
                  background_image: { fields: ['url', 'alternativeText', 'width', 'height', 'formats'] },
                },
              },
              'sections.marquee-text': { populate: '*' },
              'sections.retro-banner': {
                populate: {
                  image: { fields: ['url', 'alternativeText', 'width', 'height', 'formats'] },
                },
              },
              'sections.featured-drops': { populate: '*' },
              'sections.category-row': { populate: '*' },
              'sections.streets-banner': {
                populate: {
                  background_image: { fields: ['url', 'alternativeText', 'width', 'height', 'formats'] },
                },
              },
              'sections.new-arrivals': { populate: '*' },
              'sections.testimonials': { populate: '*' },
              'sections.sponsor-strip': { populate: '*' },
              'sections.youtube-links': { populate: '*' },
            },
          },
        },
      },
      revalidate: 0,
    });

    if (!response?.data) {
      return {
        seoTitle: defaultSeoTitle,
        seoDescription: defaultSeoDescription,
        sections: defaultHomePageSections,
      };
    }

    const d = response.data;
    const supportedComponents = new Set([
      'sections.slideshow',
      'sections.hero-section',
      'sections.marquee-text',
      'sections.retro-banner',
      'sections.featured-drops',
      'sections.category-row',
      'sections.streets-banner',
      'sections.new-arrivals',
      'sections.testimonials',
      'sections.sponsor-strip',
      'sections.youtube-links',
    ]);
    const filteredSections = (d.page_sections ?? []).filter((section) =>
      supportedComponents.has((section as { __component?: string }).__component || ''),
    ) as PageSection[];
    const fallbackYoutubeSection = defaultHomePageSections.find(
      (section) => section.__component === 'sections.youtube-links',
    );
    const hasYoutubeSection = filteredSections.some(
      (section) => section.__component === 'sections.youtube-links',
    );
    const sectionsWithYoutubeFallback =
      !hasYoutubeSection && fallbackYoutubeSection
        ? [...filteredSections, fallbackYoutubeSection]
        : filteredSections;

    return {
      seoTitle: d.seo_title || defaultSeoTitle,
      seoDescription: d.seo_description || defaultSeoDescription,
      sections: sectionsWithYoutubeFallback.length
        ? sectionsWithYoutubeFallback
        : defaultHomePageSections,
    };
  } catch (error) {
    console.warn('[Strapi] HomePage fetch failed, using defaults:', error);
    return {
      seoTitle: defaultSeoTitle,
      seoDescription: defaultSeoDescription,
      sections: defaultHomePageSections,
    };
  }
}

export async function getProductsPage(): Promise<ResolvedProductsPageConfig> {
  try {
    const response = await fetchAPI<StrapiSingleResponse<StrapiProductsPage>>(
      '/products-page',
      {
        query: {
          fields: [
            'seo_title',
            'seo_description',
            'show_marquee',
            'show_hero_scene',
            'page_title',
            'default_category',
            'default_sort',
            'default_view',
            'initial_favorites_only',
            'products_limit',
            'enable_category_tabs',
            'enable_sort',
            'enable_search',
            'enable_view_toggle',
            'enable_wishlist',
            'enable_top_stats',
            'promo_text',
            'promo_cta_text',
          ],
        },
        revalidate: 60,
      },
    );

    if (!response?.data) {
      return defaultProductsPageConfig;
    }

    const d = response.data;
    return {
      seoTitle: d.seo_title || defaultProductsPageConfig.seoTitle,
      seoDescription:
        d.seo_description || defaultProductsPageConfig.seoDescription,
      showMarquee:
        d.show_marquee ?? defaultProductsPageConfig.showMarquee,
      showHeroScene:
        d.show_hero_scene ?? defaultProductsPageConfig.showHeroScene,
      pageTitle: d.page_title || defaultProductsPageConfig.pageTitle,
      defaultCategory:
        d.default_category || defaultProductsPageConfig.defaultCategory,
      defaultSort: d.default_sort || defaultProductsPageConfig.defaultSort,
      defaultView: d.default_view || defaultProductsPageConfig.defaultView,
      initialFavoritesOnly:
        d.initial_favorites_only ??
        defaultProductsPageConfig.initialFavoritesOnly,
      productsLimit:
        typeof d.products_limit === 'number' && d.products_limit > 0
          ? d.products_limit
          : defaultProductsPageConfig.productsLimit,
      enableCategoryTabs:
        d.enable_category_tabs ?? defaultProductsPageConfig.enableCategoryTabs,
      enableSort: d.enable_sort ?? defaultProductsPageConfig.enableSort,
      enableSearch: d.enable_search ?? defaultProductsPageConfig.enableSearch,
      enableViewToggle:
        d.enable_view_toggle ?? defaultProductsPageConfig.enableViewToggle,
      enableWishlist:
        d.enable_wishlist ?? defaultProductsPageConfig.enableWishlist,
      enableTopStats:
        d.enable_top_stats ?? defaultProductsPageConfig.enableTopStats,
      promoText: d.promo_text || defaultProductsPageConfig.promoText,
      promoCtaText:
        d.promo_cta_text || defaultProductsPageConfig.promoCtaText,
    };
  } catch (error) {
    console.warn('[Strapi] ProductsPage fetch failed, using defaults:', error);
    return defaultProductsPageConfig;
  }
}

function toLocationTags(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => (typeof item === 'string' ? item.trim() : ''))
    .filter((item) => item.length > 0);
}

function resolveLocationPark(park: StrapiLocationPark, index: number): import('./strapi-types').ResolvedLocationPark {
  const mapsQuery = park.maps_query?.trim() || `${park.name}, ${park.address}`;
  return {
    id: `${park.id || index + 1}`,
    name: park.name?.trim() || `Skate Park ${index + 1}`,
    address: park.address?.trim() || '',
    placeCode: park.place_code?.trim() || '',
    categoryLabel: park.category_label?.trim() || 'Skatepark',
    reviewSnippet: park.review_snippet?.trim() || '',
    rating: Number.isFinite(Number(park.rating)) ? Number(park.rating) : 0,
    reviewsCount: Number.isFinite(Number(park.reviews_count)) ? Number(park.reviews_count) : 0,
    status: park.status === 'closed' ? 'closed' : 'open',
    opensText: park.opens_text?.trim() || '',
    accessType: park.access_type === 'paid' ? 'paid' : 'free',
    environmentType: park.environment_type === 'indoor' ? 'indoor' : 'outdoor',
    hasBowl: Boolean(park.has_bowl),
    hasStreet: Boolean(park.has_street),
    hasNight: Boolean(park.has_night),
    tags: toLocationTags(park.tags),
    distance: park.distance?.trim() || '',
    photoCount: Number.isFinite(Number(park.photo_count)) ? Number(park.photo_count) : 0,
    mapsQuery,
    imageUrl: park.image ? getStrapiImageUrl(park.image, 'medium') : '/placeholder.jpg',
  };
}

export async function getLocationsPage(): Promise<ResolvedLocationsPageConfig> {
  try {
    const response = await fetchAPI<StrapiSingleResponse<StrapiLocationsPage>>(
      '/locations-page',
      {
        query: {
          fields: [
            'seo_title',
            'seo_description',
            'menu_enabled',
            'menu_label',
            'page_title',
            'search_placeholder',
          ],
          populate: {
            parks: {
              populate: {
                image: { fields: ['url', 'alternativeText', 'width', 'height', 'formats'] },
              },
            },
          },
        },
        revalidate: 60,
      },
    );

    if (!response?.data) {
      return defaultLocationsPageConfig;
    }

    const d = response.data;
    const parks = Array.isArray(d.parks)
      ? d.parks.map((park, index) => resolveLocationPark(park, index))
      : defaultLocationsPageConfig.parks;

    return {
      seoTitle: d.seo_title || defaultLocationsPageConfig.seoTitle,
      seoDescription: d.seo_description || defaultLocationsPageConfig.seoDescription,
      menuEnabled: d.menu_enabled ?? defaultLocationsPageConfig.menuEnabled,
      menuLabel: d.menu_label || defaultLocationsPageConfig.menuLabel,
      pageTitle: d.page_title || defaultLocationsPageConfig.pageTitle,
      searchPlaceholder: d.search_placeholder || defaultLocationsPageConfig.searchPlaceholder,
      parks: parks.length > 0 ? parks : defaultLocationsPageConfig.parks,
    };
  } catch (error) {
    const status =
      typeof error === 'object' &&
      error !== null &&
      'status' in error &&
      typeof (error as { status?: unknown }).status === 'number'
        ? ((error as { status: number }).status as number)
        : null;
    const isNotFound =
      status === 404 ||
      (error instanceof Error && error.message.includes('(404'));

    if (isNotFound) {
      if (!hasLoggedLocationsPageNotFound && process.env.NODE_ENV !== 'production') {
        console.info(
          '[Strapi] LocationsPage endpoint not found (/api/locations-page). Using defaults.',
        );
        hasLoggedLocationsPageNotFound = true;
      }
      return defaultLocationsPageConfig;
    }

    console.warn('[Strapi] LocationsPage fetch failed, using defaults:', error);
    return defaultLocationsPageConfig;
  }
}
