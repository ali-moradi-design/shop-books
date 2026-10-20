import { cn } from '@/shared/lib/cn';

export function Stars({ value, className }: { value: number; className?: string }) {
  const full = Math.round(value);
  return (
    <span
      className={cn('text-sm tracking-widest text-star', className)}
      role="img"
      aria-label={`${value.toFixed(1)} out of 5 stars`}
    >
      {'★'.repeat(full)}
      <span aria-hidden="true">{'☆'.repeat(5 - full)}</span>
    </span>
  );
}
