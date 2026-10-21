import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { connection } from 'next/server';
import { notFound } from 'next/navigation';
import { getMe, isAdmin, requireToken } from '@/shared/lib/auth';
import { NewBookForm } from '@/features/admin/ui/NewBookForm';

export const metadata: Metadata = { title: 'New book', robots: { index: false } };

async function Guard() {
  await connection();
  await requireToken('/admin/books/new');
  if (!isAdmin(await getMe())) notFound();
  return <NewBookForm />;
}

export default function NewBookPage() {
  return (
    <>
      <p className="mb-2 font-sans text-sm">
        <Link href="/admin" className="underline">
          ← Admin
        </Link>
      </p>
      <h1 className="mb-8 font-serif text-4xl font-medium text-forest-900">New book</h1>
      <Suspense fallback={<p className="font-serif text-lg">Loading…</p>}>
        <Guard />
      </Suspense>
    </>
  );
}
