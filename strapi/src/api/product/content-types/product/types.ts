import { StrapiMedia } from '../../../../types/content-types';

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
  brand_name?: string;
  stock_quantity: number;
  is_limited: boolean;
  is_sold_out: boolean;
  sale_end_date?: string;
  views_count?: number;
  sold_count?: number;
  average_rating?: number;
  limit_per_customer?: number;
  waitlist_count?: number;
  specs?: ProductSpecs;
  category?: { id: number; title: string; slug: string };
  drop_events?: Array<{ id: number; title: string; release_date: string }>;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface ProductInput {
  name: string;
  slug?: string;
  description?: string;
  price: number;
  compare_at_price?: number;
  sku: string;
  badge?: 'NEW' | 'DROP' | 'SALE' | 'HOT' | 'COLLAB';
  images?: number[];
  brand_name?: string;
  stock_quantity?: number;
  is_limited?: boolean;
  is_sold_out?: boolean;
  sale_end_date?: string;
  views_count?: number;
  sold_count?: number;
  average_rating?: number;
  limit_per_customer?: number;
  waitlist_count?: number;
  specs?: ProductSpecs;
  category?: number;
  drop_events?: number[];
}
