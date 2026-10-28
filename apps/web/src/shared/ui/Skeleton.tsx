import { cn } from '@/shared/lib/cn';

/** Grey placeholder block for loading states; hidden from assistive tech. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-pulse rounded-md bg-forest-200/60 motion-reduce:animate-none',
        className,
      )}
    />
  );
}

/** Announces the loading state once for screen readers. */
export function LoadingStatus({ label = 'Loading…' }: { label?: string }) {
  return (
    <p role="status" className="sr-only">
      {label}
    </p>
  );
}
