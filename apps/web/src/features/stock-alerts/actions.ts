'use server';

import { apiRequest, ApiError } from '@/shared/api';
import type { ActionState } from '@/shared/ui/ActionForm';

/** "Email me when it is back in stock". */
export async function notifyMe(
  bookId: string,
  _prev: ActionState,
  form: FormData,
): Promise<ActionState> {
  try {
    const res = await apiRequest<{ message: string }>(
      `/books/${encodeURIComponent(bookId)}/stock-alerts`,
      {
        method: 'POST',
        json: { email: String(form.get('email') ?? '').trim() },
      },
    );
    return { ok: res.message };
  } catch (e) {
    if (e instanceof ApiError && e.status === 400) return { error: 'Enter a valid email address.' };
    return { error: e instanceof ApiError ? e.message : 'Could not save. Try again.' };
  }
}
