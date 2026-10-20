import type { Book } from '../../../domain/book/book.entity';

/** HTTP-safe book shape (no deletedAt internals required). */
export interface BookDto {
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
  /** Present only on the single-book endpoint. */
  sample?: string;
  createdAt: Date;
  updatedAt: Date;
}

export function toBookDto(book: Book): BookDto {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    description: book.description,
    isbn: book.isbn,
    price: book.price,
    currency: book.currency,
    stock: book.stock,
    coverImageUrl: book.coverImageUrl,
    categories: book.categories,
    featured: book.featured,
    featuredOrder: book.featuredOrder,
    series: book.series,
    seriesNumber: book.seriesNumber,
    createdAt: book.createdAt,
    updatedAt: book.updatedAt,
  };
}
