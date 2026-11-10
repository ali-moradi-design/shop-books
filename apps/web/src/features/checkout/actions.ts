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
  const shippingAddress = {
    fullName: str(form, 'fullName'),
    line1: str(form, 'line1'),
    ...(str(form, 'line2') ? { line2: str(form, 'line2') } : {}),
    city: str(form, 'city'),
    ...(str(form, 'state') ? { state: str(form, 'state') } : {}),
    postalCode: str(form, 'postalCode'),
    country: str(form, 'country'),
  };
  let order: Order;
  try {
    const res = await apiRequest<ApiData<Order>>('/cart/checkout', {
      method: 'POST',
      token,
      json: { shippingAddress, ...(code ? { discountCode: code } : {}) },
    });
    order = res.data;
  } catch (e) {
    return { error: e instanceof ApiError ? e.message : 'Could not place the order.' };
  }
  if (form.get('saveAddress') === 'on') {
    // a convenience: the order goes ahead even if saving the address fails
    await apiRequest('/account/addresses', { method: 'POST', token, json: shippingAddress }).catch(
      () => {},
    );
  }
  revalidatePath('/', 'layout');
  redirect(await checkoutUrl(token, order.id));
}

/** The Stripe Checkout (or simulator) URL for an order; the order page on failure. */
async function checkoutUrl(token: string, orderId: string): Promise<string> {
  try {
    const res = await apiRequest<ApiData<{ url: string }>>(
      `/orders/${encodeURIComponent(orderId)}/checkout`,
      { method: 'POST', token, json: {} },
    );
    return res.data.url;
  } catch {
    return `/orders/${orderId}?error=${encodeURIComponent('Could not open the payment page. Try again.')}`;
  }
}

/** "Pay now" on an unpaid order: opens Stripe Checkout again (the open session is reused). */
export async function startPayment(orderId: string): Promise<void> {
  const token = await requireToken(`/orders/${orderId}`);
  redirect(await checkoutUrl(token, orderId));
}

/** The simulated Stripe Checkout page: the API answers like Stripe and sends the webhook. */
export async function paySimulated(
  sessionId: string,
  _prev: FormState,
  form: FormData,
): Promise<FormState> {
  const token = await requireToken(`/pay/${sessionId}`);
  let redirectUrl: string;
  try {
    const res = await apiRequest<ApiData<{ redirectUrl: string }>>(
      `/payments/simulator/sessions/${encodeURIComponent(sessionId)}/pay`,
      {
        method: 'POST',
        token,
        json: { card: str(form, 'card'), expiry: str(form, 'expiry'), cvc: str(form, 'cvc') },
      },
    );
    redirectUrl = res.data.redirectUrl;
  } catch (e) {
    return { error: e instanceof ApiError ? e.message : 'Payment failed' };
  }
  revalidatePath('/orders');
  redirect(redirectUrl);
}
