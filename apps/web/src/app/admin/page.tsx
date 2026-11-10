import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { apiRequest } from '@/shared/api';
import type { ApiData } from '@/shared/api';
import type { Book } from '@/entities/book';
import { OrderStatusBadge, type Order } from '@/entities/order';
import { adminData } from '@/features/admin/server';
import { PageTitle } from '@/features/admin/ui/parts';
import { formatMoney } from '@/shared/lib/money';
import { RowsSkeleton } from '@/widgets/skeletons';

export const metadata: Metadata = { title: 'Dashboard' };

interface Summary {
  users: number;
  books: number;
  orders: number;
  revenue: number;
  lowStock: number;
}

interface Insights {
  revenue: number;
  orders: number;
  averageOrderValue: number;
  customers: number;
  returningCustomers: number;
  returningRate: number;
  refunds: number;
  byCategory: { category: string; revenue: number; units: number }[];
}

const live = { cache: 'no-store' as RequestCache };

async function Dashboard() {
  const { summary, insights, low, orders } = await adminData('/admin', async (token) => {
    // one round of parallel reads
    const [summary, insights, low, orders] = await Promise.all([
      apiRequest<ApiData<Summary>>('/admin/dashboard/summary', { token, ...live }),
      apiRequest<ApiData<Insights>>('/admin/insights?days=30', { token, ...live }),
      apiRequest<ApiData<Book[]>>('/admin/dashboard/low-stock?threshold=5', { token, ...live }),
      apiRequest<ApiData<Order[]>>('/orders', { token, ...live }),
    ]);
    return {
      summary: summary.data,
      insights: insights.data,
      low: low.data,
      orders: orders.data.slice(0, 8),
    };
  });
  const tiles: [string, string, string][] = [
    ['Revenue, 30 days', formatMoney(insights.revenue), `${formatMoney(summary.revenue)} all time`],
    ['Orders, 30 days', String(insights.orders), `${summary.orders} in total`],
    ['Average order', formatMoney(insights.averageOrderValue), 'last 30 days'],
    [
      'Returning customers',
      `${Math.round(insights.returningRate * 100)}%`,
      `${insights.returningCustomers} of ${insights.customers} buyers`,
    ],
    ['Low stock', String(summary.lowStock), `of ${summary.books} books`],
  ];
  const maxCategory = Math.max(1, ...insights.byCategory.map((c) => c.revenue));
  return (
    <div className="space-y-10">
      <dl className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
        {tiles.map(([k, v, note]) => (
          <div key={k} className="rounded-lg bg-white p-5">
            <dt className="font-sans text-xs font-semibold uppercase tracking-widest text-mint-500">
              {k}
            </dt>
            <dd className="mt-1 font-sans text-2xl font-bold text-forest-900">{v}</dd>
            <dd className="font-sans text-xs text-ink-muted">{note}</dd>
          </div>
        ))}
      </dl>
      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="cat-title" className="rounded-lg bg-white p-6">
          <h2 id="cat-title" className="mb-4 font-serif text-2xl">
            Sales by genre, 30 days
          </h2>
          {insights.byCategory.length === 0 && (
            <p className="font-sans text-sm text-ink-muted">No sales yet.</p>
          )}
          <ul className="space-y-3 font-sans text-sm">
            {insights.byCategory.slice(0, 8).map((c) => (
              <li key={c.category}>
                <div className="flex justify-between">
                  <span className="capitalize">{c.category}</span>
                  <span>{formatMoney(c.revenue)}</span>
                </div>
                <div className="mt-1 h-2 rounded bg-forest-50">
                  <div
                    className="h-2 rounded bg-forest-500"
                    style={{ width: `${(c.revenue / maxCategory) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </section>
        <section aria-labelledby="low-title" className="rounded-lg bg-white p-6">
          <h2 id="low-title" className="mb-4 font-serif text-2xl">
            Running low
          </h2>
          <ul className="divide-y divide-forest-100 font-sans text-sm">
            {low.slice(0, 8).map((b) => (
              <li key={b.id} className="flex items-center justify-between gap-3 py-2">
                <span className="truncate">{b.title}</span>
                <span className={b.stock === 0 ? 'text-sale' : 'text-ink-muted'}>
                  {b.stock === 0 ? 'Sold out' : `${b.stock} left`}
                </span>
                <Link prefetch={false} href={`/admin/books/${b.id}`} className="underline">
                  Restock
                </Link>
              </li>
            ))}
            {low.length === 0 && <li className="py-2 text-ink-muted">Nothing is running low.</li>}
          </ul>
        </section>
      </div>
      <section aria-labelledby="recent-title" className="rounded-lg bg-white p-6">
        <div className="mb-4 flex items-baseline justify-between">
          <h2 id="recent-title" className="font-serif text-2xl">
            Latest orders
          </h2>
          <Link href="/admin/orders" className="font-sans text-sm underline">
            All orders
          </Link>
        </div>
        <ul className="divide-y divide-forest-100 font-sans text-sm">
          {orders.map((o) => (
            <li key={o.id} className="flex items-center justify-between gap-3 py-2.5">
              <Link prefetch={false} href={`/admin/orders/${o.id}`} className="underline">
                {o.id.slice(-8)}
              </Link>
              <span className="flex-1 truncate">{o.shippingAddress.fullName}</span>
              <OrderStatusBadge status={o.status} />
              <span>{formatMoney(o.totalAmount)}</span>
            </li>
          ))}
          {orders.length === 0 && <li className="py-2 text-ink-muted">No orders yet.</li>}
        </ul>
      </section>
    </div>
  );
}

export default function AdminPage() {
  return (
    <>
      <PageTitle title="Dashboard" />
      <Suspense fallback={<RowsSkeleton rows={6} label="Loading dashboard…" />}>
        <Dashboard />
      </Suspense>
    </>
  );
}
