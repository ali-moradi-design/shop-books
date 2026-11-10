import type { Metadata } from 'next';
import { Suspense } from 'react';
import { connection } from 'next/server';
import { notFound, redirect } from 'next/navigation';
import { apiRequest, ApiError } from '@/shared/api';
import type { ApiData } from '@/shared/api';
import { requireToken } from '@/shared/lib/auth';
import { SimulatorForm } from '@/features/checkout/ui/SimulatorForm';
import { formatMoney } from '@/shared/lib/money';
import { FormSkeleton } from '@/widgets/skeletons';

export const metadata: Metadata = { title: 'Checkout', robots: { index: false } };

interface Session {
  id: string;
  orderId: string;
  status: string;
  amount: number;
  cancelUrl: string;
  lines: { title: string; unitAmount: number; quantity: number }[];
}

const CARDS = [
  ['4242 4242 4242 4242', 'Pays'],
  ['4000 0000 0000 0002', 'Declined'],
  ['4000 0000 0000 9995', 'Insufficient funds'],
] as const;

/**
 * Stand-in for Stripe's hosted Checkout page, used when the API has no Stripe
 * key; `id` is the Checkout Session. Paying makes the API send itself the signed
 * webhook Stripe would, then the browser returns to the order like after Stripe.
 */
async function Simulator({ params }: { params: Promise<{ id: string }> }) {
  await connection();
  const { id } = await params;
  const token = await requireToken(`/pay/${id}`);
  let session: Session;
  try {
    session = (
      await apiRequest<ApiData<Session>>(`/payments/simulator/sessions/${encodeURIComponent(id)}`, {
        token,
        cache: 'no-store',
      })
    ).data;
  } catch (e) {
    // a 404 also covers a shop that uses real Stripe, where this page does not exist
    if (e instanceof ApiError && [400, 403, 404].includes(e.status)) notFound();
    throw e;
  }
  if (session.status !== 'pending_payment') redirect(`/orders/${session.orderId}`);
  return (
    <div className="mx-auto grid max-w-4xl gap-10 overflow-hidden rounded-xl border border-forest-200 bg-white p-8 font-sans text-[#1a1f36] md:grid-cols-2">
      <section aria-label="Order summary">
        <a
          href={session.cancelUrl}
          className="inline-flex items-center gap-2 text-sm text-[#697386] hover:text-[#1a1f36]"
        >
          <span aria-hidden>←</span> Bay Book Company
          <span className="rounded bg-[#ffde92] px-1.5 py-0.5 text-[11px] font-semibold uppercase text-[#983705]">
            Test mode
          </span>
        </a>
        <p className="mt-6 text-[#697386]">Pay Bay Book Company</p>
        <p className="text-4xl font-semibold tracking-tight" data-testid="pay-amount">
          {formatMoney(session.amount)}
        </p>
        <ul className="mt-6 space-y-3 text-sm">
          {session.lines.map((l) => (
            <li key={l.title} className="flex justify-between gap-4">
              <span>
                {l.quantity > 1 ? `${l.quantity} × ` : ''}
                {l.title}
              </span>
              <span>{formatMoney(l.unitAmount * l.quantity)}</span>
            </li>
          ))}
        </ul>
      </section>
      <section aria-label="Payment">
        <h1 className="mb-5 text-xl font-semibold">Pay with card</h1>
        <SimulatorForm sessionId={session.id} amount={session.amount} />
        <div className="mt-6 rounded-md bg-[#f6f8fa] p-4 text-[13px] text-[#697386]">
          <p className="font-medium text-[#1a1f36]">Stripe test cards</p>
          <ul className="mt-2 space-y-1">
            {CARDS.map(([n, r]) => (
              <li key={n} className="flex justify-between">
                <span className="font-mono">{n}</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3">
            Simulated Stripe Checkout: no Stripe account or real money. Paying sends a signed{' '}
            <code>checkout.session.completed</code> webhook to the shop, which then confirms the
            order.
          </p>
        </div>
      </section>
    </div>
  );
}

export default function PayPage({ params }: { params: Promise<{ id: string }> }) {
  return (
    <Suspense fallback={<FormSkeleton />}>
      <Simulator params={params} />
    </Suspense>
  );
}
