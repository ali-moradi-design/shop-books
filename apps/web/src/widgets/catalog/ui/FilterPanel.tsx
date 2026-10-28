'use client';

import { useId, useState, type ReactNode } from 'react';
import { cn } from '@/shared/lib/cn';

/** Filters sit in a sidebar on large screens and fold behind a toggle on smaller ones. */
export function FilterPanel({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <aside>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between rounded-sm border-[1.5px] border-forest-900 px-4 py-3 font-sans text-sm font-semibold text-forest-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500 lg:hidden"
      >
        Filters and sorting
        <span aria-hidden="true">{open ? '−' : '+'}</span>
      </button>
      <div id={id} className={cn('mt-4 lg:mt-0 lg:block', open ? 'block' : 'hidden')}>
        {children}
      </div>
    </aside>
  );
}
