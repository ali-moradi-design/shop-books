import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { connection } from 'next/server';
import { requireToken } from '@/shared/lib/auth';
import { fetchOrder, OrderStatusBadge } from '@/entities/order';
import { ButtonLink } from '@/shared/ui/Button';
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
  const [order, sp] = await Promise.all([fetchOrder(token, id), searchParams]);
  return (
    <div className="space-y-6">
      {sp.paid && <Notice tone="success">Payment received. Thank you for your order!</Notice>}
      <div className="flex flex-wrap items-center gap-4">
        <h1 className="font-serif text-4xl font-medium text-forest-900">
          Order {order.id.slice(-8)}
        </h1>
        <OrderStatusBadge status={order.status} />
      </div>
      {order.status === 'pending_payment' && (
        <ButtonLink href={`/pay/${order.id}`} variant="gold">
          Pay now
        </ButtonLink>
      )}
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
