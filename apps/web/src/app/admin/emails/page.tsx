import type { Metadata } from 'next';
import { Suspense } from 'react';
import { apiRequest } from '@/shared/api';
import { adminData } from '@/features/admin/server';
import { PageTitle, Table, cell, dayTime } from '@/features/admin/ui/parts';
import { RowsSkeleton } from '@/widgets/skeletons';

export const metadata: Metadata = { title: 'Emails' };

interface Email {
  id: string;
  to: string;
  subject: string;
  template: string;
  status: 'sent' | 'outbox' | 'failed';
  text: string;
  createdAt: string;
}

async function Emails() {
  const { emails, subs } = await adminData('/admin/emails', async (token) => {
    const [emails, subs] = await Promise.all([
      apiRequest<{ data: Email[]; meta: { total: number; transport: 'smtp' | 'outbox' } }>(
        '/emails?limit=50',
        { token, cache: 'no-store' },
      ),
      apiRequest<{
        data: { id: string; email: string; createdAt: string }[];
        meta: { total: number };
      }>('/newsletter?limit=10', { token, cache: 'no-store' }),
    ]);
    return { emails, subs };
  });
  return (
    <>
      <p className="-mt-3 mb-5 font-sans text-sm text-ink-muted">
        {emails.meta.transport === 'smtp'
          ? 'Sent through SMTP. A copy of each message is kept here.'
          : 'No SMTP server is set (SMTP_URL), so messages are kept here instead of sent. Open one to read it.'}
      </p>
      <Table label="Emails" head={['When', 'To', 'Subject', 'Status']}>
        {emails.data.map((e) => (
          <tr key={e.id} data-testid="admin-email">
            <td className={`${cell} whitespace-nowrap`}>{dayTime.format(new Date(e.createdAt))}</td>
            <td className={cell}>{e.to}</td>
            <td className={cell}>
              <details>
                <summary className="cursor-pointer">{e.subject}</summary>
                <p className="mt-2 whitespace-pre-wrap border-l-2 border-forest-200 pl-3 text-ink-muted">
                  {e.text}
                </p>
              </details>
            </td>
            <td className={cell}>
              {e.status === 'outbox' ? 'Kept (no SMTP)' : e.status === 'sent' ? 'Sent' : 'Failed'}
            </td>
          </tr>
        ))}
        {emails.data.length === 0 && (
          <tr>
            <td className={cell} colSpan={4}>
              No emails yet.
            </td>
          </tr>
        )}
      </Table>
      <section className="mt-12">
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="font-serif text-2xl">Newsletter · {subs.meta.total} subscribers</h2>
          <a href="/admin/export/subscribers" className="font-sans text-sm underline">
            Export CSV
          </a>
        </div>
        <ul className="divide-y divide-forest-100 rounded-lg bg-white px-6 font-sans text-sm">
          {subs.data.map((s) => (
            <li key={s.id} className="py-2">
              {s.email}
            </li>
          ))}
          {subs.data.length === 0 && <li className="py-2 text-ink-muted">No subscribers yet.</li>}
        </ul>
      </section>
    </>
  );
}

export default function AdminEmailsPage() {
  return (
    <>
      <PageTitle title="Emails" />
      <Suspense fallback={<RowsSkeleton rows={6} />}>
        <Emails />
      </Suspense>
    </>
  );
}
