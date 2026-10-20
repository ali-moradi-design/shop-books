'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { apiRequest, ApiError } from '@/shared/api';
import { requireToken } from '@/shared/lib/auth';

export async function addToCart(bookId: string, form: FormData): Promise<void> {
  const token = await requireToken(`/books/${bookId}`);
  const quantity = Math.max(1, Math.min(20, Number(form.get('quantity') ?? 1) || 1));
  try {
    await apiRequest('/cart/items', { method: 'POST', token, json: { bookId, quantity } });
  } catch (e) {
    if (e instanceof ApiError && e.status === 401)
      redirect(`/login?next=${encodeURIComponent(`/books/${bookId}`)}`);
    redirect(
      `/books/${bookId}?error=${encodeURIComponent(e instanceof ApiError ? e.message : 'Could not add to cart')}`,
    );
  }
  revalidatePath('/', 'layout');
  redirect('/cart');
}

export async function setQuantity(bookId: string, form: FormData): Promise<void> {
  const token = await requireToken('/cart');
  const quantity = Number(form.get('quantity') ?? 1);
  if (quantity <= 0) {
    await apiRequest(`/cart/items/${bookId}`, { method: 'DELETE', token });
  } else {
    await apiRequest(`/cart/items/${bookId}`, {
      method: 'PATCH',
      token,
      json: { quantity: Math.min(quantity, 20) },
    });
  }
  revalidatePath('/', 'layout');
}

export async function removeFromCart(bookId: string): Promise<void> {
  const token = await requireToken('/cart');
  await apiRequest(`/cart/items/${bookId}`, { method: 'DELETE', token });
  revalidatePath('/', 'layout');
}
