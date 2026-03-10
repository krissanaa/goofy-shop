import { StrapiMedia } from '../../../../types/content-types';

export interface DropEvent {
  id: number;
  title: string;
  release_date: string;
  is_active: boolean;
  hero_banner?: StrapiMedia;
  featured_products?: Array<{ id: number; name: string; slug: string; price: number }>;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface DropEventInput {
  title: string;
  release_date: string;
  is_active?: boolean;
  hero_banner?: number;
  featured_products?: number[];
}
