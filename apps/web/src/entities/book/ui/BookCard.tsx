import Link from 'next/link';
import type { Book } from '../model/types';
import { BookCover } from './BookCover';
import { Stars } from '@/shared/ui/Stars';
import { formatMoney } from '@/shared/lib/money';

export function BookCard({
  book,
  rating,
  footer,
}: {
  book: Book;
  rating?: number;
  footer?: React.ReactNode;
}) {
  return (
    <article className="group flex flex-col">
      <Link href={`/books/${book.id}`} aria-label={`${book.title} by ${book.author}`}>
        <BookCover book={book} />
        <h3 className="mt-4 font-serif text-lg font-semibold leading-snug group-hover:underline">
          {book.title}
        </h3>
      </Link>
      <p className="font-serif text-[15px] text-ink-muted">{book.author}</p>
      {rating !== undefined && <Stars value={rating} className="mt-1" />}
      <p className="mt-1 flex items-center gap-2 font-sans">
        <span className="font-bold text-forest-900">{formatMoney(book.price, book.currency)}</span>
        {book.stock === 0 && (
          <span className="rounded-full bg-gold-300/60 px-2 py-0.5 text-xs">Sold out</span>
        )}
      </p>
      {footer}
    </article>
  );
}
