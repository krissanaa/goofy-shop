import { StrapiMedia } from '../../../../types/content-types';

export interface DropEvent {
  id: number;
  title: string;
  description?: string;
  release_date: string;
  end_date?: string;
  entered_count?: number;
  is_active: boolean;
  hero_banner?: StrapiMedia;
  featured_products?: Array<{ id: number; name: string; slug: string; price: number }>;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface DropEventInput {
  title: string;
  description?: string;
  release_date: string;
  end_date?: string;
  entered_count?: number;
  is_active?: boolean;
  hero_banner?: number;
  featured_products?: number[];
}
