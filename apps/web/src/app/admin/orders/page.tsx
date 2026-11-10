import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { fetchMyOrders, OrderStatusBadge, type OrderStatus } from '@/entities/order';
import { adminData } from '@/features/admin/server';
import { PageTitle, Table, cell, day } from '@/features/admin/ui/parts';
import { cn } from '@/shared/lib/cn';
import { formatMoney } from '@/shared/lib/money';
import { firstParam } from '@/shared/lib/query';
import { RowsSkeleton } from '@/widgets/skeletons';

export const metadata: Metadata = { title: 'Orders' };

type SP = Promise<Record<string, string | string[] | undefined>>;
const TABS: (OrderStatus | undefined)[] = [
  undefined,
  'paid',
  'processing',
  'shipped',
  'pending_payment',
  'completed',
  'cancelled',
];

async function Orders({ searchParams }: { searchParams: SP }) {
  const raw = firstParam((await searchParams).status);
  const status = TABS.includes(raw as OrderStatus) ? (raw as OrderStatus) : undefined;
  const { orders } = await adminData('/admin/orders', async (token) => ({
    orders: await fetchMyOrders(token),
  }));
  const shown = status ? orders.filter((o) => o.status === status) : orders;
  return (
    <>
      <nav
        aria-label="Filter by status"
        className="mb-5 flex gap-5 overflow-x-auto border-b border-forest-200 font-sans text-sm"
      >
        {TABS.map((t) => (
          <Link
            key={t ?? 'all'}
            href={t ? `/admin/orders?status=${t}` : '/admin/orders'}
            aria-current={t === status ? 'page' : undefined}
            className={cn(
              'whitespace-nowrap pb-2 capitalize',
              t === status
                ? '-mb-px border-b-2 border-forest-900 text-forest-900'
                : 'text-ink-muted',
            )}
          >
            {t ? t.replace('_', ' ') : 'All'}
          </Link>
        ))}
      </nav>
      <Table label="Orders" head={['Order', 'Date', 'Customer', 'Items', 'Total', 'Status']}>
        {shown.map((o) => (
          <tr key={o.id} data-testid="admin-order">
            <td className={cell}>
              <Link prefetch={false} href={`/admin/orders/${o.id}`} className="underline">
                {o.id.slice(-8)}
              </Link>
            </td>
            <td className={cell}>{day.format(new Date(o.createdAt))}</td>
            <td className={cell}>{o.shippingAddress.fullName}</td>
            <td className={cell}>{o.items.map((i) => `${i.quantity}× ${i.title}`).join(', ')}</td>
            <td className={cell}>{formatMoney(o.totalAmount)}</td>
            <td className={cell}>
              <OrderStatusBadge status={o.status} />
            </td>
          </tr>
        ))}
        {shown.length === 0 && (
          <tr>
            <td className={cell} colSpan={6}>
              No orders.
            </td>
          </tr>
        )}
      </Table>
    </>
  );
}

export default function AdminOrdersPage({ searchParams }: { searchParams: SP }) {
  return (
    <>
      <PageTitle title="Orders">
        <a href="/admin/export/orders" className="underline">
          Export CSV
        </a>
        <Link href="/admin/returns" className="underline">
          Returns
        </Link>
      </PageTitle>
      <Suspense fallback={<RowsSkeleton rows={8} label="Loading orders…" />}>
        <Orders searchParams={searchParams} />
      </Suspense>
    </>
  );
}
