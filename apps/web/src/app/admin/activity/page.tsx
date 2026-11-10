import type { Metadata } from 'next';
import { Suspense } from 'react';
import { apiRequest } from '@/shared/api';
import { adminData } from '@/features/admin/server';
import { PageTitle, Table, cell, dayTime } from '@/features/admin/ui/parts';
import { RowsSkeleton } from '@/widgets/skeletons';

export const metadata: Metadata = { title: 'Activity' };

interface Entry {
  id: string;
  actorEmail: string;
  action: string;
  method: string;
  path: string;
  at: string;
}

async function Activity() {
  const { list } = await adminData('/admin/activity', async (token) => ({
    list: (
      await apiRequest<{ data: Entry[] }>('/admin/audit?limit=100', { token, cache: 'no-store' })
    ).data,
  }));
  return (
    <Table label="Activity" head={['When', 'Who', 'What']}>
      {list.map((a) => (
        <tr key={a.id} data-testid="admin-audit">
          <td className={`${cell} whitespace-nowrap`}>{dayTime.format(new Date(a.at))}</td>
          <td className={cell}>{a.actorEmail}</td>
          <td className={cell}>
            {a.action}
            <span className="block font-mono text-xs text-ink-muted">
              {a.method} {a.path}
            </span>
          </td>
        </tr>
      ))}
      {list.length === 0 && (
        <tr>
          <td className={cell} colSpan={3}>
            No changes recorded yet.
          </td>
        </tr>
      )}
    </Table>
  );
}

export default function AdminActivityPage() {
  return (
    <>
      <PageTitle title="Activity" />
      <p className="-mt-3 mb-5 font-sans text-sm text-ink-muted">
        Every change made by staff, newest first.
      </p>
      <Suspense fallback={<RowsSkeleton rows={8} />}>
        <Activity />
      </Suspense>
    </>
  );
}
