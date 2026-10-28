import type { Metadata } from 'next';
import { Suspense } from 'react';
import { connection } from 'next/server';
import { redirect } from 'next/navigation';
import { requireToken } from '@/shared/lib/auth';
import { fetchOrder } from '@/entities/order';
import { payOrder } from '@/features/checkout/actions';
import { Button } from '@/shared/ui/Button';
import { Notice } from '@/shared/ui/Notice';
import { formatMoney } from '@/shared/lib/money';
import { firstParam } from '@/shared/lib/query';
import { FormSkeleton } from '@/widgets/skeletons';

export const metadata: Metadata = { title: 'Secure payment', robots: { index: false } };

type SP = Promise<Record<string, string | string[] | undefined>>;

/** Simulated payment gateway page. No card data is read or stored. */
async function Gateway({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: SP;
}) {
  await connection();
  const { id } = await params;
  const token = await requireToken(`/pay/${id}`);
  const order = await fetchOrder(token, id);
  if (order.payment.status === 'paid') redirect(`/orders/${id}`);
  const sp = await searchParams;
  const input = 'mt-1 w-full rounded-md border border-forest-200 bg-white px-3 py-2.5 font-sans';
  return (
    <div className="mx-auto max-w-md overflow-hidden rounded-xl border border-forest-200 bg-white shadow-lg">
      <div className="bg-[#1b1b3a] p-6 text-white">
        <p className="font-sans text-xs uppercase tracking-widest opacity-70">
          FakePay · test gateway
        </p>
        <p className="mt-2 font-sans text-3xl font-bold">{formatMoney(order.totalAmount)}</p>
        <p className="font-sans text-sm opacity-70">
          Bay Book Company · order {order.id.slice(-8)}
        </p>
      </div>
      <div className="space-y-4 p-6">
        {sp.declined && (
          <Notice tone="error">The test card was declined. Nothing was charged. Try again.</Notice>
        )}
        {sp.error && <Notice tone="error">{firstParam(sp.error)}</Notice>}
        <Notice>Test mode: any values work. No real card is charged.</Notice>
        <form action={payOrder.bind(null, id)} className="space-y-4">
          <label className="block font-sans text-sm font-medium">
            Card number
            <input
              name="card"
              defaultValue="4242 4242 4242 4242"
              inputMode="numeric"
              autoComplete="off"
              className={input}
            />
          </label>
          <div className="grid grid-cols-2 gap-4">
            <label className="block font-sans text-sm font-medium">
              Expiry
              <input name="exp" defaultValue="12/34" autoComplete="off" className={input} />
            </label>
            <label className="block font-sans text-sm font-medium">
              CVC
              <input name="cvc" defaultValue="123" autoComplete="off" className={input} />
            </label>
          </div>
          <Button type="submit" name="outcome" value="approve" className="w-full rounded-lg py-4">
            Pay {formatMoney(order.totalAmount)}
          </Button>
          <Button
            type="submit"
            name="outcome"
            value="decline"
            variant="outline"
            className="w-full rounded-lg"
          >
            Simulate a declined card
          </Button>
        </form>
      </div>
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
    <Suspense fallback={<FormSkeleton fields={3} label="Loading payment…" />}>
      <Gateway params={params} searchParams={searchParams} />
    </Suspense>
  );
}
