'use server';

import { apiRequest, ApiError } from '@/shared/api';
import type { ActionState } from '@/shared/ui/ActionForm';

export async function subscribe(_prev: ActionState, form: FormData): Promise<ActionState> {
  try {
    await apiRequest('/newsletter', {
      method: 'POST',
      json: { email: String(form.get('email') ?? '').trim(), source: 'footer' },
    });
  } catch (e) {
    if (e instanceof ApiError && e.status === 400) return { error: 'Enter a valid email address.' };
    return { error: 'Could not sign you up. Try again.' };
  }
  return { ok: 'Thanks, you are on the list. Check your inbox for a welcome note.' };
}

export async function unsubscribe(token: string, _prev: ActionState): Promise<ActionState> {
  try {
    await apiRequest('/newsletter/unsubscribe', { method: 'POST', json: { token } });
  } catch (e) {
    return { error: e instanceof ApiError ? e.message : 'Something went wrong.' };
  }
  return { ok: 'You are unsubscribed. We will not email you again.' };
}
