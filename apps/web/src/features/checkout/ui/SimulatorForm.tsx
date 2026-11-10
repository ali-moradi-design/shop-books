'use client';

import { useActionState } from 'react';
import { paySimulated } from '../actions';
import { Notice } from '@/shared/ui/Notice';
import { formatMoney } from '@/shared/lib/money';

const field =
  'mt-1 w-full rounded-md border border-[#d0d5dd] px-3 py-2.5 font-sans outline-none focus:border-[#635bff] focus:ring-2 focus:ring-[#635bff]/25';

/** The card form of the simulated Stripe Checkout page. */
export function SimulatorForm({ sessionId, amount }: { sessionId: string; amount: number }) {
  const [state, action, pending] = useActionState(paySimulated.bind(null, sessionId), {});
  return (
    <form action={action} className="space-y-4 font-sans text-sm">
      {state.error && <Notice tone="error">{state.error}</Notice>}
      <label className="block font-medium">
        Card number
        <input
          name="card"
          defaultValue="4242 4242 4242 4242"
          inputMode="numeric"
          autoComplete="cc-number"
          required
          className={field}
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block font-medium">
          Expiry
          <input
            name="expiry"
            defaultValue="12 / 30"
            autoComplete="cc-exp"
            required
            className={field}
          />
        </label>
        <label className="block font-medium">
          CVC
          <input
            name="cvc"
            defaultValue="123"
            inputMode="numeric"
            autoComplete="cc-csc"
            required
            className={field}
          />
        </label>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-[#635bff] px-4 py-3 text-base font-semibold text-white hover:bg-[#5249e0] disabled:opacity-60"
      >
        {pending ? 'Processing…' : `Pay ${formatMoney(amount)}`}
      </button>
    </form>
  );
}
