import { apiRequest } from '@/shared/api';
import type { ApiData } from '@/shared/api';
import { fetchBooksByIds, type Book } from '@/entities/book';

export interface CartLine {
  book: Book;
  quantity: number;
}

interface RawCart {
  items: { bookId: string; quantity: number }[];
}

/** Cart lines joined with live book data (price and stock are never cached). */
export async function fetchCartLines(token: string): Promise<CartLine[]> {
  const cart = (await apiRequest<ApiData<RawCart>>('/cart', { token, cache: 'no-store' })).data;
  const books = await fetchBooksByIds(cart.items.map((i) => i.bookId));
  return cart.items.map((i, idx) => ({ book: books[idx], quantity: i.quantity }));
}

export const cartCount = (lines: { quantity: number }[]) =>
  lines.reduce((n, l) => n + l.quantity, 0);
export const cartSubtotal = (lines: CartLine[]) =>
  lines.reduce((n, l) => n + l.book.price * l.quantity, 0);
