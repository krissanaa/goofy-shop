export interface CMSImage {
  id: string | number;
  url: string;
  alternativeText: string | null;
  width: number;
  height: number;
}

export type ProductBadge = 'NEW' | 'DROP' | 'SALE' | 'HOT' | 'COLLAB';
export type ProductBadgeFilter = ProductBadge | 'ALL';

export interface PageSection {
  __component: string;
  id: number;
  [key: string]: any;
}

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
      testimonials: { quote: string; author: string }[];
      showPressLogos: boolean;
      pressLogos: { name: string; url: string; logoUrl?: string }[];
      showInstagramFeed: boolean;
      instagramEmbedUrl: string;
      instagramHandle: string;
      showNumberStats: boolean;
      statsItems: { value: string; label: string }[];
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
  defaultSort: string;
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
