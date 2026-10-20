import { apiRequest } from '@/shared/api';
import type { ApiPaginated } from '@/shared/api';

export interface Review {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user: { _id: string; name: string };
}

export const fetchReviews = async (bookId: string) =>
  (
    await apiRequest<ApiPaginated<Review>>(`/reviews?book=${bookId}&limit=20`, {
      cache: 'no-store',
    })
  ).data;

export const averageRating = (reviews: Review[]) =>
  reviews.length ? reviews.reduce((n, r) => n + r.rating, 0) / reviews.length : 0;
