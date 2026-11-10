'use client';

import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import { cn } from '@/shared/lib/cn';

const LINKS = [
  [null, '/admin', 'Dashboard'],
  ['books', '/admin/books', 'Books'],
  ['orders', '/admin/orders', 'Orders'],
  ['returns', '/admin/returns', 'Returns'],
  ['discounts', '/admin/discounts', 'Discounts'],
  ['customers', '/admin/customers', 'Customers'],
  ['reviews', '/admin/reviews', 'Reviews'],
  ['emails', '/admin/emails', 'Emails'],
  ['experiments', '/admin/experiments', 'A/B tests'],
  ['roles', '/admin/roles', 'Roles'],
  ['activity', '/admin/activity', 'Activity'],
] as const;

/** Side menu on desktop, a scrolling strip on phones; the current section is marked. */
export function AdminNav() {
  const segment = useSelectedLayoutSegment();
  return (
    <nav
      aria-label="Admin"
      className="overflow-x-auto border-b border-forest-200 lg:overflow-visible lg:border-0"
    >
      <ul className="flex gap-5 whitespace-nowrap font-sans text-sm lg:flex-col lg:gap-1">
        {LINKS.map(([seg, href, label]) => {
          const current = seg === segment;
          return (
            <li key={href}>
              <Link
                href={href}
                aria-current={current ? 'page' : undefined}
                className={cn(
                  'block pb-3 pt-1 lg:rounded-md lg:px-3 lg:py-2',
                  current
                    ? 'border-b-2 border-forest-900 font-semibold text-forest-900 lg:border-0 lg:bg-white'
                    : 'text-ink-muted hover:text-forest-900',
                )}
              >
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
