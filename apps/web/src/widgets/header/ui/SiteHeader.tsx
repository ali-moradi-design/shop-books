import Link from 'next/link';
import type { ReactNode } from 'react';

export function SiteHeader({
  modeLabel,
  trailing,
}: {
  modeLabel: string;
  trailing?: ReactNode;
}) {
  return (
    <header className="bg-forest-900 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="font-serif text-2xl font-medium">
            Niko Bookshop
          </Link>
          <span className="rounded-md bg-mint-300 px-2 py-0.5 font-sans text-xs font-semibold uppercase tracking-wide text-forest-900">
            {modeLabel}
          </span>
        </div>
        <nav aria-label="Primary" className="flex items-center gap-4 font-sans text-sm text-mint-100">
          <Link href="/" className="hover:text-white">
            Catalog
          </Link>
          {trailing}
        </nav>
      </div>
    </header>
  );
}
