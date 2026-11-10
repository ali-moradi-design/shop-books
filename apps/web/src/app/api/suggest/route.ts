import { NextResponse, type NextRequest } from 'next/server';
import { apiRequest } from '@/shared/api';

interface Suggestion {
  id: string;
  title: string;
  author: string;
  coverImageUrl?: string | null;
  price: number;
  inStock: boolean;
}

/**
 * Search box suggestions. A route handler, so the browser asks this site (no
 * cross-origin call) and the answer can be cached for a minute.
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() ?? '';
  if (q.length < 2 || q.length > 60) return NextResponse.json({ data: [] });
  try {
    const res = await apiRequest<{ data: Suggestion[] }>(
      `/books/suggest?q=${encodeURIComponent(q)}`,
      { next: { revalidate: 60 } },
    );
    return NextResponse.json(res, { headers: { 'Cache-Control': 'public, max-age=60' } });
  } catch {
    return NextResponse.json({ data: [] });
  }
}
