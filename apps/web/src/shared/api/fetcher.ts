import { API_V1 } from '@/shared/config';
import { ApiError } from './types';

export type FetchInit = Omit<RequestInit, 'body'> & {
  next?: { revalidate?: number | false; tags?: string[] };
  /** JSON request body. */
  json?: unknown;
  /** Bearer access token for authenticated endpoints. */
  token?: string;
};

export async function apiRequest<T>(path: string, init: FetchInit = {}): Promise<T> {
  const { json, token, headers, ...rest } = init;
  const url = `${API_V1}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...rest,
    ...(json !== undefined ? { body: JSON.stringify(json) } : {}),
    headers: {
      Accept: 'application/json',
      ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(headers ?? {}),
    },
  });
  if (!res.ok) {
    let body: unknown;
    try {
      body = await res.json();
    } catch {
      body = undefined;
    }
    const message =
      body && typeof body === 'object' && 'message' in body
        ? String((body as { message: unknown }).message)
        : `API ${res.status} for ${path}`;
    throw new ApiError(message, res.status, body);
  }
  return res.json() as Promise<T>;
}

export const apiGetJson = <T>(path: string, init?: FetchInit) => apiRequest<T>(path, init);
