'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { apiRequest, ApiError } from '@/shared/api';
import type { ApiData } from '@/shared/api';
import { requireToken } from '@/shared/lib/auth';
import type { Order } from '@/entities/order';
import type { FormState } from '@/features/auth/actions';

const str = (f: FormData, k: string) => String(f.get(k) ?? '').trim();

export async function placeOrder(_prev: FormState, form: FormData): Promise<FormState> {
  const token = await requireToken('/checkout');
  const code = str(form, 'discountCode');
  let order: Order;
  try {
    const res = await apiRequest<ApiData<Order>>('/cart/checkout', {
      method: 'POST',
      token,
      json: {
        shippingAddress: {
          fullName: str(form, 'fullName'),
          line1: str(form, 'line1'),
          ...(str(form, 'line2') ? { line2: str(form, 'line2') } : {}),
          city: str(form, 'city'),
          ...(str(form, 'state') ? { state: str(form, 'state') } : {}),
          postalCode: str(form, 'postalCode'),
          country: str(form, 'country'),
        },
        ...(code ? { discountCode: code } : {}),
      },
    });
    order = res.data;
  } catch (e) {
    return { error: e instanceof ApiError ? e.message : 'Could not place the order.' };
  }
  revalidatePath('/', 'layout');
  redirect(`/pay/${order.id}`);
}

/** Fake payment gateway: the only PaymentGateway implementation in this demo. */
export async function payOrder(orderId: string, form: FormData): Promise<void> {
  const token = await requireToken(`/pay/${orderId}`);
  if (String(form.get('outcome')) === 'decline') {
    redirect(`/pay/${orderId}?declined=1`);
  }
  try {
    await apiRequest(`/orders/${orderId}/pay`, { method: 'POST', token, json: {} });
  } catch (e) {
    redirect(
      `/pay/${orderId}?error=${encodeURIComponent(e instanceof ApiError ? e.message : 'Payment failed')}`,
    );
  }
  revalidatePath('/orders');
  redirect(`/orders/${orderId}?paid=1`);
}
