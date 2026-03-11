import type { StrapiImage } from './strapi';

// ─── Shared Components ───────────────────────────────────────────────────────

export interface StrapiMenuItem {
  id: number;
  label: string;
  url: string;
  icon_name: string | null;
  open_in_new_tab: boolean;
}

export interface StrapiSocialLink {
  id: number;
  platform: 'instagram' | 'twitter' | 'youtube' | 'facebook' | 'tiktok' | 'discord';
  url: string;
}

export interface GodModeStatItem {
  value: string;
  label: string;
}

export interface GodModeTestimonial {
  quote: string;
  author: string;
}

export interface GodModePressLogo {
  name: string;
  url: string;
  logoUrl?: string;
}

export interface StrapiSiteGodMode {
  enabled: boolean | null;
  showNavbar: boolean | null;
  showMarqueeTicker: boolean | null;
  showHeroBanner: boolean | null;
  showFeaturedDrops: boolean | null;
  showCountdownTimer: boolean | null;
  showCollabSpotlight: boolean | null;
  showLookbookBanner: boolean | null;
  showShopByCategory: boolean | null;
  showTestimonials: boolean | null;
  showPressLogos: boolean | null;
  showInstagramFeed: boolean | null;
  showNumberStats: boolean | null;
  showEmailSignup: boolean | null;
  showStickyCartSidebar: boolean | null;
  showStockWarning: boolean | null;
  showPromoCodeBanner: boolean | null;
  showFooter: boolean | null;
  showCookieBar: boolean | null;
  promoBannerText: string | null;
  promoBannerCode: string | null;
  promoBannerCtaText: string | null;
  promoBannerCtaLink: string | null;
  cookieBarText: string | null;
  cookiePolicyUrl: string | null;
  cookieButtonText: string | null;
  collabTitle: string | null;
  collabDescription: string | null;
  collabCtaText: string | null;
  collabCtaLink: string | null;
  collabImage: StrapiImage | null;
  lookbookTitle: string | null;
  lookbookSubtitle: string | null;
  lookbookCtaText: string | null;
  lookbookCtaLink: string | null;
  lookbookImage: StrapiImage | null;
  statsItems: GodModeStatItem[] | null;
  testimonials: GodModeTestimonial[] | null;
  pressLogos: GodModePressLogo[] | null;
  instagramEmbedUrl: string | null;
  instagramHandle: string | null;
}

// ─── Global Config (Single Type) ─────────────────────────────────────────────

export interface StrapiGlobalConfig {
  id: number;
  documentId: string;
  siteName: string;
  siteDescription: string | null;
  favicon: StrapiImage | null;
  logo_pixel_art: StrapiImage | null;
  mainMenu: StrapiMenuItem[];
  shopMenuGodMode: boolean | null;
  shopMenuEnabled: boolean | null;
  shopMenuCategoryLimit: number | null;
  shopMenuTrendingLimit: number | null;
  siteGodMode: StrapiSiteGodMode | null;
  topBarText: string[] | null;
  isAnnouncementActive: boolean;
  barColor: string;
  themeColorPrimary: string;
  themeColorSecondary: string;
  themeBackground: string;
  themeForeground: string;
  saleEndDate?: string | null;
  copyrightText: string;
  socialLinks: StrapiSocialLink[];
  addToCartText: string;
  soldOutText: string;
}

export type ProductBadge = 'NEW' | 'DROP' | 'SALE' | 'HOT' | 'COLLAB';
export type ProductBadgeFilter = ProductBadge | 'ALL';

// ─── Dynamic Zone Section Components ─────────────────────────────────────────

export interface HeroSectionData {
  __component: 'sections.hero-section';
  id: number;
  title: string;
  subtitle: string | null;
  background_image: StrapiImage | null;
  cta_text: string | null;
  cta_link: string | null;
  secondary_cta_text: string | null;
  secondary_cta_link: string | null;
  badge_text: string | null;
  stats: { value: string; label: string; color: string }[] | null;
}

export interface SlideshowData {
  __component: 'sections.slideshow';
  id: number;
  slides: StrapiImage[] | null;
  autoplay_seconds: number;
  show_dots: boolean;
  show_overlay_text?: boolean;
  show_buttons?: boolean;
  show_stats?: boolean;
  badge_text?: string | null;
  heading_line_1?: string | null;
  heading_highlight?: string | null;
  heading_line_2?: string | null;
  description?: string | null;
  primary_cta_text?: string | null;
  primary_cta_link?: string | null;
  secondary_cta_text?: string | null;
  secondary_cta_link?: string | null;
  bottom_note_text?: string | null;
  stats?: { value: string; label: string; color: string }[] | null;
}

export interface ProductGridData {
  __component: 'sections.product-grid';
  id: number;
  title: string;
  category_filter: { id: number; title: string; slug: string } | null;
  limit: number;
  show_filters: boolean;
  god_mode?: boolean;
  show_top_stats?: boolean;
  show_sort?: boolean;
  show_search?: boolean;
  show_view_toggle?: boolean;
  show_wishlist?: boolean;
  default_sort?: 'featured' | 'price-asc' | 'price-desc' | 'top-rated' | 'newest';
  default_view?: 'grid' | 'list';
  promo_text?: string | null;
  promo_cta_text?: string | null;
}

export interface MarqueeTextData {
  __component: 'sections.marquee-text';
  id: number;
  items: string[];
  background_color: string;
  text_color: string;
  speed: 'slow' | 'normal' | 'fast';
}

export interface RetroBannerData {
  __component: 'sections.retro-banner';
  id: number;
  title: string | null;
  subtitle: string | null;
  image: StrapiImage | null;
  cta_text: string | null;
  cta_link: string | null;
  banner_style?: 'color-style' | 'original-picture' | null;
  color_name?: string | null;
  color_code?: string | null;
  style: 'mario-red' | 'luigi-green' | 'toad-blue' | 'wario-yellow';
}

export interface FeaturedDropsData {
  __component: 'sections.featured-drops';
  id: number;
  title: string;
  subtitle: string | null;
  limit: number;
  badge_filter: ProductBadgeFilter | null;
  show_timer?: boolean;
}

export interface CategoryRowData {
  __component: 'sections.category-row';
  id: number;
  title: string | null;
  items: {
    title?: string;
    subtitle?: string;
    link?: string;
    accentColor?: string;
  }[] | null;
}

export interface StreetsBannerData {
  __component: 'sections.streets-banner';
  id: number;
  eyebrow: string | null;
  title: string | null;
  subtitle: string | null;
  cta_text: string | null;
  cta_link: string | null;
  background_image: StrapiImage | null;
}

export interface NewArrivalsData {
  __component: 'sections.new-arrivals';
  id: number;
  title: string | null;
  subtitle: string | null;
  limit: number;
  badge_filter: ProductBadgeFilter | null;
}

export interface TestimonialsData {
  __component: 'sections.testimonials';
  id: number;
  title: string | null;
  items: {
    quote?: string;
    author?: string;
  }[] | null;
}

export interface SponsorStripData {
  __component: 'sections.sponsor-strip';
  id: number;
  title: string | null;
  logos: {
    name?: string;
    url?: string;
    logo?: string;
    logoUrl?: string;
  }[] | null;
}

export interface YoutubeLinksData {
  __component: 'sections.youtube-links';
  id: number;
  title: string | null;
  subtitle: string | null;
  card_style?: 'original-picture' | 'color-style' | null;
  items: {
    title?: string;
    label?: string;
    date?: string;
    publishedAt?: string;
    duration?: string;
    color_name?: string;
    colorName?: string;
    color_code?: string;
    colorCode?: string;
    url?: string;
    link?: string;
    thumbnail?: string | StrapiImage | null;
    thumbnailUrl?: string;
    image?: string;
    imageUrl?: string;
  }[] | null;
}

export type PageSection =
  | SlideshowData
  | HeroSectionData
  | MarqueeTextData
  | RetroBannerData
  | FeaturedDropsData
  | CategoryRowData
  | StreetsBannerData
  | NewArrivalsData
  | TestimonialsData
  | SponsorStripData
  | YoutubeLinksData;

// ─── Home Page (Single Type) ─────────────────────────────────────────────────

export interface StrapiHomePage {
  id: number;
  documentId: string;
  seo_title: string;
  seo_description: string;
  page_sections: PageSection[];
}

export interface StrapiProductsPage {
  id: number;
  documentId: string;
  seo_title: string;
  seo_description: string;
  show_marquee: boolean;
  show_hero_scene: boolean;
  page_title: string;
  default_category: string | null;
  default_sort: 'featured' | 'price-asc' | 'price-desc' | 'top-rated' | 'newest';
  default_view: 'grid' | 'list';
  initial_favorites_only: boolean;
  products_limit: number;
  enable_category_tabs: boolean;
  enable_sort: boolean;
  enable_search: boolean;
  enable_view_toggle: boolean;
  enable_wishlist: boolean;
  enable_top_stats: boolean;
  promo_text: string | null;
  promo_cta_text: string | null;
}

export interface StrapiLocationPark {
  id: number;
  name: string;
  address: string;
  place_code: string | null;
  category_label: string | null;
  review_snippet: string | null;
  rating: number | null;
  reviews_count: number | null;
  status: 'open' | 'closed' | null;
  opens_text: string | null;
  access_type: 'free' | 'paid' | null;
  environment_type: 'indoor' | 'outdoor' | null;
  has_bowl: boolean | null;
  has_street: boolean | null;
  has_night: boolean | null;
  tags: string[] | null;
  distance: string | null;
  photo_count: number | null;
  maps_query: string | null;
  image: StrapiImage | null;
}

export interface StrapiLocationsPage {
  id: number;
  documentId: string;
  seo_title: string;
  seo_description: string;
  menu_enabled: boolean;
  menu_label: string;
  page_title: string;
  search_placeholder: string;
  parks: StrapiLocationPark[];
}

// ─── Resolved Config (after merging with defaults) ───────────────────────────

export interface ResolvedGlobalConfig {
  siteName: string;
  siteDescription: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  mainMenu: { label: string; url: string; iconName: string | null; openInNewTab: boolean }[];
  navigation: {
    shopMenu: {
      godMode: boolean;
      enabled: boolean;
      categoryLimit: number;
      trendingLimit: number;
    };
  };
  announcement: {
    active: boolean;
    items: string[];
    barColor: string;
  };
  theme: {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
  };
  saleEndDate: string | null;
  footer: {
    copyrightText: string;
    socialLinks: { platform: string; url: string }[];
  };
  ui: {
    addToCartText: string;
    soldOutText: string;
  };
  godMode: {
    enabled: boolean;
    aboveFold: {
      showNavbar: boolean;
      showMarqueeTicker: boolean;
      showHeroBanner: boolean;
    };
    content: {
      showFeaturedDrops: boolean;
      showCountdownTimer: boolean;
      showCollabSpotlight: boolean;
      showLookbookBanner: boolean;
      showShopByCategory: boolean;
      collabTitle: string;
      collabDescription: string;
      collabCtaText: string;
      collabCtaLink: string;
      collabImageUrl: string | null;
      lookbookTitle: string;
      lookbookSubtitle: string;
      lookbookCtaText: string;
      lookbookCtaLink: string;
      lookbookImageUrl: string | null;
    };
    socialProof: {
      showTestimonials: boolean;
      testimonials: GodModeTestimonial[];
      showPressLogos: boolean;
      pressLogos: GodModePressLogo[];
      showInstagramFeed: boolean;
      instagramEmbedUrl: string;
      instagramHandle: string;
      showNumberStats: boolean;
      statsItems: GodModeStatItem[];
    };
    conversion: {
      showEmailSignup: boolean;
      showStickyCartSidebar: boolean;
      showStockWarning: boolean;
      showPromoCodeBanner: boolean;
      promoBannerText: string;
      promoBannerCode: string;
      promoBannerCtaText: string;
      promoBannerCtaLink: string;
    };
    bottom: {
      showFooter: boolean;
      showCookieBar: boolean;
      cookieBarText: string;
      cookiePolicyUrl: string;
      cookieButtonText: string;
    };
  };
}

export interface ResolvedProductsPageConfig {
  seoTitle: string;
  seoDescription: string;
  showMarquee: boolean;
  showHeroScene: boolean;
  pageTitle: string;
  defaultCategory: string;
  defaultSort: 'featured' | 'price-asc' | 'price-desc' | 'top-rated' | 'newest';
  defaultView: 'grid' | 'list';
  initialFavoritesOnly: boolean;
  productsLimit: number;
  enableCategoryTabs: boolean;
  enableSort: boolean;
  enableSearch: boolean;
  enableViewToggle: boolean;
  enableWishlist: boolean;
  enableTopStats: boolean;
  promoText: string;
  promoCtaText: string;
}

export interface ResolvedLocationPark {
  id: string;
  name: string;
  address: string;
  placeCode: string;
  categoryLabel: string;
  reviewSnippet: string;
  rating: number;
  reviewsCount: number;
  status: 'open' | 'closed';
  opensText: string;
  accessType: 'free' | 'paid';
  environmentType: 'indoor' | 'outdoor';
  hasBowl: boolean;
  hasStreet: boolean;
  hasNight: boolean;
  tags: string[];
  distance: string;
  photoCount: number;
  mapsQuery: string;
  imageUrl: string;
}

export interface ResolvedLocationsPageConfig {
  seoTitle: string;
  seoDescription: string;
  menuEnabled: boolean;
  menuLabel: string;
  pageTitle: string;
  searchPlaceholder: string;
  parks: ResolvedLocationPark[];
}
