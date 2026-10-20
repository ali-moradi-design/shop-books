import Link from 'next/link';
import { toQuery } from '@/shared/lib/query';
import { cn } from '@/shared/lib/cn';

export function Pagination({
  page,
  pages,
  params,
}: {
  page: number;
  pages: number;
  params: Record<string, string | undefined>;
}) {
  if (pages <= 1) return null;
  const href = (p: number) => `/books${toQuery({ ...params, page: p > 1 ? p : undefined })}`;
  const items = Array.from({ length: pages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === pages || Math.abs(p - page) <= 1,
  );
  const link =
    'grid size-10 place-items-center rounded-[10px] border border-forest-200 bg-white font-sans text-[15px]';
  return (
    <nav aria-label="Pagination" className="mt-12 flex justify-center gap-2">
      {page > 1 && (
        <Link href={href(page - 1)} className={link} aria-label="Previous page">
          ‹
        </Link>
      )}
      {items.map((p, i) => (
        <span key={p} className="contents">
          {i > 0 && p - items[i - 1] > 1 && (
            <span className="grid size-10 place-items-center">…</span>
          )}
          <Link
            href={href(p)}
            aria-current={p === page ? 'page' : undefined}
            className={cn(link, p === page && 'bg-forest-900 text-white')}
          >
            {p}
          </Link>
        </span>
      ))}
      {page < pages && (
        <Link href={href(page + 1)} className={link} aria-label="Next page">
          ›
        </Link>
      )}
    </nav>
  );
}
