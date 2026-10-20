import type { MetadataRoute } from 'next';
import { fetchBooks } from '@/entities/book';

const base = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data } = await fetchBooks({ limit: 100 }).catch(() => ({ data: [] }));
  return [
    { url: `${base}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/books`, changeFrequency: 'daily', priority: 0.9 },
    ...data.map((b) => ({
      url: `${base}/books/${b.id}`,
      lastModified: new Date(b.updatedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
  ];
}
