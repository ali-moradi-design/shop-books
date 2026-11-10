import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { apiRequest } from '@/shared/api';
import { deleteReview } from '@/features/admin/actions';
import { adminData } from '@/features/admin/server';
import { PageTitle, Table, cell, day } from '@/features/admin/ui/parts';
import { Stars } from '@/shared/ui/Stars';
import { RowsSkeleton } from '@/widgets/skeletons';

export const metadata: Metadata = { title: 'Reviews' };

interface ApiReview {
  id: string;
  rating: number;
  comment?: string;
  createdAt: string;
  user: { name?: string } | string;
  book: { _id: string; title: string } | string;
}

async function Reviews() {
  const { list } = await adminData('/admin/reviews', async (token) => ({
    list: (
      await apiRequest<{ data: ApiReview[] }>('/reviews?limit=100', { token, cache: 'no-store' })
    ).data,
  }));
  return (
    <Table label="Reviews" head={['Rating', 'Review', 'Book', '']}>
      {list.map((r) => (
        <tr key={r.id}>
          <td className={cell}>
            <Stars value={r.rating} />
          </td>
          <td className={cell}>
            {r.comment ?? <span className="text-ink-muted">No comment</span>}
            <span className="block text-xs text-ink-muted">
              {typeof r.user === 'object' ? r.user.name : 'Reader'} ·{' '}
              {day.format(new Date(r.createdAt))}
            </span>
          </td>
          <td className={cell}>
            {typeof r.book === 'object' ? (
              <Link prefetch={false} href={`/books/${r.book._id}`} className="underline">
                {r.book.title}
              </Link>
            ) : (
              '—'
            )}
          </td>
          <td className={cell}>
            <form action={deleteReview.bind(null, r.id)}>
              <button type="submit" className="text-sale underline">
                Remove
              </button>
            </form>
          </td>
        </tr>
      ))}
      {list.length === 0 && (
        <tr>
          <td className={cell} colSpan={4}>
            No reviews yet.
          </td>
        </tr>
      )}
    </Table>
  );
}

export default function AdminReviewsPage() {
  return (
    <>
      <PageTitle title="Reviews" />
      <Suspense fallback={<RowsSkeleton rows={6} />}>
        <Reviews />
      </Suspense>
    </>
  );
}
