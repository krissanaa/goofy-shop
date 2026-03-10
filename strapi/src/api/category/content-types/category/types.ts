import { StrapiMedia } from '../../../../types/content-types';

export interface Category {
  id: number;
  title: string;
  slug: string;
  thumbnail?: StrapiMedia;
  products?: Array<{ id: number; name: string; slug: string; price: number }>;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface CategoryInput {
  title: string;
  slug?: string;
  thumbnail?: number;
  products?: number[];
}
