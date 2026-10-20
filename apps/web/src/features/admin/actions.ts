'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { apiRequest, ApiError } from '@/shared/api';
import { requireToken } from '@/shared/lib/auth';

const back = (msg?: string) => redirect(`/admin${msg ? `?msg=${encodeURIComponent(msg)}` : ''}`);

export async function updateBookStock(bookId: string, form: FormData): Promise<void> {
  const token = await requireToken('/admin');
  const stock = Math.max(0, Math.floor(Number(form.get('stock'))));
  const price = Math.round(Number(String(form.get('price')).replace(',', '.')) * 100);
  try {
    await apiRequest(`/books/${bookId}`, {
      method: 'PATCH',
      token,
      json: { stock, ...(price > 0 ? { price } : {}) },
    });
  } catch (e) {
    back(e instanceof ApiError ? e.message : 'Update failed');
  }
  revalidateTag('books', 'max');
  revalidatePath('/admin');
  back('Book updated');
}

export async function updateOrderStatus(orderId: string, form: FormData): Promise<void> {
  const token = await requireToken('/admin');
  try {
    await apiRequest(`/orders/${orderId}/status`, {
      method: 'PATCH',
      token,
      json: { status: String(form.get('status')) },
    });
  } catch (e) {
    back(e instanceof ApiError ? e.message : 'Status change failed');
  }
  revalidatePath('/admin');
  back('Order updated');
}
