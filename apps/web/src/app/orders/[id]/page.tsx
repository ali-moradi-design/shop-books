import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { connection } from 'next/server';
import { requireToken } from '@/shared/lib/auth';
import {
  CANCELLABLE,
  fetchOrder,
  OrderStatusBadge,
  RETURN_STATUS_LABEL,
  type ReturnRequest,
} from '@/entities/order';
import { apiRequest } from '@/shared/api';
import type { ApiData } from '@/shared/api';
import { cancelOrder, requestReturn } from '@/features/account/actions';
import { startPayment } from '@/features/checkout/actions';
import { PaymentPending } from '@/features/checkout/ui/PaymentPending';
import { TrackPurchase } from '@/shared/lib/ab/TrackPurchase';
import { ActionForm } from '@/shared/ui/ActionForm';
import { Button } from '@/shared/ui/Button';
import { firstParam } from '@/shared/lib/query';
import { Notice } from '@/shared/ui/Notice';
import { formatMoney } from '@/shared/lib/money';
import { ListSkeleton } from '@/widgets/skeletons';

export const metadata: Metadata = { title: 'Order', robots: { index: false } };

type SP = Promise<Record<string, string | string[] | undefined>>;

async function OrderDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: SP;
}) {
  await connection();
  const { id } = await params;
  const token = await requireToken(`/orders/${id}`);
  const [order, sp, returns] = await Promise.all([
    fetchOrder(token, id),
    searchParams,
    apiRequest<ApiData<ReturnRequest[]>>(`/returns/mine?order=${encodeURIComponent(id)}`, {
      token,
      cache: 'no-store',
    })
      .then((r) => r.data)
      .catch(() => [] as ReturnRequest[]),
  ]);
  const pending = order.status === 'pending_payment';
  // the redirect back from Stripe proves nothing; the status comes from its webhook
  const result = firstParam(sp.checkout);
  const taken = new Map<string, number>();
  for (const r of returns)
    if (r.status !== 'rejected')
      for (const i of r.items) taken.set(i.bookId, (taken.get(i.bookId) ?? 0) + i.quantity);
  const returnable = ['shipped', 'completed'].includes(order.status)
    ? order.items
        .map((i) => ({ ...i, left: i.quantity - (taken.get(i.book) ?? 0) }))
        .filter((i) => i.left > 0)
    : [];
  return (
    <div className="space-y-6">
      {result === 'success' && order.status === 'paid' && (
        <>
          <TrackPurchase orderId={order.id} />
          <Notice tone="success">Payment received. Thank you for your order!</Notice>
        </>
      )}
      {result === 'success' && pending && <PaymentPending />}
      {result === 'cancelled' && pending && (
        <Notice>Payment cancelled. Your order is saved; pay for it whenever you are ready.</Notice>
      )}
      {sp.error && <Notice tone="error">{firstParam(sp.error)}</Notice>}
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="font-serif text-4xl font-medium text-forest-900">
          Order {order.id.slice(-8)}
        </h1>
        <OrderStatusBadge status={order.status} />
      </div>
      {order.shipment && (
        <p className="font-sans" data-testid="tracking">
          Shipped with {order.shipment.carrier} · tracking{' '}
          {order.shipment.url ? (
            <a
              href={order.shipment.url}
              target="_blank"
              rel="noopener noreferrer"
              className="underline"
            >
              {order.shipment.trackingNumber}
            </a>
          ) : (
            <span className="font-mono">{order.shipment.trackingNumber}</span>
          )}
        </p>
      )}
      {order.status === 'cancelled' && order.refunded && (
        <p className="font-sans text-ink-muted">Your payment was refunded.</p>
      )}
      <div className="flex flex-wrap items-start gap-4">
        {pending && (
          <form action={startPayment.bind(null, order.id)}>
            <Button type="submit" variant="gold">
              Pay now
            </Button>
          </form>
        )}
        {CANCELLABLE.includes(order.status) && (
          <ActionForm
            action={cancelOrder.bind(null, order.id)}
            submit="Cancel order"
            pendingLabel="Cancelling…"
            variant="outline"
          />
        )}
      </div>
      <ul className="divide-y divide-forest-100 rounded-lg bg-white px-6">
        {order.items.map((i) => (
          <li key={i.book} className="flex justify-between gap-4 py-4 font-sans">
            <Link href={`/books/${i.book}`} className="font-serif text-lg underline">
              {i.quantity} × {i.title}
            </Link>
            <span>{formatMoney(i.price * i.quantity)}</span>
          </li>
        ))}
        <li className="flex justify-between py-3 font-sans text-sm">
          <span>Subtotal</span>
          <span>{formatMoney(order.subtotalAmount)}</span>
        </li>
        {order.discountAmount > 0 && (
          <li className="flex justify-between py-3 font-sans text-sm text-ok">
            <span>Discount {order.discountCode}</span>
            <span>−{formatMoney(order.discountAmount)}</span>
          </li>
        )}
        <li className="flex justify-between py-4 font-sans text-xl font-bold text-forest-900">
          <span>Total</span>
          <span>{formatMoney(order.totalAmount)}</span>
        </li>
      </ul>
      {returns.length > 0 && (
        <section aria-labelledby="returns-title" className="rounded-lg bg-white p-6 font-sans">
          <h2 id="returns-title" className="mb-3 font-serif text-2xl">
            Returns
          </h2>
          <ul className="space-y-3">
            {returns.map((r) => (
              <li
                key={r.id}
                className="rounded-md border border-forest-200 p-4"
                data-testid="return-row"
              >
                <p className="font-semibold">{RETURN_STATUS_LABEL[r.status]}</p>
                <p className="text-sm text-ink-muted">
                  {r.items.map((i) => `${i.quantity} × ${i.title}`).join(', ')}
                </p>
                {r.refunded && <p className="text-sm">Refunded {formatMoney(r.refundAmount)}</p>}
              </li>
            ))}
          </ul>
        </section>
      )}
      {returnable.length > 0 && (
        <details className="rounded-lg bg-white p-6 font-sans">
          <summary className="cursor-pointer font-serif text-2xl text-forest-900">
            Return a book
          </summary>
          <p className="mt-2 text-sm text-ink-muted">
            Free within 30 days of shipping. We email you a label once we approve the request.
          </p>
          <ActionForm
            action={requestReturn.bind(null, order.id)}
            submit="Send request"
            className="mt-4"
          >
            {returnable.map((i) => (
              <label key={i.book} className="flex items-center justify-between gap-4 text-sm">
                <span>{i.title}</span>
                <select
                  name={`qty:${i.book}`}
                  defaultValue="0"
                  className="rounded-md border border-forest-200 px-2 py-1.5"
                >
                  {Array.from({ length: i.left + 1 }, (_, n) => (
                    <option key={n} value={n}>
                      {n}
                    </option>
                  ))}
                </select>
              </label>
            ))}
            <label className="block text-sm font-medium">
              Reason
              <select
                name="reason"
                className="mt-1 w-full rounded-md border border-forest-200 px-3 py-2.5"
              >
                <option value="damaged">Arrived damaged</option>
                <option value="wrong-item">Wrong book</option>
                <option value="not-as-described">Not as described</option>
                <option value="changed-mind">Changed my mind</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="block text-sm font-medium">
              Anything we should know? (optional)
              <textarea
                name="comment"
                rows={3}
                maxLength={1000}
                className="mt-1 w-full rounded-md border border-forest-200 p-3"
              />
            </label>
          </ActionForm>
        </details>
      )}
      <section aria-labelledby="ship-title" className="rounded-lg bg-white p-6 font-serif">
        <h2 id="ship-title" className="mb-2 text-2xl">
          Shipping to
        </h2>
        <address className="not-italic leading-relaxed">
          {order.shippingAddress.fullName}
          <br />
          {order.shippingAddress.line1}
          {order.shippingAddress.line2 && (
            <>
              <br />
              {order.shippingAddress.line2}
            </>
          )}
          <br />
          {order.shippingAddress.postalCode} {order.shippingAddress.city},{' '}
          {order.shippingAddress.country}
        </address>
      </section>
    </div>
  );
}

export default function Page({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: SP;
}) {
  return (
    <Suspense fallback={<ListSkeleton rows={3} label="Loading order…" />}>
      <OrderDetail params={params} searchParams={searchParams} />
    </Suspense>
  );
}
