import { apiRequest } from '@/shared/api';
import type { ApiData, ApiPaginated } from '@/shared/api';
import { toQuery } from '@/shared/lib/query';
import type { Book, BookListParams, Facets } from '../model/types';

const cached = {
  cache: 'force-cache' as RequestCache,
  next: { revalidate: 3600, tags: ['books'] },
};

export const fetchBooks = (params: BookListParams = {}) =>
  apiRequest<ApiPaginated<Book>>(`/books${toQuery({ limit: 20, ...params })}`, cached);

/** Every book, page by page (the API allows at most 100 per request): sitemap, static params. */
export async function fetchAllBooks(): Promise<Book[]> {
  const first = await fetchBooks({ limit: 100, page: 1 });
  const rest = await Promise.all(
    Array.from({ length: first.meta.pages - 1 }, (_, i) => fetchBooks({ limit: 100, page: i + 2 })),
  );
  return [first, ...rest].flatMap((r) => r.data);
}

export const fetchFeatured = async () =>
  (await apiRequest<ApiData<Book[]>>('/books/featured', cached)).data;

export const fetchFacets = async () =>
  (await apiRequest<ApiData<Facets>>('/books/facets', cached)).data;

export const fetchBook = async (id: string) =>
  (await apiRequest<ApiData<Book>>(`/books/${id}`, cached)).data;

/** Live stock and price: never cached (PPR dynamic hole). */
export const fetchBookLive = async (id: string) =>
  (await apiRequest<ApiData<Book>>(`/books/${id}`, { cache: 'no-store' })).data;

export const fetchBooksByIds = (ids: string[]) => Promise.all(ids.map((id) => fetchBookLive(id)));
