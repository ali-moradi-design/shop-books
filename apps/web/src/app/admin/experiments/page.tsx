import type { Metadata } from 'next';
import { Suspense } from 'react';
import { apiRequest } from '@/shared/api';
import { adminData } from '@/features/admin/server';
import { PageTitle, cell, day } from '@/features/admin/ui/parts';
import { EXPERIMENTS } from '@/shared/lib/ab/experiments';
import { RowsSkeleton } from '@/widgets/skeletons';

export const metadata: Metadata = { title: 'A/B tests' };

interface VsControl {
  uplift: number | null;
  pValue: number | null;
}

interface Result {
  key: string;
  started: string;
  variants: {
    name: string;
    visitors: number;
    addToCart: number;
    purchases: number;
    addToCartRate: number;
    purchaseRate: number;
    addToCartVsControl: VsControl | null;
    purchaseVsControl: VsControl | null;
  }[];
}

const pct = (n: number) => `${(n * 100).toFixed(1)}%`;

/** Uplift against the control, and whether the difference is likely real (p < 0.05). */
function Verdict({ vs }: { vs: VsControl | null }) {
  if (!vs) return <span className="text-ink-muted">baseline</span>;
  if (vs.uplift === null || vs.pValue === null)
    return <span className="text-ink-muted">not enough data</span>;
  const sure = vs.pValue < 0.05;
  return (
    <span
      className={
        sure
          ? vs.uplift >= 0
            ? 'font-semibold text-ok'
            : 'font-semibold text-sale'
          : 'text-ink-muted'
      }
    >
      {vs.uplift >= 0 ? '+' : ''}
      {(vs.uplift * 100).toFixed(1)}%
      <span className="block text-xs font-normal">
        {sure ? 'significant' : 'not significant yet'} · p={vs.pValue.toFixed(3)}
      </span>
    </span>
  );
}

async function Results() {
  const { data } = await adminData('/admin/experiments', async (token) => ({
    data: (
      await apiRequest<{ data: Result[] }>('/experiments/results', { token, cache: 'no-store' })
    ).data,
  }));
  const keys = [...new Set([...Object.keys(EXPERIMENTS), ...data.map((r) => r.key)])];
  return (
    <div className="space-y-10">
      {keys.map((key) => {
        const r = data.find((x) => x.key === key);
        return (
          <section key={key} data-testid="experiment" className="rounded-lg bg-white p-6">
            <h2 className="font-serif text-2xl">
              {key}{' '}
              <span className="ml-2 font-sans text-xs uppercase tracking-widest text-mint-500">
                {key in EXPERIMENTS ? 'Running' : 'Ended'}
              </span>
              {r && (
                <span className="ml-2 font-sans text-sm text-ink-muted">
                  since {day.format(new Date(r.started))}
                </span>
              )}
            </h2>
            {!r ? (
              <p className="mt-2 font-sans text-sm text-ink-muted">No visitors yet.</p>
            ) : (
              <div className="mt-4 overflow-x-auto">
                <table className="w-full min-w-[600px] font-sans text-sm">
                  <thead className="bg-forest-50">
                    <tr>
                      {[
                        'Variant',
                        'Visitors',
                        'Add to cart',
                        'vs control',
                        'Purchase',
                        'vs control',
                      ].map((h) => (
                        <th key={h} scope="col" className={cell}>
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="[&>tr]:border-t [&>tr]:border-forest-100">
                    {r.variants.map((v) => (
                      <tr key={v.name}>
                        <th scope="row" className={cell}>
                          {v.name}
                        </th>
                        <td className={cell}>{v.visitors}</td>
                        <td className={cell}>
                          {pct(v.addToCartRate)} ({v.addToCart})
                        </td>
                        <td className={cell}>
                          <Verdict vs={v.addToCartVsControl} />
                        </td>
                        <td className={cell}>
                          {pct(v.purchaseRate)} ({v.purchases})
                        </td>
                        <td className={cell}>
                          <Verdict vs={v.purchaseVsControl} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

export default function ExperimentsPage() {
  return (
    <>
      <PageTitle title="A/B tests" />
      <p className="-mt-3 mb-6 max-w-2xl font-sans text-sm text-ink-muted">
        Each visitor sees one variant and keeps it. Rates count unique visitors who saw the test.
        Wait for “significant” before you pick a winner; tests are set in{' '}
        <code>shared/lib/ab/experiments.ts</code>.
      </p>
      <Suspense fallback={<RowsSkeleton rows={4} />}>
        <Results />
      </Suspense>
    </>
  );
}
