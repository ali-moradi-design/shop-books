import type { Metadata } from 'next';
import { Suspense } from 'react';
import { apiRequest } from '@/shared/api';
import type { ApiData } from '@/shared/api';
import { createDiscount, setDiscountActive } from '@/features/admin/actions';
import { adminData } from '@/features/admin/server';
import { PageTitle, Table, cell, day, small } from '@/features/admin/ui/parts';
import { ActionForm, labelClass } from '@/shared/ui/ActionForm';
import { formatMoney } from '@/shared/lib/money';
import { RowsSkeleton } from '@/widgets/skeletons';

export const metadata: Metadata = { title: 'Discounts' };

interface Discount {
  id: string;
  code: string;
  type: 'percent' | 'fixed';
  value: number;
  minOrderAmount?: number;
  maxUses?: number;
  usedCount: number;
  endsAt?: string | null;
  isActive: boolean;
}

async function Discounts() {
  const { list } = await adminData('/admin/discounts', async (token) => ({
    list: (await apiRequest<ApiData<Discount[]>>('/discounts', { token, cache: 'no-store' })).data,
  }));
  return (
    <div className="space-y-8">
      <section className="rounded-lg bg-white p-6">
        <h2 className="mb-4 font-serif text-2xl">New code</h2>
        <ActionForm action={createDiscount} submit="Create code">
          <div className="grid gap-4 font-sans sm:grid-cols-3">
            <label className={labelClass}>
              Code
              <input
                name="code"
                required
                placeholder="SUMMER15"
                className={`${small} mt-1 w-full py-2 uppercase`}
              />
            </label>
            <label className={labelClass}>
              Type
              <select name="type" className={`${small} mt-1 w-full py-2`}>
                <option value="percent">Percent off</option>
                <option value="fixed">Dollars off</option>
              </select>
            </label>
            <label className={labelClass}>
              Value
              <input
                name="value"
                required
                inputMode="decimal"
                placeholder="15"
                className={`${small} mt-1 w-full py-2`}
              />
            </label>
            <label className={labelClass}>
              Minimum order ($, optional)
              <input
                name="minOrderAmount"
                inputMode="decimal"
                className={`${small} mt-1 w-full py-2`}
              />
            </label>
            <label className={labelClass}>
              Max uses (optional)
              <input name="maxUses" type="number" min={1} className={`${small} mt-1 w-full py-2`} />
            </label>
            <label className={labelClass}>
              Ends (optional)
              <input name="endsAt" type="date" className={`${small} mt-1 w-full py-2`} />
            </label>
          </div>
        </ActionForm>
      </section>
      <Table label="Discount codes" head={['Code', 'Value', 'Used', 'Ends', 'Status', '']}>
        {list.map((d) => (
          <tr key={d.id}>
            <td className={`${cell} font-mono`}>{d.code}</td>
            <td className={cell}>
              {d.type === 'percent' ? `${d.value}%` : formatMoney(d.value)}
              {d.minOrderAmount ? ` over ${formatMoney(d.minOrderAmount)}` : ''}
            </td>
            <td className={cell}>
              {d.usedCount}
              {d.maxUses ? ` / ${d.maxUses}` : ''}
            </td>
            <td className={cell}>{d.endsAt ? day.format(new Date(d.endsAt)) : '—'}</td>
            <td className={cell}>{d.isActive ? 'Active' : 'Paused'}</td>
            <td className={cell}>
              <form action={setDiscountActive.bind(null, d.id, !d.isActive)}>
                <button type="submit" className="underline">
                  {d.isActive ? 'Pause' : 'Activate'}
                </button>
              </form>
            </td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

export default function AdminDiscountsPage() {
  return (
    <>
      <PageTitle title="Discounts" />
      <Suspense fallback={<RowsSkeleton rows={5} />}>
        <Discounts />
      </Suspense>
    </>
  );
}
