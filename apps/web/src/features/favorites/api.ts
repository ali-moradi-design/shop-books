import { apiRequest } from '@/shared/api';
import type { ApiData } from '@/shared/api';

export interface Favorite {
  bookId: string;
  populated?: {
    book?: { id: string; title: string; author: string; price: number; coverImageUrl?: string };
  };
}

export const fetchFavorites = async (token: string) =>
  (await apiRequest<ApiData<Favorite[]>>('/favorites', { token, cache: 'no-store' })).data;
