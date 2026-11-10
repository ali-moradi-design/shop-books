'use client';

import { useActionState, type ReactNode } from 'react';
import { Button } from './Button';
import { Notice } from './Notice';
import { cn } from '@/shared/lib/cn';

export interface ActionState {
  error?: string;
  ok?: string;
}

type Action = (prev: ActionState, form: FormData) => Promise<ActionState>;

/**
 * A form posted to a Server Action, with its pending state and result message.
 * The fields come from the (server) parent, so pages stay server components and
 * the form still works before JavaScript loads.
 */
export function ActionForm({
  action,
  submit,
  pendingLabel = 'Please wait…',
  variant = 'solid',
  className,
  buttonClassName,
  children,
}: {
  action: Action;
  submit: string;
  pendingLabel?: string;
  variant?: 'solid' | 'outline' | 'gold';
  className?: string;
  buttonClassName?: string;
  children?: ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className={cn('space-y-4', className)}>
      {state.error && <Notice tone="error">{state.error}</Notice>}
      {state.ok && <Notice tone="success">{state.ok}</Notice>}
      {children}
      <Button type="submit" variant={variant} disabled={pending} className={buttonClassName}>
        {pending ? pendingLabel : submit}
      </Button>
    </form>
  );
}

export const fieldClass =
  'mt-1 w-full rounded-md border border-forest-200 bg-white px-3 py-2.5 font-sans text-base focus-visible:outline-2 focus-visible:outline-forest-500';
export const labelClass = 'block font-sans text-sm font-medium';
