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

const text = (f: FormData, k: string) => String(f.get(k) ?? '').trim();

export interface CreateBookState {
  error?: string;
}

export async function createBook(_prev: CreateBookState, form: FormData): Promise<CreateBookState> {
  const token = await requireToken('/admin/books/new');
  const price = Math.round(Number(text(form, 'price').replace(',', '.')) * 100);
  if (!Number.isFinite(price) || price <= 0) return { error: 'Enter a price greater than zero.' };
  const seriesNumber = Number(text(form, 'seriesNumber'));
  const categories = text(form, 'categories')
    .split(',')
    .map((c) => c.trim().toLowerCase())
    .filter(Boolean);
  let id: string;
  try {
    const res = await apiRequest<{ data: { id: string } }>('/books', {
      method: 'POST',
      token,
      json: {
        title: text(form, 'title'),
        author: text(form, 'author'),
        description: text(form, 'description'),
        price,
        stock: Math.max(0, Math.floor(Number(text(form, 'stock')) || 0)),
        categories,
        featured: form.get('featured') === 'on',
        ...(text(form, 'isbn') ? { isbn: text(form, 'isbn') } : {}),
        ...(text(form, 'coverImageUrl') ? { coverImageUrl: text(form, 'coverImageUrl') } : {}),
        ...(text(form, 'series') ? { series: text(form, 'series') } : {}),
        ...(seriesNumber > 0 ? { seriesNumber: Math.floor(seriesNumber) } : {}),
        ...(text(form, 'sample') ? { sample: text(form, 'sample') } : {}),
      },
    });
    id = res.data.id;
  } catch (e) {
    return { error: e instanceof ApiError ? e.message : 'Could not create the book.' };
  }
  revalidateTag('books', 'max');
  revalidatePath('/admin');
  redirect(`/books/${id}`);
}
