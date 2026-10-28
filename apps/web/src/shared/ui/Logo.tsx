import { cn } from '@/shared/lib/cn';

/** Open-book mark with a gold ribbon. Strokes use currentColor, so it follows the text color. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" aria-hidden="true" className={cn('h-8 w-8 shrink-0', className)}>
      <path
        d="M16 9c-2.6-2-6.6-2.7-11-2v17c4.4-.7 8.4 0 11 2 2.6-2 6.6-2.7 11-2V7c-4.4-.7-8.4 0-11 2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path d="M16 9v17" stroke="currentColor" strokeWidth="2" />
      <path d="M20 7.6v7.6l1.75-1.4 1.75 1.4V7.3" fill="#ffc94d" />
    </svg>
  );
}

/** Mark plus wordmark; the visible name doubles as the accessible name. */
export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn('inline-flex items-center gap-2.5 font-serif text-2xl font-medium', className)}
    >
      <LogoMark />
      <span>Bay Book Company</span>
    </span>
  );
}
