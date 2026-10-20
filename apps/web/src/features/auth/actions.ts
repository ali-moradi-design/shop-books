'use server';

import { redirect } from 'next/navigation';
import { apiRequest, ApiError } from '@/shared/api';
import { clearSession, safeNext, setSession, type TokenPair } from '@/shared/lib/auth';

export interface FormState {
  error?: string;
}

const str = (f: FormData, k: string) => String(f.get(k) ?? '').trim();

export async function login(_prev: FormState, form: FormData): Promise<FormState> {
  let tokens: TokenPair;
  try {
    tokens = await apiRequest<TokenPair>('/auth/login', {
      method: 'POST',
      json: { email: str(form, 'email'), password: String(form.get('password') ?? '') },
    });
  } catch (e) {
    return {
      error:
        e instanceof ApiError && e.status === 401
          ? 'Wrong email or password.'
          : 'Could not sign in. Try again.',
    };
  }
  await setSession(tokens);
  redirect(safeNext(str(form, 'next')));
}

export async function register(_prev: FormState, form: FormData): Promise<FormState> {
  let tokens: TokenPair;
  try {
    tokens = await apiRequest<TokenPair>('/auth/register', {
      method: 'POST',
      json: {
        name: str(form, 'name'),
        email: str(form, 'email'),
        password: String(form.get('password') ?? ''),
      },
    });
  } catch (e) {
    if (e instanceof ApiError && e.status === 409)
      return { error: 'An account with this email already exists.' };
    if (e instanceof ApiError && e.status === 400)
      return {
        error: 'Check your details: name 2+ characters, valid email, password 8+ characters.',
      };
    return { error: 'Could not create the account. Try again.' };
  }
  await setSession(tokens);
  redirect(safeNext(str(form, 'next')));
}

export async function logout(): Promise<void> {
  await clearSession();
  redirect('/');
}
