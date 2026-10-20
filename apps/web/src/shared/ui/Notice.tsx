import { cn } from '@/shared/lib/cn';

export function Notice({
  tone = 'info',
  children,
}: {
  tone?: 'info' | 'error' | 'success';
  children: React.ReactNode;
}) {
  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'rounded-md border px-4 py-3 font-sans text-sm',
        tone === 'error' && 'border-sale/40 bg-sale/10 text-sale',
        tone === 'success' && 'border-ok/30 bg-mint-100 text-ok',
        tone === 'info' && 'border-forest-200 bg-forest-50 text-forest-900',
      )}
    >
      {children}
    </p>
  );
}
