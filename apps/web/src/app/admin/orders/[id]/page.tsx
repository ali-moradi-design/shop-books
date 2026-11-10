import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { ApiError } from '@/shared/api';
import { fetchOrder, OrderStatusBadge } from '@/entities/order';
import { adminData } from '@/features/admin/server';
import { OrderStatusForm } from '@/features/admin/ui/OrderStatusForm';
import { PageTitle, dayTime } from '@/features/admin/ui/parts';
import { formatMoney } from '@/shared/lib/money';
import { RowsSkeleton } from '@/widgets/skeletons';

export const metadata: Metadata = { title: 'Order' };

type Props = { params: Promise<{ id: string }> };

async function Detail({ params }: Props) {
  const { id } = await params;
  const { order } = await adminData(`/admin/orders/${id}`, async (token) => {
    try {
      return { order: await fetchOrder(token, id) };
    } catch (e) {
      if (e instanceof ApiError && [400, 404].includes(e.status)) notFound();
      throw e;
    }
  });
  const a = order.shippingAddress;
  return (
    <>
      <PageTitle title={`Order ${order.id.slice(-8)}`}>
        <Link prefetch={false} href={`/admin/orders/${order.id}/label`} className="underline">
          Print shipping label
        </Link>
        <OrderStatusBadge status={order.status} />
      </PageTitle>
      <p className="-mt-3 mb-6 font-sans text-sm text-ink-muted">
        Placed {dayTime.format(new Date(order.createdAt))}
      </p>
      <section className="mb-8 rounded-lg bg-white p-6">
        <h2 className="mb-3 font-serif text-2xl">Change status</h2>
        <OrderStatusForm orderId={order.id} status={order.status} />
      </section>
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
        <section className="rounded-lg bg-white p-6">
          <h2 className="mb-3 font-serif text-2xl">Items</h2>
          <ul className="divide-y divide-forest-100 font-sans text-sm">
            {order.items.map((i) => (
              <li key={i.book} className="flex justify-between gap-3 py-2">
                <Link prefetch={false} href={`/admin/books/${i.book}`} className="underline">
                  {i.quantity} × {i.title}
                </Link>
                <span>{formatMoney(i.price * i.quantity)}</span>
              </li>
            ))}
            {order.discountAmount > 0 && (
              <li className="flex justify-between py-2 text-ok">
                <span>Discount {order.discountCode}</span>
                <span>−{formatMoney(order.discountAmount)}</span>
              </li>
            )}
            <li className="flex justify-between py-2 font-semibold">
              <span>Total</span>
              <span>{formatMoney(order.totalAmount)}</span>
            </li>
          </ul>
        </section>
        <aside className="space-y-6 rounded-lg bg-white p-6 font-sans text-sm">
          <section>
            <h2 className="mb-1 font-serif text-xl">Ship to</h2>
            <address className="not-italic leading-6">
              {a.fullName}
              <br />
              {a.line1}
              <br />
              {a.line2 && (
                <>
                  {a.line2}
                  <br />
                </>
              )}
              {a.postalCode} {a.city}
              <br />
              {a.country}
            </address>
          </section>
          {order.shipment && (
            <section>
              <h2 className="mb-1 font-serif text-xl">Shipment</h2>
              <p>{order.shipment.carrier}</p>
              {order.shipment.url ? (
                <a
                  href={order.shipment.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="break-all font-mono underline"
                >
                  {order.shipment.trackingNumber}
                </a>
              ) : (
                <p className="font-mono">{order.shipment.trackingNumber}</p>
              )}
            </section>
          )}
          <section>
            <h2 className="mb-1 font-serif text-xl">Payment</h2>
            <p className="capitalize">
              {order.payment.method} · {order.payment.status}
            </p>
            {order.payment.transactionId && (
              <p className="break-all text-ink-muted">{order.payment.transactionId}</p>
            )}
            {order.refunded && <p className="text-ink-muted">Refunded</p>}
          </section>
          <section>
            <h2 className="mb-1 font-serif text-xl">History</h2>
            <ol className="space-y-2 border-l border-forest-200 pl-3">
              {[...order.statusHistory].reverse().map((h) => (
                <li key={`${h.status}-${h.at}`}>
                  <span className="capitalize">{h.status.replace('_', ' ')}</span>
                  <span className="block text-xs text-ink-muted">
                    {dayTime.format(new Date(h.at))}
                  </span>
                  {h.note && <span className="block text-ink-muted">{h.note}</span>}
                </li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </>
  );
}

export default function AdminOrderPage(props: Props) {
  return (
    <>
      <Link href="/admin/orders" className="font-sans text-sm underline">
        ← Orders
      </Link>
      <div className="mt-3">
        <Suspense fallback={<RowsSkeleton rows={6} />}>
          <Detail {...props} />
        </Suspense>
      </div>
    </>
  );
}
