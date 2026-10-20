import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { apiRequest } from '@/shared/api';
import type { ApiData } from '@/shared/api';

export const ACCESS_COOKIE = 'sb_access';
export const REFRESH_COOKIE = 'sb_refresh';

const secure = process.env.COOKIE_SECURE === 'true';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface Me {
  id: string;
  name: string;
  email: string;
  roles: { id: string; name: string }[];
}

export async function setSession(tokens: TokenPair): Promise<void> {
  const jar = await cookies();
  const base = { httpOnly: true, sameSite: 'lax' as const, secure, path: '/' };
  jar.set(ACCESS_COOKIE, tokens.accessToken, { ...base, maxAge: 60 * 60 * 12 });
  jar.set(REFRESH_COOKIE, tokens.refreshToken, { ...base, maxAge: 60 * 60 * 24 * 7 });
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
}

export async function getToken(): Promise<string | undefined> {
  return (await cookies()).get(ACCESS_COOKIE)?.value;
}

/** Token for a page that needs a signed-in user; redirects to /login otherwise. */
export async function requireToken(next: string): Promise<string> {
  const token = await getToken();
  if (!token) redirect(`/login?next=${encodeURIComponent(next)}`);
  return token;
}

/** Current user, or null when signed out / token expired. */
export async function getMe(): Promise<Me | null> {
  const token = await getToken();
  if (!token) return null;
  try {
    const res = await apiRequest<ApiData<Me>>('/users/me', { token, cache: 'no-store' });
    return res.data;
  } catch {
    return null;
  }
}

export const isAdmin = (me: Me | null): boolean => !!me?.roles.some((r) => r.name === 'admin');

/** Only allow same-site relative redirects. */
export function safeNext(next: string | undefined): string {
  return next && next.startsWith('/') && !next.startsWith('//') ? next : '/';
}
