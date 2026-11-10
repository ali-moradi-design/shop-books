import type { ReactNode } from 'react';

export const cell = 'px-3 py-2.5 text-left align-middle';
export const small = 'rounded-md border border-forest-200 bg-white px-2 py-1.5 font-sans text-sm';

export function PageTitle({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <h1 className="font-serif text-4xl font-medium text-forest-900">{title}</h1>
      {children && (
        <div className="flex flex-wrap items-center gap-4 font-sans text-sm">{children}</div>
      )}
    </div>
  );
}

/** A table that scrolls sideways on small screens. */
export function Table({
  head,
  children,
  label,
}: {
  head: ReactNode[];
  children: ReactNode;
  label: string;
}) {
  return (
    <div className="overflow-x-auto rounded-lg bg-white">
      <table className="w-full min-w-[640px] font-sans text-sm" aria-label={label}>
        <thead className="bg-forest-50">
          <tr>
            {head.map((h, i) => (
              <th key={i} scope="col" className={cell}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="[&>tr]:border-t [&>tr]:border-forest-100">{children}</tbody>
      </table>
    </div>
  );
}

export const day = new Intl.DateTimeFormat('en-US', { dateStyle: 'medium' });
export const dayTime = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'medium',
  timeStyle: 'short',
});
