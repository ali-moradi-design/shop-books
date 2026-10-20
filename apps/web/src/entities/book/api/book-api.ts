import { apiRequest } from '@/shared/api';
import type { ApiData, ApiPaginated } from '@/shared/api';
import { toQuery } from '@/shared/lib/query';
import type { Book, BookListParams, Facets } from '../model/types';

const cached = {
  cache: 'force-cache' as RequestCache,
  next: { revalidate: 3600, tags: ['books'] },
};

export const fetchBooks = (params: BookListParams = {}) =>
  apiRequest<ApiPaginated<Book>>(`/books${toQuery({ limit: 12, ...params })}`, cached);

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
