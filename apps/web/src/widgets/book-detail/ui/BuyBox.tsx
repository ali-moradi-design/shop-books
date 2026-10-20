import Link from 'next/link';
import { connection } from 'next/server';
import { fetchBookLive } from '@/entities/book';
import { getToken } from '@/shared/lib/auth';
import { addToCart } from '@/features/cart/actions';
import { FavoriteButton } from '@/features/favorites/ui/FavoriteButton';
import { fetchFavorites } from '@/features/favorites/api';
import { Button } from '@/shared/ui/Button';
import { Notice } from '@/shared/ui/Notice';
import { formatMoney } from '@/shared/lib/money';

/** Dynamic hole (PPR): live price and stock, cart and reading-list state. */
export async function BuyBox({ bookId, error }: { bookId: string; error?: string }) {
  await connection();
  const [book, token] = await Promise.all([fetchBookLive(bookId), getToken()]);
  const saved = token
    ? (await fetchFavorites(token).catch(() => [])).some((f) => f.bookId === bookId)
    : false;
  const soldOut = book.stock === 0;
  return (
    <aside
      aria-label="Buy"
      className="sticky top-5 self-start rounded-[10px] border border-forest-200 bg-white p-7"
    >
      <p className="font-sans text-4xl font-bold text-forest-900">
        {formatMoney(book.price, book.currency)}
      </p>
      <p
        className={`my-4 flex items-center gap-2 font-sans text-sm ${soldOut ? 'text-sale' : 'text-ok'}`}
      >
        <span
          aria-hidden="true"
          className={`size-2.5 rounded-full ${soldOut ? 'bg-sale' : 'bg-[#2fb67e] shadow-[0_0_0_4px_#d3f0e3]'}`}
        />
        {soldOut
          ? 'Sold out'
          : book.stock <= 5
            ? `Only ${book.stock} left`
            : `In stock — ${book.stock} copies`}
      </p>
      {error && <Notice tone="error">{error}</Notice>}
      <form action={addToCart.bind(null, bookId)} className="mt-3 flex gap-3">
        <label className="sr-only" htmlFor="qty">
          Quantity
        </label>
        <input
          id="qty"
          name="quantity"
          type="number"
          min={1}
          max={Math.max(1, Math.min(20, book.stock))}
          defaultValue={1}
          className="w-20 rounded-lg border-[1.5px] border-forest-200 px-3 py-3 text-center font-sans font-semibold"
        />
        <Button type="submit" disabled={soldOut} className="flex-1 whitespace-nowrap">
          Add to cart
        </Button>
      </form>
      <div className="mt-3">
        {token ? (
          <FavoriteButton bookId={bookId} saved={saved} />
        ) : (
          <Link
            href={`/login?next=${encodeURIComponent(`/books/${bookId}`)}`}
            className="block text-center font-sans text-sm underline"
          >
            Sign in to save to your reading list
          </Link>
        )}
      </div>
      <p className="mt-5 border-t border-forest-100 pt-4 font-sans text-[13px] leading-relaxed text-ink-muted">
        Free shipping over $40 · Ships in 1–2 days
        <br />
        Demo shop: payment is simulated.
      </p>
    </aside>
  );
}
