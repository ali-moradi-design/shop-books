import type { Metadata } from 'next';
import { Suspense } from 'react';
import { connection } from 'next/server';
import { requireToken } from '@/shared/lib/auth';
import { fetchCartLines } from '@/features/cart/api';
import { CartView } from '@/widgets/cart';
import { ListSkeleton } from '@/widgets/skeletons';

export const metadata: Metadata = { title: 'Your cart', robots: { index: false } };

async function Cart() {
  await connection();
  const token = await requireToken('/cart');
  const lines = await fetchCartLines(token);
  return (
    <>
      <h1 className="mb-8 font-serif text-4xl font-medium text-forest-900">
        Your cart · {lines.reduce((n, l) => n + l.quantity, 0)}{' '}
        {lines.reduce((n, l) => n + l.quantity, 0) === 1 ? 'book' : 'books'}
      </h1>
      <CartView lines={lines} />
    </>
  );
}

export default function CartPage() {
  return (
    <Suspense fallback={<ListSkeleton rows={3} label="Loading your cart…" />}>
      <Cart />
    </Suspense>
  );
}
