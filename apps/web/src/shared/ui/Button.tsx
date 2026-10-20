import Link from 'next/link';
import type { ComponentProps } from 'react';
import { cn } from '@/shared/lib/cn';

const base =
  'inline-flex items-center justify-center rounded-sm px-6 py-3 font-serif text-base font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest-500 disabled:opacity-50';
const variants = {
  solid: 'bg-forest-900 text-white hover:bg-forest-700',
  outline: 'border-[1.5px] border-forest-900 text-forest-900 hover:bg-forest-50',
  gold: 'bg-gold-300 text-forest-900 hover:bg-gold-500',
};

type Variant = keyof typeof variants;

export function Button({
  variant = 'solid',
  className,
  ...props
}: ComponentProps<'button'> & { variant?: Variant }) {
  return <button className={cn(base, variants[variant], className)} {...props} />;
}

export function ButtonLink({
  variant = 'solid',
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant }) {
  return <Link className={cn(base, variants[variant], className)} {...props} />;
}
