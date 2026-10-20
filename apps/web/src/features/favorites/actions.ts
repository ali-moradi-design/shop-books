'use server';

import { revalidatePath } from 'next/cache';
import { apiRequest } from '@/shared/api';
import { requireToken } from '@/shared/lib/auth';

export async function toggleFavorite(bookId: string, saved: boolean): Promise<void> {
  const token = await requireToken(`/books/${bookId}`);
  if (saved) {
    await apiRequest(`/favorites/${bookId}`, { method: 'DELETE', token });
  } else {
    await apiRequest('/favorites', { method: 'POST', token, json: { bookId } }).catch(
      () => undefined,
    );
  }
  revalidatePath(`/books/${bookId}`);
  revalidatePath('/reading-list');
}
