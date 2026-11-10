import type { Metadata } from 'next';
import { Suspense } from 'react';
import { apiRequest } from '@/shared/api';
import type { ApiData } from '@/shared/api';
import { deleteRole, saveRole } from '@/features/admin/actions';
import { adminData } from '@/features/admin/server';
import { PageTitle, small } from '@/features/admin/ui/parts';
import { ActionForm, labelClass } from '@/shared/ui/ActionForm';
import { RowsSkeleton } from '@/widgets/skeletons';

export const metadata: Metadata = { title: 'Roles' };

interface Permission {
  id: string;
  name: string;
  section: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
  permissions: (string | { id: string })[];
}

const BUILT_IN = ['admin', 'customer'];

function RoleFields({ role, sections }: { role?: Role; sections: [string, Permission[]][] }) {
  const chosen = new Set((role?.permissions ?? []).map((p) => (typeof p === 'string' ? p : p.id)));
  const locked = role?.name === 'admin';
  return (
    <>
      <div className="grid gap-4 font-sans sm:grid-cols-2">
        <label className={labelClass}>
          Name
          {role && BUILT_IN.includes(role.name) ? (
            <>
              <input type="hidden" name="name" value={role.name} />
              <span className={`${small} mt-1 block bg-forest-50 py-2`}>{role.name}</span>
            </>
          ) : (
            <input
              name="name"
              required
              minLength={2}
              maxLength={50}
              defaultValue={role?.name}
              className={`${small} mt-1 w-full py-2`}
            />
          )}
        </label>
        <label className={labelClass}>
          Description
          <input
            name="description"
            maxLength={500}
            defaultValue={role?.description}
            className={`${small} mt-1 w-full py-2`}
          />
        </label>
      </div>
      {locked ? (
        <>
          <input type="hidden" name="locked" value="1" />
          <p className="font-sans text-sm text-ink-muted">
            The admin role always has every permission.
          </p>
        </>
      ) : (
        <div className="grid gap-5 font-sans text-sm sm:grid-cols-2 xl:grid-cols-3">
          {sections.map(([section, list]) => (
            <fieldset key={section}>
              <legend className="mb-1 text-xs uppercase tracking-widest text-mint-500">
                {section}
              </legend>
              {list.map((p) => (
                <label key={p.id} className="flex items-center gap-2 py-0.5">
                  <input
                    type="checkbox"
                    name="permissions"
                    value={p.id}
                    defaultChecked={chosen.has(p.id)}
                  />{' '}
                  {p.name}
                </label>
              ))}
            </fieldset>
          ))}
        </div>
      )}
    </>
  );
}

async function Roles() {
  const { roles, permissions } = await adminData('/admin/roles', async (token) => {
    const [roles, permissions] = await Promise.all([
      apiRequest<ApiData<Role[]>>('/roles', { token, cache: 'no-store' }),
      apiRequest<ApiData<Permission[]>>('/permissions', { token, cache: 'no-store' }),
    ]);
    return { roles: roles.data, permissions: permissions.data };
  });
  const sections = Object.entries(
    permissions.reduce<Record<string, Permission[]>>((acc, p) => {
      (acc[p.section] ??= []).push(p);
      return acc;
    }, {}),
  ).sort(([a], [b]) => a.localeCompare(b));
  return (
    <div className="space-y-4">
      {roles.map((r) => (
        <details key={r.id} className="rounded-lg bg-white p-5" data-testid="admin-role">
          <summary className="flex cursor-pointer items-baseline justify-between gap-4 font-serif text-xl capitalize text-forest-900">
            {r.name}
            <span className="font-sans text-sm normal-case text-ink-muted">
              {r.name === 'admin' ? 'All' : r.permissions.length} permissions
            </span>
          </summary>
          <ActionForm action={saveRole.bind(null, r.id)} submit="Save role" className="mt-4">
            <RoleFields role={r} sections={sections} />
          </ActionForm>
          {!BUILT_IN.includes(r.name) && (
            <form action={deleteRole.bind(null, r.id)} className="mt-3">
              <button type="submit" className="font-sans text-sm text-sale underline">
                Delete role
              </button>
            </form>
          )}
        </details>
      ))}
      <details className="rounded-lg bg-white p-5">
        <summary className="cursor-pointer font-serif text-xl text-forest-900">New role</summary>
        <ActionForm action={saveRole.bind(null, undefined)} submit="Create role" className="mt-4">
          <RoleFields sections={sections} />
        </ActionForm>
      </details>
    </div>
  );
}

export default function AdminRolesPage() {
  return (
    <>
      <PageTitle title="Roles" />
      <p className="-mt-3 mb-6 font-sans text-sm text-ink-muted">
        What each role may do. The admin and customer roles are built in.
      </p>
      <Suspense fallback={<RowsSkeleton rows={4} />}>
        <Roles />
      </Suspense>
    </>
  );
}
