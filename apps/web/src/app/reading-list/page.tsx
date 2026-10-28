import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { connection } from 'next/server';
import { requireToken } from '@/shared/lib/auth';
import { fetchFavorites } from '@/features/favorites/api';
import { BookCover } from '@/entities/book';
import { toggleFavorite } from '@/features/favorites/actions';
import { Button } from '@/shared/ui/Button';
import { formatMoney } from '@/shared/lib/money';
import { RowsSkeleton } from '@/widgets/skeletons';

export const metadata: Metadata = { title: 'Reading list', robots: { index: false } };

async function List() {
  await connection();
  const token = await requireToken('/reading-list');
  const items = (await fetchFavorites(token)).filter((f) => f.populated?.book);
  if (items.length === 0)
    return (
      <p className="rounded-md bg-white p-8 font-serif text-lg">
        Your reading list is empty. Save books with the ♡ button on a book page.
      </p>
    );
  return (
    <ul className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-6">
      {items.map((f) => {
        const b = f.populated!.book!;
        return (
          <li key={f.bookId}>
            <Link href={`/books/${b.id}`} aria-label={b.title}>
              <BookCover book={b} />
              <h2 className="mt-3 font-serif text-lg font-semibold leading-snug">{b.title}</h2>
            </Link>
            <p className="font-serif text-[15px] text-ink-muted">{b.author}</p>
            <p className="font-sans font-bold text-forest-900">{formatMoney(b.price)}</p>
            <form action={toggleFavorite.bind(null, b.id, true)} className="mt-2">
              <Button type="submit" variant="outline" className="px-3 py-1.5 text-sm">
                Remove
              </Button>
            </form>
          </li>
        );
      })}
    </ul>
  );
}

export default function ReadingListPage() {
  return (
    <>
      <h1 className="mb-8 font-serif text-4xl font-medium text-forest-900">Reading list</h1>
      <Suspense fallback={<RowsSkeleton label="Loading reading list…" />}>
        <List />
      </Suspense>
    </>
  );
}
