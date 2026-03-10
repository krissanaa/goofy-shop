export interface StrapiMedia {
  id: number;
  name: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: any;
  hash: string;
  ext: string;
  mime: string;
  size: number;
  url: string;
  previewUrl?: string;
  provider: string;
  provider_metadata?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ProductSpecs {
  deckWidth?: string;
  concave?: string;
  wheelbase?: string;
  length?: string;
  material?: string;
  weight?: string;
  [key: string]: string | undefined;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  description?: string;
  price: number;
  compare_at_price?: number;
  sku: string;
  badge?: 'NEW' | 'DROP' | 'SALE' | 'HOT' | 'COLLAB';
  images?: StrapiMedia[];
  stock_quantity: number;
  is_limited: boolean;
  is_sold_out: boolean;
  specs?: ProductSpecs;
  category?: Category;
  drop_events?: DropEvent[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface Category {
  id: number;
  title: string;
  slug: string;
  thumbnail?: StrapiMedia;
  products?: Product[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface DropEvent {
  id: number;
  title: string;
  release_date: string;
  is_active: boolean;
  hero_banner?: StrapiMedia;
  featured_products?: Product[];
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface ProductAttributes {
  name: string;
  slug: string;
  description?: string;
  price: number;
  compare_at_price?: number;
  sku: string;
  badge?: 'NEW' | 'DROP' | 'SALE' | 'HOT' | 'COLLAB';
  images?: StrapiMedia[];
  stock_quantity: number;
  is_limited: boolean;
  is_sold_out: boolean;
  specs?: ProductSpecs;
  category?: { data: { id: number; attributes: CategoryAttributes } };
  drop_events?: { data: Array<{ id: number; attributes: DropEventAttributes }> };
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface CategoryAttributes {
  title: string;
  slug: string;
  thumbnail?: StrapiMedia;
  products?: { data: Array<{ id: number; attributes: ProductAttributes }> };
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface DropEventAttributes {
  title: string;
  release_date: string;
  is_active: boolean;
  hero_banner?: StrapiMedia;
  featured_products?: { data: Array<{ id: number; attributes: ProductAttributes }> };
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface StrapiResponse<T> {
  data: {
    id: number;
    attributes: T;
  };
  meta: Record<string, any>;
}

export interface StrapiCollectionResponse<T> {
  data: Array<{
    id: number;
    attributes: T;
  }>;
  meta: {
    pagination?: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}
