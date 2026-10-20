export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  isbn?: string;
  price: number;
  currency: string;
  stock: number;
  coverImageUrl?: string;
  categories?: string[];
  featured: boolean;
  featuredOrder?: number;
  series?: string;
  seriesNumber?: number;
  sample?: string;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateBookInput {
  title: string;
  author: string;
  description: string;
  isbn?: string;
  price: number;
  currency?: string;
  stock?: number;
  coverImageUrl?: string;
  categories?: string[];
  featured?: boolean;
  featuredOrder?: number;
  series?: string;
  seriesNumber?: number;
  sample?: string;
}

export type UpdateBookInput = Partial<CreateBookInput>;

export interface BookListFilter {
  q?: string;
  category?: string;
  author?: string;
  series?: string;
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
  featured?: boolean;
  page?: number;
  limit?: number;
  sort?: 'price' | 'title' | 'createdAt';
  order?: 'asc' | 'desc';
}
