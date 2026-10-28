import type { Metadata } from 'next';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { cacheLife } from 'next/cache';
import { fetchAllBooks, fetchBook } from '@/entities/book';
import { BookInfo, BuyBox, LookInside, Related, Reviews } from '@/widgets/book-detail';
import { firstParam } from '@/shared/lib/query';
import { formatMoney } from '@/shared/lib/money';
import { ReviewsSkeleton } from '@/widgets/skeletons';

type Params = Promise<{ id: string }>;

export async function generateStaticParams() {
  return (await fetchAllBooks()).map((b) => ({ id: b.id }));
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { id } = await params;
  try {
    const book = await fetchBook(id);
    return {
      title: book.title,
      description: book.description.slice(0, 160),
      alternates: { canonical: `/books/${id}` },
      openGraph: {
        title: `${book.title} by ${book.author}`,
        description: book.description.slice(0, 160),
        images: book.coverImageUrl ? [book.coverImageUrl] : undefined,
      },
    };
  } catch {
    return { title: 'Book' };
  }
}

type SP = Promise<Record<string, string | string[] | undefined>>;

/** Cached static shell: cover, text, "look inside" and JSON-LD. Dynamic parts arrive as slots. */
async function Shell({
  id,
  buy,
  reviews,
}: {
  id: string;
  buy: React.ReactNode;
  reviews: React.ReactNode;
}) {
  'use cache';
  cacheLife('hours');
  const book = await fetchBook(id).catch(() => null);
  if (!book) return null;
  const jsonLd = [
    {
      '@context': 'https://schema.org',
      '@type': 'Product',
      name: book.title,
      image: book.coverImageUrl,
      description: book.description,
      isbn: book.isbn,
      brand: { '@type': 'Brand', name: book.author },
      offers: {
        '@type': 'Offer',
        priceCurrency: book.currency,
        price: (book.price / 100).toFixed(2),
        availability:
          book.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: `/books/${book.id}`,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
        { '@type': 'ListItem', position: 2, name: 'Books', item: '/books' },
        { '@type': 'ListItem', position: 3, name: book.title },
      ],
    },
  ];
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <p className="font-sans text-sm text-ink-muted">
        <Link href="/">Home</Link> › <Link href="/books">Books</Link> ›{' '}
        <span className="font-semibold text-forest-900">{book.title}</span>
      </p>
      <div className="mt-6 grid gap-12 lg:grid-cols-[420px_1fr_340px]">
        <BookInfo book={book} />
        {buy}
      </div>
      <LookInside book={book} />
      {reviews}
      <Related book={book} />
    </>
  );
}

async function BuyBoxSlot({ id, searchParams }: { id: string; searchParams: SP }) {
  const error = firstParam((await searchParams).error);
  return <BuyBox bookId={id} error={error} />;
}

export default async function BookPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: SP;
}) {
  const { id } = await params;
  const book = await fetchBook(id).catch(() => null);
  if (!book) notFound();
  return (
    <Shell
      id={id}
      // Slots cross the 'use cache' boundary and come back as a list, so they need keys.
      buy={
        <Suspense
          key="buy"
          fallback={
            <aside className="rounded-[10px] border border-forest-200 bg-white p-7 font-sans text-4xl font-bold text-forest-900">
              {formatMoney(book.price, book.currency)}
            </aside>
          }
        >
          <BuyBoxSlot id={id} searchParams={searchParams} />
        </Suspense>
      }
      reviews={
        <Suspense key="reviews" fallback={<ReviewsSkeleton />}>
          <Reviews bookId={id} />
        </Suspense>
      }
    />
  );
}
