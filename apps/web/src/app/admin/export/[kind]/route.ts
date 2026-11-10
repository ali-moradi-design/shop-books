import { API_V1 } from '@/shared/config';
import { getToken } from '@/shared/lib/auth';

const KINDS = new Set(['books', 'orders', 'customers', 'subscribers']);

/**
 * CSV downloads. The API tokens live in this site's httpOnly cookies, so the
 * browser cannot call the API itself; this handler forwards the request with
 * the token, and the API checks the admin permission.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  if (!KINDS.has(kind)) return new Response('Not found', { status: 404 });
  const token = await getToken();
  if (!token) return new Response('Sign in first', { status: 401 });
  const path = kind === 'subscribers' ? '/newsletter/export.csv' : `/admin/export/${kind}.csv`;
  const res = await fetch(`${API_V1}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  if (!res.ok)
    return new Response(res.status === 403 ? 'Forbidden' : 'Export failed', { status: res.status });
  return new Response(res.body, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition':
        res.headers.get('content-disposition') ?? `attachment; filename="${kind}.csv"`,
      'Cache-Control': 'no-store',
    },
  });
}
