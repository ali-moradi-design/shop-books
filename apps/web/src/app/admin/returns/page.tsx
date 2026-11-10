import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { apiRequest } from '@/shared/api';
import type { ApiPaginated } from '@/shared/api';
import { RETURN_STATUS_LABEL, type ReturnRequest, type ReturnStatus } from '@/entities/order';
import { updateReturn } from '@/features/admin/actions';
import { adminData } from '@/features/admin/server';
import { PageTitle, Table, cell, day } from '@/features/admin/ui/parts';
import { ActionForm } from '@/shared/ui/ActionForm';
import { formatMoney } from '@/shared/lib/money';
import { RowsSkeleton } from '@/widgets/skeletons';

export const metadata: Metadata = { title: 'Returns' };

const NEXT: Record<ReturnStatus, [ReturnStatus, string][]> = {
  requested: [
    ['approved', 'Approve'],
    ['rejected', 'Reject'],
  ],
  approved: [
    ['received', 'Mark received'],
    ['rejected', 'Reject'],
  ],
  received: [['refunded', 'Refund']],
  rejected: [],
  refunded: [],
};

async function Returns() {
  const { list } = await adminData('/admin/returns', async (token) => ({
    list: await apiRequest<ApiPaginated<ReturnRequest>>('/returns?limit=100', {
      token,
      cache: 'no-store',
    }),
  }));
  return (
    <Table label="Returns" head={['Requested', 'Order', 'Books', 'Refund', 'Status', '']}>
      {list.data.map((r) => (
        <tr key={r.id} data-testid="admin-return">
          <td className={cell}>{day.format(new Date(r.createdAt))}</td>
          <td className={cell}>
            <Link prefetch={false} href={`/admin/orders/${r.order}`} className="underline">
              {r.order.slice(-8)}
            </Link>
          </td>
          <td className={cell}>
            {r.items.map((i) => `${i.quantity} × ${i.title}`).join(', ')}
            <span className="block text-xs text-ink-muted">
              {r.reason}
              {r.comment ? ` · “${r.comment}”` : ''}
            </span>
          </td>
          <td className={cell}>{formatMoney(r.refundAmount)}</td>
          <td className={cell}>{RETURN_STATUS_LABEL[r.status]}</td>
          <td className={cell}>
            <div className="flex flex-wrap gap-2">
              {NEXT[r.status].map(([status, label]) => (
                <ActionForm
                  key={status}
                  action={updateReturn.bind(null, r.id, status)}
                  submit={label}
                  variant="outline"
                  className="space-y-1"
                  buttonClassName="px-3 py-1 text-sm"
                />
              ))}
            </div>
          </td>
        </tr>
      ))}
      {list.data.length === 0 && (
        <tr>
          <td className={cell} colSpan={6}>
            No return requests.
          </td>
        </tr>
      )}
    </Table>
  );
}

export default function AdminReturnsPage() {
  return (
    <>
      <PageTitle title="Returns" />
      <p className="-mt-3 mb-5 font-sans text-sm text-ink-muted">
        Approve, receive, then refund. Each step emails the customer; refunds go back through
        Stripe.
      </p>
      <Suspense fallback={<RowsSkeleton rows={5} />}>
        <Returns />
      </Suspense>
    </>
  );
}
