'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { apiRequest, ApiError } from '@/shared/api';
import {
  REFRESH_COOKIE,
  requireToken,
  safeNext,
  setSession,
  type TokenPair,
} from '@/shared/lib/auth';
import type { ActionState } from '@/shared/ui/ActionForm';

const str = (f: FormData, k: string) => String(f.get(k) ?? '').trim();
const fail = (e: unknown, fallback: string): ActionState => ({
  error: e instanceof ApiError ? e.message : fallback,
});

/** Asks for a reset link; the answer is the same for unknown emails. */
export async function forgotPassword(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    await apiRequest('/auth/forgot-password', {
      method: 'POST',
      json: { email: str(form, 'email') },
    });
  } catch (e) {
    if (e instanceof ApiError && e.status === 400) return { error: 'Enter a valid email address.' };
    return fail(e, 'Could not send the email. Try again.');
  }
  return {
    ok: 'If an account uses that email, a link to reset the password is on its way. It works for one hour.',
  };
}

export async function resetPassword(
  token: string,
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const password = String(form.get('password') ?? '');
  if (password.length < 8) return { error: 'Use at least 8 characters.' };
  if (password !== String(form.get('confirm') ?? ''))
    return { error: 'The passwords do not match.' };
  try {
    await apiRequest('/auth/reset-password', { method: 'POST', json: { token, password } });
  } catch (e) {
    return fail(e, 'Could not set the password.');
  }
  redirect('/login?msg=' + encodeURIComponent('Your password is set. Sign in with it now.'));
}

/** Guest checkout: a passwordless account, signed in at once. */
export async function startGuest(_prev: ActionState, form: FormData): Promise<ActionState> {
  let res: TokenPair;
  try {
    res = await apiRequest<TokenPair>('/auth/guest', {
      method: 'POST',
      json: { name: str(form, 'name'), email: str(form, 'email') },
    });
  } catch (e) {
    if (e instanceof ApiError && e.status === 400)
      return { error: 'Enter your name and a valid email address.' };
    return fail(e, 'Could not continue as a guest.');
  }
  await setSession(res);
  redirect(safeNext(str(form, 'next')));
}

export async function updateProfile(_prev: ActionState, form: FormData): Promise<ActionState> {
  const token = await requireToken('/account');
  try {
    await apiRequest('/account', {
      method: 'PATCH',
      token,
      json: {
        name: str(form, 'name'),
        email: str(form, 'email'),
        ...(str(form, 'currentPassword')
          ? { currentPassword: String(form.get('currentPassword')) }
          : {}),
      },
    });
  } catch (e) {
    return fail(e, 'Could not save.');
  }
  revalidatePath('/', 'layout');
  return { ok: 'Saved.' };
}

export async function changePassword(_prev: ActionState, form: FormData): Promise<ActionState> {
  const token = await requireToken('/account');
  const newPassword = String(form.get('newPassword') ?? '');
  if (newPassword.length < 8) return { error: 'Use at least 8 characters.' };
  if (newPassword !== String(form.get('confirm') ?? ''))
    return { error: 'The new passwords do not match.' };
  try {
    await apiRequest('/account/password', {
      method: 'POST',
      token,
      // this browser's session stays signed in; the others are signed out
      json: {
        currentPassword: String(form.get('currentPassword') ?? ''),
        newPassword,
        keepRefreshToken: (await cookies()).get(REFRESH_COOKIE)?.value,
      },
    });
  } catch (e) {
    return fail(e, 'Could not change the password.');
  }
  return { ok: 'Password changed. Other devices were signed out.' };
}

export async function sendSetPasswordLink(_prev: ActionState): Promise<ActionState> {
  const token = await requireToken('/account');
  try {
    await apiRequest('/account/set-password-link', { method: 'POST', token, json: {} });
  } catch (e) {
    return fail(e, 'Could not send the email.');
  }
  return { ok: 'We emailed you a link to set your password.' };
}

function addressBody(form: FormData) {
  const optional = (k: string) => (str(form, k) ? { [k]: str(form, k) } : {});
  return {
    fullName: str(form, 'fullName'),
    line1: str(form, 'line1'),
    city: str(form, 'city'),
    postalCode: str(form, 'postalCode'),
    country: str(form, 'country'),
    ...optional('label'),
    ...optional('line2'),
    ...optional('state'),
    isDefault: form.get('isDefault') === 'on',
  };
}

export async function addAddress(_prev: ActionState, form: FormData): Promise<ActionState> {
  const token = await requireToken('/account');
  try {
    await apiRequest('/account/addresses', { method: 'POST', token, json: addressBody(form) });
  } catch (e) {
    if (
      e instanceof ApiError &&
      e.status === 400 &&
      /fullName|line1|city|postalCode|country/.test(JSON.stringify(e.body))
    ) {
      return { error: 'Fill in the name, address, city, postal code and country.' };
    }
    return fail(e, 'Could not save the address.');
  }
  revalidatePath('/account');
  return { ok: 'Address saved.' };
}

export async function removeAddress(id: string): Promise<void> {
  const token = await requireToken('/account');
  await apiRequest(`/account/addresses/${encodeURIComponent(id)}`, { method: 'DELETE', token });
  revalidatePath('/account');
}

export async function makeDefaultAddress(
  address: Record<string, string | boolean | undefined>,
): Promise<void> {
  const token = await requireToken('/account');
  const { id, ...rest } = address;
  await apiRequest(`/account/addresses/${encodeURIComponent(String(id))}`, {
    method: 'PUT',
    token,
    json: { ...rest, isDefault: true },
  });
  revalidatePath('/account');
}

/** Cancels an order that has not shipped; paid orders are refunded. */
export async function cancelOrder(orderId: string, _prev: ActionState): Promise<ActionState> {
  const token = await requireToken(`/orders/${orderId}`);
  try {
    await apiRequest(`/orders/${encodeURIComponent(orderId)}/cancel`, {
      method: 'POST',
      token,
      json: {},
    });
  } catch (e) {
    return fail(e, 'Could not cancel the order.');
  }
  revalidatePath(`/orders/${orderId}`);
  revalidatePath('/orders');
  return { ok: 'Order cancelled.' };
}

export async function requestReturn(
  orderId: string,
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  const token = await requireToken(`/orders/${orderId}`);
  const items = [...form.entries()]
    .filter(([k, v]) => k.startsWith('qty:') && Number(v) > 0)
    .map(([k, v]) => ({ bookId: k.slice(4), quantity: Number(v) }));
  if (items.length === 0) return { error: 'Choose at least one book to send back.' };
  try {
    await apiRequest('/returns', {
      method: 'POST',
      token,
      json: {
        orderId,
        reason: str(form, 'reason') || 'other',
        items,
        ...(str(form, 'comment') ? { comment: str(form, 'comment') } : {}),
      },
    });
  } catch (e) {
    return fail(e, 'Could not send the request.');
  }
  revalidatePath(`/orders/${orderId}`);
  return { ok: 'Return requested. We will email you once it is approved.' };
}
