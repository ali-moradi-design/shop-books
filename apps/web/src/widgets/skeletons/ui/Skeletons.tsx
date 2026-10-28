import { LoadingStatus, Skeleton } from '@/shared/ui/Skeleton';

/** Route-level loading states. Each mirrors the layout of its page, so nothing jumps when data arrives. */

function Title({ className = 'w-64' }: { className?: string }) {
  return <Skeleton className={`h-10 ${className}`} />;
}

export function BookCardSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-[2/3] w-full rounded-sm" />
      <Skeleton className="mt-4 h-5 w-4/5" />
      <Skeleton className="mt-2 h-4 w-1/2" />
      <Skeleton className="mt-3 h-5 w-16" />
    </div>
  );
}

export function HomeSkeleton() {
  return (
    <div>
      <LoadingStatus label="Loading the shop…" />
      <div className="relative left-1/2 -mt-10 flex min-h-[520px] w-screen -translate-x-1/2 items-center justify-center bg-wood-500/80 px-6">
        <div className="w-full max-w-[560px] bg-white p-6 sm:p-10">
          <Skeleton className="h-12 w-11/12" />
          <Skeleton className="mt-3 h-12 w-2/3" />
          <Skeleton className="mt-6 h-5 w-full" />
          <Skeleton className="mt-2 h-5 w-3/4" />
          <div className="mt-6 flex gap-3">
            <Skeleton className="h-11 w-40" />
            <Skeleton className="h-11 w-32" />
          </div>
        </div>
      </div>
      <Title className="mt-14 w-48" />
      <div className="mt-8 grid grid-cols-2 gap-7 md:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: 6 }, (_, i) => (
          <BookCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

export function CatalogSkeleton() {
  return (
    <div className="grid gap-12 lg:grid-cols-[280px_1fr]">
      <LoadingStatus label="Loading books…" />
      <div className="hidden space-y-3 lg:block">
        <Skeleton className="h-4 w-20" />
        {Array.from({ length: 10 }, (_, i) => (
          <Skeleton key={i} className="h-9 w-full" />
        ))}
      </div>
      <div>
        <Title />
        <Skeleton className="mb-8 mt-2 h-4 w-20" />
        <div className="grid grid-cols-2 gap-x-7 gap-y-10 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {Array.from({ length: 10 }, (_, i) => (
            <BookCardSkeleton key={i} />
          ))}
        </div>
      </div>
    </div>
  );
}

export function BookDetailSkeleton() {
  return (
    <div>
      <LoadingStatus label="Loading book…" />
      <Skeleton className="h-4 w-full max-w-72" />
      <div className="mt-6 grid gap-10 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:[&>*:nth-child(3)]:col-start-2 xl:grid-cols-[minmax(0,380px)_minmax(0,1fr)_340px] xl:gap-12 xl:[&>*:nth-child(3)]:col-start-auto">
        <Skeleton className="aspect-[2/3] w-full max-w-[420px] rounded-sm" />
        <div>
          <Skeleton className="h-12 w-4/5" />
          <Skeleton className="mt-3 h-6 w-1/2" />
          <div className="mt-8 space-y-2">
            {Array.from({ length: 6 }, (_, i) => (
              <Skeleton key={i} className="h-4 w-full" />
            ))}
          </div>
        </div>
        <BuyBoxSkeleton />
      </div>
    </div>
  );
}

export function BuyBoxSkeleton() {
  return (
    <div className="h-fit rounded-[10px] border border-forest-200 bg-white p-7">
      <Skeleton className="h-10 w-28" />
      <Skeleton className="mt-4 h-4 w-32" />
      <Skeleton className="mt-6 h-12 w-full" />
      <Skeleton className="mt-3 h-12 w-full" />
    </div>
  );
}

export function ReviewsSkeleton() {
  return (
    <div className="space-y-4 pt-16">
      <Skeleton className="h-8 w-40" />
      {Array.from({ length: 2 }, (_, i) => (
        <Skeleton key={i} className="h-24 w-full" />
      ))}
    </div>
  );
}

/** Stacked rows only, for a Suspense fallback under a heading the page already shows. */
export function RowsSkeleton({ rows = 4, label }: { rows?: number; label?: string }) {
  return (
    <div className="space-y-4">
      <LoadingStatus label={label} />
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-lg" />
      ))}
    </div>
  );
}

/** Title plus stacked rows: cart, orders, reading list, admin. */
export function ListSkeleton({ rows = 4, label }: { rows?: number; label?: string }) {
  return (
    <div>
      <Title />
      <div className="mt-8">
        <RowsSkeleton rows={rows} label={label} />
      </div>
    </div>
  );
}

/** A centred card with fields: sign in, register, payment, checkout, new book. */
export function FormSkeleton({
  fields = 2,
  wide = false,
  label,
}: {
  fields?: number;
  wide?: boolean;
  label?: string;
}) {
  return (
    <div className={`mx-auto rounded-md bg-white p-8 ${wide ? 'max-w-2xl' : 'max-w-md'}`}>
      <LoadingStatus label={label} />
      <Title className="w-40" />
      <Skeleton className="mt-6 h-4 w-full" />
      {Array.from({ length: fields }, (_, i) => (
        <div key={i} className="mt-6">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="mt-2 h-11 w-full" />
        </div>
      ))}
      <Skeleton className="mt-8 h-12 w-full" />
    </div>
  );
}
