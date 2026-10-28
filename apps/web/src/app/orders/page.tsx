import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { connection } from 'next/server';
import { requireToken } from '@/shared/lib/auth';
import { fetchMyOrders, OrderStatusBadge } from '@/entities/order';
import { formatMoney } from '@/shared/lib/money';
import { RowsSkeleton } from '@/widgets/skeletons';

export const metadata: Metadata = { title: 'My orders', robots: { index: false } };

async function Orders() {
  await connection();
  const token = await requireToken('/orders');
  const orders = await fetchMyOrders(token);
  if (orders.length === 0)
    return (
      <p className="rounded-md bg-white p-8 font-serif text-lg">
        No orders yet.{' '}
        <Link href="/books" className="underline">
          Find a book
        </Link>
        .
      </p>
    );
  return (
    <ul className="space-y-4">
      {orders.map((o) => (
        <li key={o.id} className="rounded-lg bg-white p-6">
          <Link
            href={`/orders/${o.id}`}
            className="flex flex-wrap items-center justify-between gap-4"
          >
            <span>
              <span className="block font-serif text-xl font-semibold">Order {o.id.slice(-8)}</span>
              <span className="font-sans text-sm text-ink-muted">
                {new Date(o.createdAt).toLocaleDateString('en-US', { dateStyle: 'medium' })} ·{' '}
                {o.items.reduce((n, i) => n + i.quantity, 0)} items
              </span>
            </span>
            <OrderStatusBadge status={o.status} />
            <span className="font-sans text-lg font-bold text-forest-900">
              {formatMoney(o.totalAmount)}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default function OrdersPage() {
  return (
    <>
      <h1 className="mb-8 font-serif text-4xl font-medium text-forest-900">My orders</h1>
      <Suspense fallback={<RowsSkeleton label="Loading orders…" />}>
        <Orders />
      </Suspense>
    </>
  );
}
