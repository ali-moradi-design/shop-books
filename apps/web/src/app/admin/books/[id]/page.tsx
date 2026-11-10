import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { apiRequest, ApiError } from '@/shared/api';
import type { ApiData } from '@/shared/api';
import type { Book } from '@/entities/book';
import { deleteBook } from '@/features/admin/actions';
import { adminData } from '@/features/admin/server';
import { BookForm } from '@/features/admin/ui/BookForm';
import { PageTitle } from '@/features/admin/ui/parts';
import { Notice } from '@/shared/ui/Notice';
import { RowsSkeleton } from '@/widgets/skeletons';

export const metadata: Metadata = { title: 'Edit book' };

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

async function Editor({ params, searchParams }: Props) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const { book } = await adminData(`/admin/books/${id}`, async (token) => {
    try {
      return {
        book: (
          await apiRequest<ApiData<Book>>(`/books/${encodeURIComponent(id)}`, {
            token,
            cache: 'no-store',
          })
        ).data,
      };
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) notFound();
      throw e;
    }
  });
  return (
    <>
      <PageTitle title={book.title}>
        <Link href={`/books/${book.id}`} target="_blank" className="underline">
          View in shop ↗
        </Link>
      </PageTitle>
      {sp.created && (
        <div className="mb-4">
          <Notice tone="success">Book created.</Notice>
        </div>
      )}
      <BookForm key={book.updatedAt} book={book} />
      <form action={deleteBook.bind(null, book.id)} className="mt-8">
        <button type="submit" className="font-sans text-sm text-sale underline">
          Remove this book from the shop
        </button>
      </form>
    </>
  );
}

export default function EditBookPage(props: Props) {
  return (
    <>
      <Link href="/admin/books" className="font-sans text-sm underline">
        ← Books
      </Link>
      <div className="mt-3">
        <Suspense fallback={<RowsSkeleton rows={6} />}>
          <Editor {...props} />
        </Suspense>
      </div>
    </>
  );
}
