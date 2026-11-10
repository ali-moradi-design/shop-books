'use server';

import { refresh, updateTag } from 'next/cache';
import { redirect } from 'next/navigation';
import { apiRequest, ApiError } from '@/shared/api';
import { requireToken } from '@/shared/lib/auth';
import type { ActionState } from '@/shared/ui/ActionForm';

/*
 * Admin writes. The API checks the admin permission on every call, so a customer
 * (or a forged POST) gets a 403 and nothing changes. Catalog changes drop the
 * cached `books` fetches with updateTag, so the next page view shows them.
 */

const text = (f: FormData, k: string) => String(f.get(k) ?? '').trim();
const fail = (e: unknown, fallback: string): ActionState => ({
  error: e instanceof ApiError ? e.message : fallback,
});

function bookBody(form: FormData): { body?: Record<string, unknown>; error?: string } {
  const price = Math.round(Number(text(form, 'price').replace(',', '.')) * 100);
  if (!Number.isFinite(price) || price <= 0) return { error: 'Enter a price greater than zero.' };
  const seriesNumber = Number(text(form, 'seriesNumber'));
  return {
    body: {
      title: text(form, 'title'),
      author: text(form, 'author'),
      description: text(form, 'description'),
      price,
      stock: Math.max(0, Math.floor(Number(text(form, 'stock')) || 0)),
      categories: text(form, 'categories')
        .split(',')
        .map((c) => c.trim().toLowerCase())
        .filter(Boolean),
      featured: form.get('featured') === 'on',
      ...(text(form, 'isbn') ? { isbn: text(form, 'isbn') } : {}),
      ...(text(form, 'coverImageUrl') ? { coverImageUrl: text(form, 'coverImageUrl') } : {}),
      ...(text(form, 'series') ? { series: text(form, 'series') } : {}),
      ...(seriesNumber > 0 ? { seriesNumber: Math.floor(seriesNumber) } : {}),
      ...(text(form, 'sample') ? { sample: text(form, 'sample') } : {}),
    },
  };
}

export async function createBook(_prev: ActionState, form: FormData): Promise<ActionState> {
  const token = await requireToken('/admin/books/new');
  const { body, error } = bookBody(form);
  if (error) return { error };
  let id: string;
  try {
    id = (
      await apiRequest<{ data: { id: string } }>('/books', { method: 'POST', token, json: body })
    ).data.id;
  } catch (e) {
    return fail(e, 'Could not create the book.');
  }
  updateTag('books');
  redirect(`/admin/books/${id}?created=1`);
}

export async function updateBook(
  id: string,
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const token = await requireToken(`/admin/books/${id}`);
  const { body, error } = bookBody(form);
  if (error) return { error };
  try {
    await apiRequest(`/books/${encodeURIComponent(id)}`, { method: 'PATCH', token, json: body });
  } catch (e) {
    return fail(e, 'Could not save the book.');
  }
  updateTag('books');
  return { ok: 'Saved. The shop shows the change now.' };
}

/** Quick price and stock edit from the books list. */
export async function updateBookStock(
  bookId: string,
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const token = await requireToken('/admin/books');
  const stock = Math.max(0, Math.floor(Number(form.get('stock'))));
  const price = Math.round(Number(String(form.get('price')).replace(',', '.')) * 100);
  try {
    await apiRequest(`/books/${bookId}`, {
      method: 'PATCH',
      token,
      json: { stock, ...(price > 0 ? { price } : {}) },
    });
  } catch (e) {
    return fail(e, 'Update failed');
  }
  updateTag('books');
  return { ok: 'Saved' };
}

export async function deleteBook(id: string): Promise<void> {
  const token = await requireToken('/admin/books');
  await apiRequest(`/books/${encodeURIComponent(id)}`, { method: 'DELETE', token });
  updateTag('books');
  redirect('/admin/books?msg=' + encodeURIComponent('Book removed from the shop.'));
}

export interface ImportReport {
  created: number;
  updated: number;
  errors: { row: number; isbn?: string; message: string }[];
  dryRun: boolean;
}

export type ImportState = ActionState & { report?: ImportReport };

/** Checks (dry run) or imports a book CSV. */
export async function importBooks(_prev: ImportState, form: FormData): Promise<ImportState> {
  const token = await requireToken('/admin/books/import');
  const file = form.get('file');
  if (!(file instanceof File) || file.size === 0) return { error: 'Choose a CSV file first.' };
  if (file.size > 2_000_000) return { error: 'The file is too large (2 MB at most).' };
  const dryRun = form.get('mode') !== 'import';
  let report: ImportReport;
  try {
    report = (
      await apiRequest<{ data: ImportReport }>('/admin/import/books', {
        method: 'POST',
        token,
        json: { csv: await file.text(), dryRun },
      })
    ).data;
  } catch (e) {
    return fail(e, 'Could not read the file.');
  }
  if (!dryRun && report.created + report.updated > 0) updateTag('books');
  const verb = dryRun ? 'would be' : 'were';
  const summary = `${report.created} new and ${report.updated} existing books ${verb} saved${report.errors.length ? `; ${report.errors.length} rows have problems` : ''}.`;
  return report.errors.length
    ? { error: summary, report }
    : { ok: dryRun ? `${summary} Choose “Import” to save them.` : summary, report };
}

export async function updateOrderStatus(
  orderId: string,
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const token = await requireToken(`/admin/orders/${orderId}`);
  const status = text(form, 'status');
  const tracking = text(form, 'trackingNumber');
  if (status === 'shipped' && tracking.length < 4)
    return { error: 'Enter the tracking number to mark the order shipped.' };
  try {
    await apiRequest(`/orders/${orderId}/status`, {
      method: 'PATCH',
      token,
      json: {
        status,
        ...(text(form, 'note') ? { note: text(form, 'note') } : {}),
        ...(status === 'shipped'
          ? { shipment: { carrier: text(form, 'carrier') || 'Other', trackingNumber: tracking } }
          : {}),
      },
    });
  } catch (e) {
    return fail(e, 'Status change failed');
  }
  // cancelling puts copies back on the shelf
  if (status === 'cancelled') updateTag('books');
  refresh();
  return { ok: 'Order updated. The customer was emailed.' };
}

export async function updateReturn(
  id: string,
  status: string,
  _prev: ActionState,
): Promise<ActionState> {
  const token = await requireToken('/admin/returns');
  try {
    await apiRequest(`/returns/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      token,
      json: { status },
    });
  } catch (e) {
    return fail(e, 'Could not update the return.');
  }
  refresh();
  return { ok: 'Return updated.' };
}

export async function createDiscount(_prev: ActionState, form: FormData): Promise<ActionState> {
  const token = await requireToken('/admin/discounts');
  const code = text(form, 'code').toUpperCase();
  const type = text(form, 'type') === 'fixed' ? 'fixed' : 'percent';
  const value = Number(text(form, 'value'));
  if (!/^[A-Z0-9_-]{3,30}$/.test(code))
    return { error: 'Use 3–30 letters, digits, - or _ for the code.' };
  if (!(value > 0) || (type === 'percent' && value >= 100))
    return { error: type === 'percent' ? 'Enter 1–99 percent.' : 'Enter an amount above zero.' };
  const minOrder = Number(text(form, 'minOrderAmount'));
  const maxUses = Number(text(form, 'maxUses'));
  try {
    await apiRequest('/discounts', {
      method: 'POST',
      token,
      json: {
        code,
        type,
        value: type === 'fixed' ? Math.round(value * 100) : value,
        ...(minOrder > 0 ? { minOrderAmount: Math.round(minOrder * 100) } : {}),
        ...(maxUses > 0 ? { maxUses: Math.floor(maxUses) } : {}),
        ...(text(form, 'endsAt')
          ? { endsAt: new Date(`${text(form, 'endsAt')}T23:59:59Z`).toISOString() }
          : {}),
        isActive: true,
      },
    });
  } catch (e) {
    if (e instanceof ApiError && e.status === 409) return { error: 'This code already exists.' };
    return fail(e, 'Could not create the code.');
  }
  refresh();
  return { ok: `${code} is live.` };
}

export async function setDiscountActive(id: string, isActive: boolean): Promise<void> {
  const token = await requireToken('/admin/discounts');
  await apiRequest(`/discounts/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    token,
    json: { isActive },
  });
  refresh();
}

export async function setUserActive(id: string, isActive: boolean): Promise<void> {
  const token = await requireToken('/admin/customers');
  await apiRequest(`/users/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    token,
    json: { isActive },
  });
  refresh();
}

export async function deleteReview(id: string): Promise<void> {
  const token = await requireToken('/admin/reviews');
  await apiRequest(`/reviews/${encodeURIComponent(id)}`, { method: 'DELETE', token });
  // the book's average rating changed
  updateTag('books');
  refresh();
}

export async function saveRole(
  id: string | undefined,
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const token = await requireToken('/admin/roles');
  const name = text(form, 'name');
  if (name.length < 2) return { error: 'Use a name of at least 2 characters.' };
  try {
    const json = {
      name,
      description: text(form, 'description') || undefined,
      // the admin role's permissions are fixed (the API refuses changes)
      ...(form.get('locked') ? {} : { permissions: form.getAll('permissions').map(String) }),
    };
    if (id) await apiRequest(`/roles/${encodeURIComponent(id)}`, { method: 'PATCH', token, json });
    else await apiRequest('/roles', { method: 'POST', token, json });
  } catch (e) {
    return fail(e, 'Could not save the role.');
  }
  refresh();
  return { ok: id ? 'Role saved.' : `${name} created.` };
}

export async function deleteRole(id: string): Promise<void> {
  const token = await requireToken('/admin/roles');
  await apiRequest(`/roles/${encodeURIComponent(id)}`, { method: 'DELETE', token });
  refresh();
}
