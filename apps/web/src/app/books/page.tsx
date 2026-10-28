import type { Metadata } from 'next';
import { Suspense } from 'react';
import { BookCard, fetchBooks, fetchFacets, type BookListParams } from '@/entities/book';
import { FilterSidebar, Pagination, type Filters } from '@/widgets/catalog';
import { firstParam } from '@/shared/lib/query';
import { CatalogSkeleton } from '@/widgets/skeletons';

export const metadata: Metadata = {
  title: 'Browse books',
  description:
    'Browse every book in the shop. Filter by genre, author, series and price, or search by title, author or ISBN.',
  alternates: { canonical: '/books' },
};

type SP = Promise<Record<string, string | string[] | undefined>>;

const dollarsToCents = (v?: string) => {
  const n = Number(v?.replace(',', '.'));
  return v && Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : undefined;
};

async function Results({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const get = (k: string) => firstParam(sp[k]) || undefined;
  const sortRaw = get('sort') ?? 'createdAt-desc';
  const [sort, order] = (sortRaw.includes('-') ? sortRaw : `${sortRaw}-desc`).split('-') as [
    BookListParams['sort'],
    BookListParams['order'],
  ];
  const page = Math.max(1, Number(get('page')) || 1);
  const filters: Filters = {
    q: get('q'),
    category: get('category'),
    author: get('author'),
    series: get('series'),
    min: get('min'),
    max: get('max'),
    inStock: get('inStock') === 'true',
    sort: `${sort}-${order}`,
  };
  const [facets, result] = await Promise.all([
    fetchFacets(),
    fetchBooks({
      q: filters.q,
      category: filters.category,
      author: filters.author,
      series: filters.series,
      minPrice: dollarsToCents(filters.min),
      maxPrice: dollarsToCents(filters.max),
      inStock: filters.inStock || undefined,
      featured: get('featured') === 'true' || undefined,
      sort,
      order,
      page,
    }),
  ]);
  const keep = {
    q: filters.q,
    category: filters.category,
    author: filters.author,
    series: filters.series,
    min: filters.min,
    max: filters.max,
    inStock: filters.inStock ? 'true' : undefined,
    sort: sortRaw,
    featured: get('featured'),
  };
  const title = filters.q
    ? `Results for “${filters.q}”`
    : filters.category
      ? filters.category
      : 'All books';
  return (
    <div className="grid gap-12 lg:grid-cols-[280px_1fr]">
      <aside>
        <FilterSidebar facets={facets} filters={filters} />
      </aside>
      <section aria-labelledby="results-title">
        <h1
          id="results-title"
          className="font-serif text-4xl font-medium capitalize text-forest-900"
        >
          {title}
        </h1>
        <p className="mb-8 mt-1 font-sans text-sm text-ink-muted" aria-live="polite">
          {result.meta.total} {result.meta.total === 1 ? 'book' : 'books'}
        </p>
        {result.data.length === 0 ? (
          <p className="rounded-md bg-white p-8 font-serif text-lg">
            No books match these filters. Try a different search or clear a filter.
          </p>
        ) : (
          <ul className="grid grid-cols-2 gap-x-7 gap-y-10 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
            {result.data.map((b) => (
              <li key={b.id}>
                <BookCard book={b} />
              </li>
            ))}
          </ul>
        )}
        <Pagination page={result.meta.page} pages={result.meta.pages} params={keep} />
      </section>
    </div>
  );
}

export default function BooksPage({ searchParams }: { searchParams: SP }) {
  return (
    <Suspense fallback={<CatalogSkeleton />}>
      <Results searchParams={searchParams} />
    </Suspense>
  );
}
