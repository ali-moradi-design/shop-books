'use client';

import { useCallback, useState } from 'react';
import type { Book } from '../model/types';
import { cn } from '@/shared/lib/cn';

type CoverState = 'loading' | 'loaded' | 'error';

/**
 * Cover with the hinge overlay and soft shadow (`.book-cover` in globals.css).
 * Shows a pulsing placeholder until the image arrives, then fades it in; a broken
 * image falls back to the title card.
 */
export function BookCover({
  book,
  className,
  priority,
}: {
  book: Pick<Book, 'title' | 'coverImageUrl'>;
  className?: string;
  priority?: boolean;
}) {
  const [state, setState] = useState<CoverState>('loading');

  const settle = useCallback((img: HTMLImageElement) => {
    if (img.naturalWidth === 0) return setState('error');
    setState('loaded');
  }, []);

  // The image can finish loading before hydration, when onLoad has already fired.
  const imgRef = useCallback(
    (img: HTMLImageElement | null) => {
      if (img?.complete) settle(img);
    },
    [settle],
  );

  if (!book.coverImageUrl || state === 'error') {
    return (
      <span className={cn('book-cover', className)}>
        <span className="flex aspect-[2/3] items-center justify-center bg-forest-900 p-3 text-center font-serif text-white">
          {book.title}
        </span>
      </span>
    );
  }

  return (
    <span className={cn('book-cover', className)} data-state={state}>
      {/* Covers come from third-party hosts; the optimizer adds nothing for them. */}
      <img
        ref={imgRef}
        src={book.coverImageUrl}
        alt={`Cover of ${book.title}`}
        loading={priority ? 'eager' : 'lazy'}
        fetchPriority={priority ? 'high' : undefined}
        decoding="async"
        onLoad={(e) => settle(e.currentTarget)}
        onError={() => setState('error')}
      />
    </span>
  );
}
