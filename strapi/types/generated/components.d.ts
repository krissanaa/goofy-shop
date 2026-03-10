import type { Schema, Struct } from '@strapi/strapi';

export interface LocationParkItem extends Struct.ComponentSchema {
  collectionName: 'components_location_park_items';
  info: {
    description: 'A single skatepark entry for the locations page';
    displayName: 'Park Item';
  };
  attributes: {
    access_type: Schema.Attribute.Enumeration<['free', 'paid']> &
      Schema.Attribute.DefaultTo<'free'>;
    address: Schema.Attribute.String & Schema.Attribute.Required;
    category_label: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Skatepark'>;
    distance: Schema.Attribute.String & Schema.Attribute.DefaultTo<''>;
    environment_type: Schema.Attribute.Enumeration<['indoor', 'outdoor']> &
      Schema.Attribute.DefaultTo<'outdoor'>;
    has_bowl: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    has_night: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    has_street: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    image: Schema.Attribute.Media<'images'>;
    maps_query: Schema.Attribute.String;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    opens_text: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Opens 4 PM'>;
    photo_count: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    place_code: Schema.Attribute.String;
    rating: Schema.Attribute.Decimal &
      Schema.Attribute.SetMinMax<
        {
          max: 5;
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<4.5>;
    review_snippet: Schema.Attribute.Text;
    reviews_count: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          min: 0;
        },
        number
      > &
      Schema.Attribute.DefaultTo<0>;
    status: Schema.Attribute.Enumeration<['open', 'closed']> &
      Schema.Attribute.DefaultTo<'open'>;
    tags: Schema.Attribute.JSON;
  };
}

export interface SectionsCategoryRow extends Struct.ComponentSchema {
  collectionName: 'components_sections_category_rows';
  info: {
    description: 'Homepage category cards row';
    displayName: 'Category Row';
  };
  attributes: {
    items: Schema.Attribute.JSON;
    title: Schema.Attribute.String & Schema.Attribute.DefaultTo<'CATEGORY'>;
  };
}

export interface SectionsFeaturedDrops extends Struct.ComponentSchema {
  collectionName: 'components_sections_featured_drops';
  info: {
    description: 'Configurable featured drops section block';
    displayName: 'Featured Drops';
  };
  attributes: {
    badge_filter: Schema.Attribute.Enumeration<
      ['ALL', 'NEW', 'DROP', 'SALE', 'HOT', 'COLLAB']
    > &
      Schema.Attribute.DefaultTo<'DROP'>;
    limit: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 12;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<3>;
    show_timer: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    subtitle: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Latest drop picks'>;
    title: Schema.Attribute.String & Schema.Attribute.DefaultTo<'HYPE DROPS'>;
  };
}

export interface SectionsHeroSection extends Struct.ComponentSchema {
  collectionName: 'components_sections_hero_sections';
  info: {
    description: 'Full-width hero with title, subtitle, CTA and background';
    displayName: 'Hero Section';
  };
  attributes: {
    background_image: Schema.Attribute.Media<'images'>;
    badge_text: Schema.Attribute.String;
    cta_link: Schema.Attribute.String;
    cta_text: Schema.Attribute.String;
    secondary_cta_link: Schema.Attribute.String;
    secondary_cta_text: Schema.Attribute.String;
    stats: Schema.Attribute.JSON;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SectionsMarqueeText extends Struct.ComponentSchema {
  collectionName: 'components_sections_marquee_texts';
  info: {
    description: 'Scrolling announcement/hype text banner';
    displayName: 'Marquee Text';
  };
  attributes: {
    background_color: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'#e52521'>;
    items: Schema.Attribute.JSON & Schema.Attribute.Required;
    speed: Schema.Attribute.Enumeration<['slow', 'normal', 'fast']> &
      Schema.Attribute.DefaultTo<'normal'>;
    text_color: Schema.Attribute.String & Schema.Attribute.DefaultTo<'#ffffff'>;
  };
}

export interface SectionsNewArrivals extends Struct.ComponentSchema {
  collectionName: 'components_sections_new_arrivals';
  info: {
    description: 'Homepage latest products grid section';
    displayName: 'New Arrivals';
  };
  attributes: {
    badge_filter: Schema.Attribute.Enumeration<
      ['ALL', 'NEW', 'DROP', 'SALE', 'HOT', 'COLLAB']
    > &
      Schema.Attribute.DefaultTo<'NEW'>;
    limit: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 12;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<4>;
    subtitle: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Just landed'>;
    title: Schema.Attribute.String & Schema.Attribute.DefaultTo<'NEW ARRIVALS'>;
  };
}

export interface SectionsProductGrid extends Struct.ComponentSchema {
  collectionName: 'components_sections_product_grids';
  info: {
    description: 'Filterable product grid section';
    displayName: 'Product Grid';
  };
  attributes: {
    category_filter: Schema.Attribute.Relation<
      'oneToOne',
      'api::category.category'
    >;
    default_sort: Schema.Attribute.Enumeration<
      ['featured', 'price-asc', 'price-desc', 'top-rated', 'newest']
    > &
      Schema.Attribute.DefaultTo<'featured'>;
    default_view: Schema.Attribute.Enumeration<['grid', 'list']> &
      Schema.Attribute.DefaultTo<'grid'>;
    god_mode: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    limit: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 1;
        },
        number
      > &
      Schema.Attribute.DefaultTo<12>;
    promo_cta_text: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Grab Deal ->'>;
    promo_text: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Buy 2 get 1 free on selected drops'>;
    show_filters: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    show_search: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    show_sort: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    show_top_stats: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    show_view_toggle: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    show_wishlist: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    title: Schema.Attribute.String &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'Our Products'>;
  };
}

export interface SectionsRetroBanner extends Struct.ComponentSchema {
  collectionName: 'components_sections_retro_banners';
  info: {
    description: '8-bit styled promotional banner';
    displayName: 'Retro Banner';
  };
  attributes: {
    banner_style: Schema.Attribute.Enumeration<
      ['color-style', 'original-picture']
    > &
      Schema.Attribute.DefaultTo<'color-style'>;
    color_code: Schema.Attribute.String;
    color_name: Schema.Attribute.String & Schema.Attribute.DefaultTo<'red'>;
    cta_link: Schema.Attribute.String;
    cta_text: Schema.Attribute.String;
    image: Schema.Attribute.Media<'images'>;
    style: Schema.Attribute.Enumeration<
      ['mario-red', 'luigi-green', 'toad-blue', 'wario-yellow']
    > &
      Schema.Attribute.DefaultTo<'mario-red'>;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String;
  };
}

export interface SectionsSlideshow extends Struct.ComponentSchema {
  collectionName: 'components_sections_slideshows';
  info: {
    description: 'Homepage hero slideshow with admin-managed images';
    displayName: 'Slideshow';
  };
  attributes: {
    autoplay_seconds: Schema.Attribute.Integer &
      Schema.Attribute.SetMinMax<
        {
          max: 20;
          min: 2;
        },
        number
      > &
      Schema.Attribute.DefaultTo<6>;
    badge_text: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'SS26 Collection'>;
    description: Schema.Attribute.Text &
      Schema.Attribute.DefaultTo<'Premium skate hardware and streetwear essentials. Limited drops, exclusive collabs, zero compromises.'>;
    heading_highlight: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'STREETS.'>;
    heading_line_1: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'BUILT FOR THE'>;
    heading_line_2: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'WORN BY THE CULTURE.'>;
    primary_cta_link: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'/drop'>;
    primary_cta_text: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Shop the Drop'>;
    secondary_cta_link: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'#products'>;
    secondary_cta_text: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Explore Collection'>;
    show_buttons: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    show_dots: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    show_overlay_text: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    show_stats: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    slides: Schema.Attribute.Media<'images', true>;
    stats: Schema.Attribute.JSON &
      Schema.Attribute.DefaultTo<
        [
          {
            color: '#e52521';
            label: 'Products';
            value: '500+';
          },
          {
            color: '#049cd8';
            label: 'Skaters';
            value: '12K+';
          },
          {
            color: '#43b047';
            label: 'Authentic';
            value: '100%';
          },
        ]
      >;
  };
}

export interface SectionsSponsorStrip extends Struct.ComponentSchema {
  collectionName: 'components_sections_sponsor_strips';
  info: {
    description: 'Homepage trusted by the culture logo marquee section';
    displayName: 'Sponsor Strip';
  };
  attributes: {
    logos: Schema.Attribute.JSON;
    title: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'TRUSTED BY THE CULTURE'>;
  };
}

export interface SectionsStreetsBanner extends Struct.ComponentSchema {
  collectionName: 'components_sections_streets_banners';
  info: {
    description: 'Built for the streets hero-style banner section';
    displayName: 'Streets Banner';
  };
  attributes: {
    background_image: Schema.Attribute.Media<'images'>;
    cta_link: Schema.Attribute.String & Schema.Attribute.DefaultTo<'/products'>;
    cta_text: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Shop The Drop'>;
    eyebrow: Schema.Attribute.String & Schema.Attribute.DefaultTo<'GOOFY SHOP'>;
    subtitle: Schema.Attribute.Text &
      Schema.Attribute.DefaultTo<'High-performance gear made for daily sessions.'>;
    title: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'BUILT FOR THE STREETS'>;
  };
}

export interface SectionsTestimonials extends Struct.ComponentSchema {
  collectionName: 'components_sections_testimonials';
  info: {
    description: 'Homepage customer review cards section';
    displayName: 'Testimonials';
  };
  attributes: {
    items: Schema.Attribute.JSON;
    title: Schema.Attribute.String & Schema.Attribute.DefaultTo<'THE VERDICT'>;
  };
}

export interface SectionsYoutubeLinks extends Struct.ComponentSchema {
  collectionName: 'components_sections_youtube_links';
  info: {
    description: 'Homepage grid of YouTube video links';
    displayName: 'YouTube Links';
  };
  attributes: {
    card_style: Schema.Attribute.Enumeration<
      ['original-picture', 'color-style']
    > &
      Schema.Attribute.DefaultTo<'original-picture'>;
    items: Schema.Attribute.Component<'shared.youtube-link-item', true>;
    subtitle: Schema.Attribute.String;
    title: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'YOUTUBE LINKS'>;
  };
}

export interface SettingsSiteGodMode extends Struct.ComponentSchema {
  collectionName: 'components_settings_site_god_modes';
  info: {
    description: 'Central controls for section visibility and conversion modules';
    displayName: 'Site God Mode';
  };
  attributes: {
    collabCtaLink: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'/products'>;
    collabCtaText: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Explore Collab'>;
    collabDescription: Schema.Attribute.Text &
      Schema.Attribute.DefaultTo<'Featuring our latest collab drop.'>;
    collabImage: Schema.Attribute.Media<'images'>;
    collabTitle: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Collab Spotlight'>;
    cookieBarText: Schema.Attribute.Text &
      Schema.Attribute.DefaultTo<'This site uses cookies to improve your experience.'>;
    cookieButtonText: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Accept'>;
    cookiePolicyUrl: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'/privacy'>;
    enabled: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    instagramEmbedUrl: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'https://www.instagram.com'>;
    instagramHandle: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'@goofyshop'>;
    lookbookCtaLink: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'/products'>;
    lookbookCtaText: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'View Lookbook'>;
    lookbookImage: Schema.Attribute.Media<'images'>;
    lookbookSubtitle: Schema.Attribute.Text &
      Schema.Attribute.DefaultTo<'Lifestyle visuals from the latest collection.'>;
    lookbookTitle: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Lookbook'>;
    pressLogos: Schema.Attribute.JSON;
    promoBannerCode: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'GOOFY20'>;
    promoBannerCtaLink: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'/products'>;
    promoBannerCtaText: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Shop Promo'>;
    promoBannerText: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Use code GOOFY20 for 20% off'>;
    showCollabSpotlight: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    showCookieBar: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    showCountdownTimer: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    showEmailSignup: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    showFeaturedDrops: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    showFooter: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    showHeroBanner: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    showInstagramFeed: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    showLookbookBanner: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    showMarqueeTicker: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    showNavbar: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    showNumberStats: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    showPressLogos: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    showPromoCodeBanner: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    showShopByCategory: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    showStickyCartSidebar: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    showStockWarning: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<true>;
    showTestimonials: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    statsItems: Schema.Attribute.JSON;
    testimonials: Schema.Attribute.JSON;
  };
}

export interface SharedMenuItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_menu_items';
  info: {
    description: 'Navigation menu link';
    displayName: 'Menu Item';
  };
  attributes: {
    icon_name: Schema.Attribute.String;
    label: Schema.Attribute.String & Schema.Attribute.Required;
    open_in_new_tab: Schema.Attribute.Boolean &
      Schema.Attribute.DefaultTo<false>;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedSocialLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_social_links';
  info: {
    description: 'Social media link with platform name';
    displayName: 'Social Link';
  };
  attributes: {
    platform: Schema.Attribute.Enumeration<
      ['instagram', 'twitter', 'youtube', 'facebook', 'tiktok', 'discord']
    > &
      Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedYoutubeLinkItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_youtube_link_items';
  info: {
    description: 'Single YouTube card entry for homepage section';
    displayName: 'YouTube Link Item';
  };
  attributes: {
    color_code: Schema.Attribute.String;
    color_name: Schema.Attribute.String & Schema.Attribute.DefaultTo<'red'>;
    date: Schema.Attribute.Date;
    duration: Schema.Attribute.String;
    label: Schema.Attribute.String & Schema.Attribute.DefaultTo<'YOUTUBE'>;
    thumbnail: Schema.Attribute.Media<'images'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'location.park-item': LocationParkItem;
      'sections.category-row': SectionsCategoryRow;
      'sections.featured-drops': SectionsFeaturedDrops;
      'sections.hero-section': SectionsHeroSection;
      'sections.marquee-text': SectionsMarqueeText;
      'sections.new-arrivals': SectionsNewArrivals;
      'sections.product-grid': SectionsProductGrid;
      'sections.retro-banner': SectionsRetroBanner;
      'sections.slideshow': SectionsSlideshow;
      'sections.sponsor-strip': SectionsSponsorStrip;
      'sections.streets-banner': SectionsStreetsBanner;
      'sections.testimonials': SectionsTestimonials;
      'sections.youtube-links': SectionsYoutubeLinks;
      'settings.site-god-mode': SettingsSiteGodMode;
      'shared.menu-item': SharedMenuItem;
      'shared.social-link': SharedSocialLink;
      'shared.youtube-link-item': SharedYoutubeLinkItem;
    }
  }
}
