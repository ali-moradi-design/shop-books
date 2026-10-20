export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  isbn?: string;
  /** Minor units (cents). */
  price: number;
  currency: string;
  stock: number;
  coverImageUrl?: string;
  categories?: string[];
  featured: boolean;
  series?: string;
  seriesNumber?: number;
  /** First pages for "Look inside"; only on the single-book endpoint. */
  sample?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BookListParams {
  q?: string;
  category?: string;
  author?: string;
  series?: string;
  page?: number;
  limit?: number;
  sort?: 'price' | 'title' | 'createdAt';
  order?: 'asc' | 'desc';
  inStock?: boolean;
  featured?: boolean;
  minPrice?: number;
  maxPrice?: number;
}

export interface Facets {
  categories: { name: string; count: number }[];
  authors: { name: string; count: number }[];
  series: { name: string; count: number }[];
}
