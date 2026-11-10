import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { adminData } from '@/features/admin/server';
import { BookForm } from '@/features/admin/ui/BookForm';
import { RowsSkeleton } from '@/widgets/skeletons';

export const metadata: Metadata = { title: 'New book', robots: { index: false } };

async function Guard() {
  await adminData('/admin/books/new', async () => ({}));
  return <BookForm />;
}

export default function NewBookPage() {
  return (
    <>
      <p className="mb-2 font-sans text-sm">
        <Link href="/admin/books" className="underline">
          ← Books
        </Link>
      </p>
      <h1 className="mb-8 font-serif text-4xl font-medium text-forest-900">New book</h1>
      <Suspense fallback={<RowsSkeleton rows={4} />}>
        <Guard />
      </Suspense>
    </>
  );
}
