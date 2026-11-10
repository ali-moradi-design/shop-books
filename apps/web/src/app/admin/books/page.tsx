import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { apiRequest } from '@/shared/api';
import type { ApiPaginated } from '@/shared/api';
import type { Book } from '@/entities/book';
import { updateBookStock } from '@/features/admin/actions';
import { adminData } from '@/features/admin/server';
import { PageTitle, Table, cell, small } from '@/features/admin/ui/parts';
import { ActionForm } from '@/shared/ui/ActionForm';
import { ButtonLink } from '@/shared/ui/Button';
import { Notice } from '@/shared/ui/Notice';
import { firstParam } from '@/shared/lib/query';
import { RowsSkeleton } from '@/widgets/skeletons';
import { Pagination } from '@/widgets/catalog';

export const metadata: Metadata = { title: 'Books' };

type SP = Promise<Record<string, string | string[] | undefined>>;

async function Books({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const page = Math.max(1, Number(firstParam(sp.page)) || 1);
  const q = firstParam(sp.q)?.trim();
  const { books } = await adminData('/admin/books', async (token) => ({
    books: await apiRequest<ApiPaginated<Book>>(
      `/books?limit=30&page=${page}&sort=title&order=asc${q ? `&q=${encodeURIComponent(q)}` : ''}`,
      { token, cache: 'no-store' },
    ),
  }));
  return (
    <>
      {sp.removed && (
        <div className="mb-4">
          <Notice tone="success">Book removed from the shop.</Notice>
        </div>
      )}
      <form role="search" className="mb-5 flex max-w-md gap-2">
        <label htmlFor="admin-q" className="sr-only">
          Search books
        </label>
        <input
          id="admin-q"
          name="q"
          defaultValue={q}
          placeholder="Title, author or ISBN"
          className={`${small} flex-1 py-2`}
        />
        <button
          type="submit"
          className="rounded-md bg-forest-900 px-4 font-sans text-sm text-white"
        >
          Search
        </button>
      </form>
      <Table label="Books" head={['Title', 'Author', 'Price (USD) and stock']}>
        {books.data.map((b) => (
          <tr key={b.id} data-testid="admin-book">
            <td className={cell}>
              <Link
                prefetch={false}
                href={`/admin/books/${b.id}`}
                className="font-serif text-base text-forest-900 underline"
              >
                {b.title}
              </Link>
              {b.featured && (
                <span className="ml-2 rounded bg-gold-300/40 px-1.5 py-0.5 text-xs">
                  Staff pick
                </span>
              )}
            </td>
            <td className={cell}>{b.author}</td>
            <td className={cell}>
              <ActionForm
                action={updateBookStock.bind(null, b.id)}
                submit="Save"
                variant="outline"
                className="flex flex-wrap items-center gap-2 space-y-0"
                buttonClassName="px-3 py-1.5 text-sm"
              >
                <input
                  name="price"
                  aria-label={`Price of ${b.title}`}
                  defaultValue={(b.price / 100).toFixed(2)}
                  inputMode="decimal"
                  className={`${small} w-24`}
                />
                <input
                  name="stock"
                  type="number"
                  min={0}
                  aria-label={`Stock of ${b.title}`}
                  defaultValue={b.stock}
                  className={`${small} w-20`}
                />
              </ActionForm>
            </td>
          </tr>
        ))}
        {books.data.length === 0 && (
          <tr>
            <td className={cell} colSpan={3}>
              No books match.
            </td>
          </tr>
        )}
      </Table>
      <Pagination
        page={books.meta.page}
        pages={books.meta.pages}
        params={{ q }}
        basePath="/admin/books"
      />
    </>
  );
}

export default function AdminBooksPage({ searchParams }: { searchParams: SP }) {
  return (
    <>
      <PageTitle title="Books">
        <a href="/admin/export/books" className="underline">
          Export CSV
        </a>
        <Link href="/admin/books/import" className="underline">
          Import
        </Link>
        <ButtonLink href="/admin/books/new">+ New book</ButtonLink>
      </PageTitle>
      <Suspense fallback={<RowsSkeleton rows={8} label="Loading books…" />}>
        <Books searchParams={searchParams} />
      </Suspense>
    </>
  );
}
