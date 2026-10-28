import Link from 'next/link';
import { BookCover, type Book } from '@/entities/book';

const row = 'contents';

export function BookInfo({ book }: { book: Book }) {
  return (
    <>
      <div className="max-w-[420px]">
        <BookCover
          book={book}
          priority
          className="shadow-[0_30px_50px_-20px_rgb(0_0_0/0.6)] data-[fit=contain]:items-start"
        />
      </div>
      <div>
        {book.categories && book.categories.length > 0 && (
          <ul className="mb-3 flex flex-wrap gap-2">
            {book.categories.map((c) => (
              <li key={c}>
                <Link
                  href={`/books?category=${encodeURIComponent(c)}`}
                  className="inline-block rounded-full bg-mint-100 px-3 py-1 font-sans text-xs font-semibold capitalize text-ok"
                >
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <h1 className="font-serif text-5xl font-medium leading-[1.05] text-forest-900">
          {book.title}
        </h1>
        <p className="mt-3 font-serif text-xl">
          by{' '}
          <Link
            href={`/books?author=${encodeURIComponent(book.author)}`}
            className="text-forest-500 underline"
          >
            {book.author}
          </Link>
        </p>
        {book.series && (
          <p className="mt-1 font-sans text-sm text-ink-muted">
            Series:{' '}
            <Link href={`/books?series=${encodeURIComponent(book.series)}`} className="underline">
              {book.series}
            </Link>
            {book.seriesNumber ? ` · book ${book.seriesNumber}` : ''}
          </p>
        )}
        <p className="mt-6 max-w-[560px] font-serif text-xl leading-relaxed">{book.description}</p>
        <dl className="mt-7 grid max-w-[560px] grid-cols-[140px_1fr] gap-x-3 gap-y-2 font-sans text-[15px]">
          {book.isbn && (
            <div className={row}>
              <dt className="font-semibold text-mint-500">ISBN</dt>
              <dd>{book.isbn}</dd>
            </div>
          )}
          <div className={row}>
            <dt className="font-semibold text-mint-500">Language</dt>
            <dd>English</dd>
          </div>
          <div className={row}>
            <dt className="font-semibold text-mint-500">Format</dt>
            <dd>Paperback</dd>
          </div>
        </dl>
      </div>
    </>
  );
}
