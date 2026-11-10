import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { adminData } from '@/features/admin/server';
import { ImportForm } from '@/features/admin/ui/ImportForm';
import { PageTitle } from '@/features/admin/ui/parts';

export const metadata: Metadata = { title: 'Import books' };

const COLUMNS = [
  ['isbn', 'an existing ISBN updates that book'],
  ['title, author, description', 'as in the book form'],
  ['price', 'in dollars, e.g. 14.99'],
  ['stock', 'copies on hand'],
  ['categories', 'genres split by |, e.g. fiction | classics'],
  ['series, series_number, featured, cover_image_url', 'optional'],
];

async function Guarded() {
  await adminData('/admin/books/import', async () => ({}));
  return <ImportForm />;
}

export default function ImportPage() {
  return (
    <>
      <Link href="/admin/books" className="font-sans text-sm underline">
        ← Books
      </Link>
      <div className="mt-3">
        <PageTitle title="Import books">
          <a href="/admin/export/books" className="underline">
            Download the current catalog
          </a>
        </PageTitle>
      </div>
      <p className="mb-6 max-w-2xl font-sans text-sm text-ink-muted">
        Export the catalog, edit it in a spreadsheet, and import it back. Checking the file changes
        nothing; it lists the rows that need fixing.
      </p>
      <Suspense>
        <Guarded />
      </Suspense>
      <dl className="mt-10 max-w-2xl divide-y divide-forest-100 rounded-lg bg-white px-6 font-sans text-sm">
        {COLUMNS.map(([k, v]) => (
          <div key={k} className="grid gap-2 py-2 sm:grid-cols-[260px_1fr]">
            <dt className="font-mono">{k}</dt>
            <dd className="text-ink-muted">{v}</dd>
          </div>
        ))}
      </dl>
    </>
  );
}
