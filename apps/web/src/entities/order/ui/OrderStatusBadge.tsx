import type { OrderStatus } from '../model/types';
import { cn } from '@/shared/lib/cn';

const label: Record<OrderStatus, string> = {
  pending_payment: 'Awaiting payment',
  paid: 'Paid',
  processing: 'Processing',
  shipped: 'Shipped',
  completed: 'Completed',
  cancelled: 'Cancelled',
  failed: 'Payment failed',
};

export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const good =
    status === 'paid' || status === 'completed' || status === 'shipped' || status === 'processing';
  return (
    <span
      className={cn(
        'inline-block rounded-full px-3 py-1 font-sans text-xs font-semibold',
        good
          ? 'bg-mint-100 text-ok'
          : status === 'pending_payment'
            ? 'bg-gold-300/50 text-forest-900'
            : 'bg-sale/10 text-sale',
      )}
    >
      {label[status] ?? status}
    </span>
  );
}
