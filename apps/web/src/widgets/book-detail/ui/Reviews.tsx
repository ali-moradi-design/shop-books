import { connection } from 'next/server';
import { averageRating, fetchReviews } from '@/features/reviews/api';
import { ReviewForm } from '@/features/reviews/ui/ReviewForm';
import { getToken } from '@/shared/lib/auth';
import { Stars } from '@/shared/ui/Stars';
import Link from 'next/link';

/** Dynamic hole (PPR): reviews are always fresh. */
export async function Reviews({ bookId }: { bookId: string }) {
  await connection();
  const [reviews, token] = await Promise.all([fetchReviews(bookId).catch(() => []), getToken()]);
  return (
    <section id="reviews" aria-labelledby="reviews-title" className="pt-16">
      <h2 id="reviews-title" className="font-serif text-4xl font-medium text-forest-900">
        Reader reviews
      </h2>
      {reviews.length > 0 && (
        <p className="mt-2 flex items-center gap-3 font-sans text-sm text-ink-muted">
          <Stars value={averageRating(reviews)} /> {averageRating(reviews).toFixed(1)} ·{' '}
          {reviews.length} {reviews.length === 1 ? 'review' : 'reviews'}
        </p>
      )}
      <ul className="mt-6 grid gap-6 md:grid-cols-2">
        {reviews.length === 0 && (
          <li className="font-serif text-lg">No reviews yet. Be the first.</li>
        )}
        {reviews.map((r) => (
          <li key={r.id} className="border-l-4 border-mint-300 bg-white p-6">
            <p className="font-sans text-[15px] font-semibold">
              {r.user.name} · <Stars value={r.rating} />
            </p>
            {r.comment && (
              <p className="mt-2 font-serif text-base leading-relaxed text-[#444]">{r.comment}</p>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-8 max-w-xl">
        {token ? (
          <ReviewForm bookId={bookId} />
        ) : (
          <p className="font-serif text-lg">
            <Link
              className="underline"
              href={`/login?next=${encodeURIComponent(`/books/${bookId}`)}`}
            >
              Sign in
            </Link>{' '}
            to write a review.
          </p>
        )}
      </div>
    </section>
  );
}
