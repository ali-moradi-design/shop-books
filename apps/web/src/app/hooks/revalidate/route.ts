import { revalidateTag } from 'next/cache';

/**
 * Drops the cached catalog (fetches tagged `books`). The API's seed and demo-reset
 * scripts call this, so the storefront never keeps serving books from an earlier
 * database. Development falls back to a fixed secret; production needs REVALIDATE_SECRET.
 */
const secret =
  process.env.REVALIDATE_SECRET ??
  (process.env.NODE_ENV === 'production' ? undefined : 'dev-revalidate-secret');

export async function POST(request: Request) {
  if (!secret) return new Response('Not found', { status: 404 });
  if (request.headers.get('x-revalidate-secret') !== secret) {
    return new Response('Unauthorized', { status: 401 });
  }
  // expire 0: the next visit fetches fresh data instead of serving the stale catalog
  revalidateTag('books', { expire: 0 });
  return Response.json({ revalidated: ['books'] });
}
