import type { Book } from '../model/types';
import { cn } from '@/shared/lib/cn';

/** Cover with the hinge overlay and soft shadow (`.book-cover` in globals.css). */
export function BookCover({
  book,
  className,
  priority,
}: {
  book: Pick<Book, 'title' | 'coverImageUrl'>;
  className?: string;
  priority?: boolean;
}) {
  return (
    <span className={cn('book-cover', className)}>
      {book.coverImageUrl ? (
        // Covers come from third-party hosts; the optimizer adds nothing for them.
        <img
          src={book.coverImageUrl}
          alt={`Cover of ${book.title}`}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
        />
      ) : (
        <span className="flex aspect-[2/3] items-center justify-center bg-forest-900 p-3 text-center font-serif text-white">
          {book.title}
        </span>
      )}
    </span>
  );
}
