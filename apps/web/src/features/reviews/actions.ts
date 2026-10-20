'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { apiRequest, ApiError } from '@/shared/api';
import { requireToken } from '@/shared/lib/auth';

export async function postReview(bookId: string, form: FormData): Promise<void> {
  const token = await requireToken(`/books/${bookId}`);
  const rating = Number(form.get('rating'));
  const comment = String(form.get('comment') ?? '').trim();
  try {
    await apiRequest('/reviews', {
      method: 'POST',
      token,
      json: { book: bookId, rating, ...(comment ? { comment } : {}) },
    });
  } catch (e) {
    redirect(
      `/books/${bookId}?error=${encodeURIComponent(e instanceof ApiError ? e.message : 'Could not post the review')}#reviews`,
    );
  }
  revalidatePath(`/books/${bookId}`);
  redirect(`/books/${bookId}#reviews`);
}
