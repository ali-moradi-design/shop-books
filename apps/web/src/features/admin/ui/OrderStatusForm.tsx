'use client';

import { useActionState, useState } from 'react';
import { updateOrderStatus } from '../actions';
import { NEXT_STATUSES, type OrderStatus } from '@/entities/order';
import { Button } from '@/shared/ui/Button';
import { Notice } from '@/shared/ui/Notice';

const CARRIERS = ['UPS', 'USPS', 'FedEx', 'DHL', 'Other'];
const box = 'rounded-md border border-forest-200 bg-white px-3 py-2 font-sans text-sm';

/** Next status, plus carrier and tracking number when shipping. */
export function OrderStatusForm({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const options = NEXT_STATUSES[status];
  const [next, setNext] = useState<OrderStatus | undefined>(options[0]);
  // after a change the order has new next steps; reset the choice but keep the message
  const [seen, setSeen] = useState(status);
  if (seen !== status) {
    setSeen(status);
    setNext(options[0]);
  }
  const [state, action, pending] = useActionState(updateOrderStatus.bind(null, orderId), {});
  if (options.length === 0)
    return <p className="font-sans text-sm text-ink-muted">This order is final.</p>;
  return (
    <form action={action} className="space-y-3 font-sans text-sm">
      {state.error && <Notice tone="error">{state.error}</Notice>}
      {state.ok && <Notice tone="success">{state.ok}</Notice>}
      <div className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="text-ink-muted">Move to</span>
          <select
            name="status"
            value={next}
            onChange={(e) => setNext(e.target.value as OrderStatus)}
            className={box}
          >
            {options.map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ')}
              </option>
            ))}
          </select>
        </label>
        {next === 'shipped' && (
          <>
            <label className="flex flex-col gap-1">
              <span className="text-ink-muted">Carrier</span>
              <select name="carrier" className={box}>
                {CARRIERS.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-ink-muted">Tracking number</span>
              <input name="trackingNumber" required minLength={4} className={`${box} font-mono`} />
            </label>
          </>
        )}
        <label className="flex min-w-[200px] flex-1 flex-col gap-1">
          <span className="text-ink-muted">Note (optional)</span>
          <input name="note" maxLength={500} className={box} />
        </label>
        <Button type="submit" disabled={pending} className="py-2">
          {pending ? 'Saving…' : 'Update'}
        </Button>
      </div>
    </form>
  );
}
