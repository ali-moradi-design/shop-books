import Link from 'next/link';
import { BookCover } from '@/entities/book';
import { cartSubtotal, type CartLine } from '@/features/cart/api';
import { removeFromCart, setQuantity } from '@/features/cart/actions';
import { Button, ButtonLink } from '@/shared/ui/Button';
import { formatMoney } from '@/shared/lib/money';

const FREE_SHIPPING = 4000;

export function CartView({ lines }: { lines: CartLine[] }) {
  if (lines.length === 0) {
    return (
      <div className="rounded-md bg-white p-10 text-center">
        <p className="font-serif text-2xl">Your cart is empty.</p>
        <ButtonLink href="/books" className="mt-6">
          Browse books
        </ButtonLink>
      </div>
    );
  }
  const subtotal = cartSubtotal(lines);
  const away = Math.max(0, FREE_SHIPPING - subtotal);
  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_400px]">
      <div>
        <div className="mb-4 rounded-lg bg-mint-100 p-4 font-sans text-sm text-ok">
          {away > 0
            ? `You are ${formatMoney(away)} away from free shipping`
            : 'You qualify for free shipping'}
          <div className="mt-2 h-1.5 rounded-full bg-mint-300/50" role="presentation">
            <div
              className="h-full rounded-full bg-forest-900"
              style={{ width: `${Math.min(100, (subtotal / FREE_SHIPPING) * 100)}%` }}
            />
          </div>
        </div>
        <ul className="space-y-3">
          {lines.map(({ book, quantity }) => (
            <li
              key={book.id}
              className="grid grid-cols-[84px_1fr] items-center gap-5 rounded-lg bg-white p-4 sm:grid-cols-[84px_1fr_auto_100px_auto]"
            >
              <Link href={`/books/${book.id}`} aria-label={book.title}>
                <BookCover book={book} />
              </Link>
              <div>
                <h2 className="font-serif text-xl font-semibold">{book.title}</h2>
                <p className="font-sans text-sm text-ink-muted">
                  {book.author} · Paperback
                  <br />
                  <span className={book.stock >= quantity ? 'text-ok' : 'text-sale'}>
                    {book.stock >= quantity ? 'In stock' : `Only ${book.stock} left`}
                  </span>
                </p>
              </div>
              <form action={setQuantity.bind(null, book.id)} className="flex gap-2">
                <label className="sr-only" htmlFor={`q-${book.id}`}>
                  Quantity for {book.title}
                </label>
                <input
                  id={`q-${book.id}`}
                  name="quantity"
                  type="number"
                  min={0}
                  max={20}
                  defaultValue={quantity}
                  className="w-16 rounded-lg border-[1.5px] border-forest-200 px-2 py-2 text-center font-sans font-semibold"
                />
                <Button type="submit" variant="outline" className="px-3 py-2 text-sm">
                  Update
                </Button>
              </form>
              <p className="text-right font-sans text-lg font-bold text-forest-900">
                {formatMoney(book.price * quantity, book.currency)}
              </p>
              <form action={removeFromCart.bind(null, book.id)}>
                <button
                  className="px-2 font-sans text-lg text-ink-muted hover:text-sale"
                  aria-label={`Remove ${book.title}`}
                >
                  ✕
                </button>
              </form>
            </li>
          ))}
        </ul>
        <ButtonLink href="/books" variant="outline" className="mt-6">
          ← Continue shopping
        </ButtonLink>
      </div>
      <aside
        aria-label="Order summary"
        className="self-start rounded-lg border-t-[5px] border-forest-900 bg-white p-8"
      >
        <h2 className="mb-4 font-serif text-3xl">Order summary</h2>
        <p className="flex justify-between py-2 font-sans">
          <span>Subtotal ({lines.reduce((n, l) => n + l.quantity, 0)} items)</span>
          <span>{formatMoney(subtotal)}</span>
        </p>
        <p className="py-2 font-sans text-sm text-ink-muted">
          Shipping, tax and discount codes are applied at checkout.
        </p>
        <ButtonLink href="/checkout" className="mt-4 w-full rounded-lg py-4">
          Checkout
        </ButtonLink>
        <p className="mt-4 text-center font-sans text-xs text-ink-muted">
          Demo shop: payment uses a simulated gateway, no real card needed.
        </p>
      </aside>
    </div>
  );
}
