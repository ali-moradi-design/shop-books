import type { Metadata } from 'next';
import { Suspense } from 'react';
import { connection } from 'next/server';
import { notFound } from 'next/navigation';
import { requireToken, getMe, isAdmin } from '@/shared/lib/auth';
import { apiRequest } from '@/shared/api';
import type { ApiData, ApiPaginated } from '@/shared/api';
import { fetchMyOrders, NEXT_STATUSES, OrderStatusBadge, type Order } from '@/entities/order';
import type { Book } from '@/entities/book';
import { updateBookStock, updateOrderStatus } from '@/features/admin/actions';
import { Button, ButtonLink } from '@/shared/ui/Button';
import { Notice } from '@/shared/ui/Notice';
import { formatMoney } from '@/shared/lib/money';
import { firstParam } from '@/shared/lib/query';
import { RowsSkeleton } from '@/widgets/skeletons';

export const metadata: Metadata = { title: 'Admin', robots: { index: false } };

type SP = Promise<Record<string, string | string[] | undefined>>;

const cell = 'px-3 py-2 text-left align-middle';
const small = 'rounded-md border border-forest-200 px-2 py-1.5 font-sans text-sm';

async function Dashboard({ searchParams }: { searchParams: SP }) {
  await connection();
  const token = await requireToken('/admin');
  if (!isAdmin(await getMe())) notFound();
  const [summary, books, orders, sp] = await Promise.all([
    apiRequest<
      ApiData<{ users: number; books: number; orders: number; revenue: number; lowStock: number }>
    >('/admin/dashboard/summary', { token, cache: 'no-store' }),
    apiRequest<ApiPaginated<Book>>('/books?limit=100&sort=title&order=asc', {
      token,
      cache: 'no-store',
    }),
    fetchMyOrders(token),
    searchParams,
  ]);
  const s = summary.data;
  const stats: [string, string][] = [
    ['Revenue', formatMoney(s.revenue)],
    ['Orders', String(s.orders)],
    ['Books', String(s.books)],
    ['Customers', String(s.users)],
    ['Low stock', String(s.lowStock)],
  ];
  return (
    <div className="space-y-12">
      {sp.msg && <Notice tone="success">{firstParam(sp.msg)}</Notice>}
      <dl className="grid grid-cols-2 gap-4 md:grid-cols-5">
        {stats.map(([k, v]) => (
          <div key={k} className="rounded-lg bg-white p-5">
            <dt className="font-sans text-xs font-semibold uppercase tracking-widest text-mint-500">
              {k}
            </dt>
            <dd className="mt-1 font-sans text-2xl font-bold text-forest-900">{v}</dd>
          </div>
        ))}
      </dl>
      <section aria-labelledby="orders-title">
        <h2 id="orders-title" className="mb-4 font-serif text-3xl">
          Orders
        </h2>
        <div className="overflow-x-auto rounded-lg bg-white">
          <table className="w-full font-sans text-sm">
            <thead className="bg-forest-50">
              <tr>
                <th className={cell}>Order</th>
                <th className={cell}>Items</th>
                <th className={cell}>Total</th>
                <th className={cell}>Status</th>
                <th className={cell}>Change status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o: Order) => (
                <tr key={o.id} className="border-t border-forest-100">
                  <td className={cell}>{o.id.slice(-8)}</td>
                  <td className={cell}>
                    {o.items.map((i) => `${i.quantity}× ${i.title}`).join(', ')}
                  </td>
                  <td className={cell}>{formatMoney(o.totalAmount)}</td>
                  <td className={cell}>
                    <OrderStatusBadge status={o.status} />
                  </td>
                  <td className={cell}>
                    {NEXT_STATUSES[o.status].length === 0 ? (
                      <span className="text-ink-muted">Final</span>
                    ) : (
                      <form action={updateOrderStatus.bind(null, o.id)} className="flex gap-2">
                        <select
                          name="status"
                          defaultValue={o.status}
                          aria-label={`Status of order ${o.id.slice(-8)}`}
                          className={small}
                        >
                          {[o.status, ...NEXT_STATUSES[o.status]].map((st) => (
                            <option key={st} value={st}>
                              {st.replace('_', ' ')}
                            </option>
                          ))}
                        </select>
                        <Button type="submit" variant="outline" className="px-3 py-1.5 text-sm">
                          Save
                        </Button>
                      </form>
                    )}
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td className={cell} colSpan={5}>
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
      <section aria-labelledby="stock-title">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <h2 id="stock-title" className="font-serif text-3xl">
            Products and stock
          </h2>
          <ButtonLink href="/admin/books/new">+ New book</ButtonLink>
        </div>
        <div className="overflow-x-auto rounded-lg bg-white">
          <table className="w-full font-sans text-sm">
            <thead className="bg-forest-50">
              <tr>
                <th className={cell}>Title</th>
                <th className={cell}>Author</th>
                <th className={cell}>Edit price (USD) and stock</th>
              </tr>
            </thead>
            <tbody>
              {books.data.map((b) => (
                <tr key={b.id} className="border-t border-forest-100">
                  <td className={cell}>{b.title}</td>
                  <td className={cell}>{b.author}</td>
                  <td className={cell}>
                    <form
                      action={updateBookStock.bind(null, b.id)}
                      className="flex flex-wrap gap-2"
                    >
                      <input
                        name="price"
                        aria-label={`Price of ${b.title}`}
                        defaultValue={(b.price / 100).toFixed(2)}
                        inputMode="decimal"
                        className={`${small} w-24`}
                      />
                      <input
                        name="stock"
                        type="number"
                        min={0}
                        aria-label={`Stock of ${b.title}`}
                        defaultValue={b.stock}
                        className={`${small} w-20`}
                      />
                      <Button type="submit" variant="outline" className="px-3 py-1.5 text-sm">
                        Save
                      </Button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default function AdminPage({ searchParams }: { searchParams: SP }) {
  return (
    <>
      <h1 className="mb-8 font-serif text-4xl font-medium text-forest-900">Admin</h1>
      <Suspense fallback={<RowsSkeleton rows={6} label="Loading dashboard…" />}>
        <Dashboard searchParams={searchParams} />
      </Suspense>
    </>
  );
}
