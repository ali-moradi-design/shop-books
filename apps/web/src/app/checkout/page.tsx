import type { Metadata } from 'next';
import { Suspense } from 'react';
import { connection } from 'next/server';
import { redirect } from 'next/navigation';
import { requireToken } from '@/shared/lib/auth';
import { cartSubtotal, fetchCartLines } from '@/features/cart/api';
import { CheckoutForm } from '@/features/checkout/ui/CheckoutForm';
import { formatMoney } from '@/shared/lib/money';

export const metadata: Metadata = { title: 'Checkout', robots: { index: false } };

async function Checkout() {
  await connection();
  const token = await requireToken('/checkout');
  const lines = await fetchCartLines(token);
  if (lines.length === 0) redirect('/cart');
  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_380px]">
      <CheckoutForm />
      <aside
        aria-label="Order summary"
        className="self-start rounded-lg border-t-[5px] border-forest-900 bg-white p-8"
      >
        <h2 className="mb-4 font-serif text-3xl">Your order</h2>
        <ul className="space-y-2 font-sans text-sm">
          {lines.map((l) => (
            <li key={l.book.id} className="flex justify-between gap-4">
              <span>
                {l.quantity} × {l.book.title}
              </span>
              <span>{formatMoney(l.book.price * l.quantity)}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 flex justify-between border-t border-forest-100 pt-4 font-sans text-lg font-bold">
          <span>Subtotal</span>
          <span>{formatMoney(cartSubtotal(lines))}</span>
        </p>
      </aside>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <>
      <h1 className="mb-8 font-serif text-4xl font-medium text-forest-900">Checkout</h1>
      <Suspense fallback={<p className="font-serif text-lg">Loading…</p>}>
        <Checkout />
      </Suspense>
    </>
  );
}
