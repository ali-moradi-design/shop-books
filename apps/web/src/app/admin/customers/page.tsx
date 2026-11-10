import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { apiRequest } from '@/shared/api';
import type { ApiData } from '@/shared/api';
import { setUserActive } from '@/features/admin/actions';
import { adminData } from '@/features/admin/server';
import { PageTitle, Table, cell, day } from '@/features/admin/ui/parts';
import { RowsSkeleton } from '@/widgets/skeletons';

export const metadata: Metadata = { title: 'Customers' };

interface ApiUser {
  id: string;
  name: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  roles: ({ name: string } | string)[];
}

async function Customers() {
  const { users, token } = await adminData('/admin/customers', async (token) => ({
    users: (await apiRequest<ApiData<ApiUser[]>>('/users', { token, cache: 'no-store' })).data,
  }));
  const me = (await apiRequest<ApiData<{ id: string }>>('/users/me', { token, cache: 'no-store' }))
    .data;
  return (
    <Table label="Customers" head={['Name', 'Email', 'Roles', 'Joined', 'Status', '']}>
      {users.map((u) => (
        <tr key={u.id}>
          <td className={cell}>{u.name}</td>
          <td className={cell}>{u.email}</td>
          <td className={cell}>
            {u.roles.map((r) => (typeof r === 'string' ? r : r.name)).join(', ')}
          </td>
          <td className={cell}>{day.format(new Date(u.createdAt))}</td>
          <td className={cell}>{u.isActive ? 'Active' : 'Blocked'}</td>
          <td className={cell}>
            {u.id !== me.id && (
              <form action={setUserActive.bind(null, u.id, !u.isActive)}>
                <button type="submit" className={u.isActive ? 'text-sale underline' : 'underline'}>
                  {u.isActive ? 'Block' : 'Unblock'}
                </button>
              </form>
            )}
          </td>
        </tr>
      ))}
    </Table>
  );
}

export default function AdminCustomersPage() {
  return (
    <>
      <PageTitle title="Customers">
        <a href="/admin/export/customers" className="underline">
          Export CSV
        </a>
        <Link href="/admin/roles" className="underline">
          Roles
        </Link>
      </PageTitle>
      <Suspense fallback={<RowsSkeleton rows={6} />}>
        <Customers />
      </Suspense>
    </>
  );
}
