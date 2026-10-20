'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import type { FormState } from '../actions';
import { Button } from '@/shared/ui/Button';
import { Notice } from '@/shared/ui/Notice';

type Action = (prev: FormState, form: FormData) => Promise<FormState>;

const field =
  'mt-1 w-full rounded-md border border-forest-200 bg-white px-3 py-2.5 font-sans text-base focus-visible:outline-2 focus-visible:outline-forest-500';

export function AuthForm({
  mode,
  action,
  next,
}: {
  mode: 'login' | 'register';
  action: Action;
  next: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const isLogin = mode === 'login';
  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      {state.error && <Notice tone="error">{state.error}</Notice>}
      {!isLogin && (
        <label className="block font-sans text-sm font-medium">
          Name
          <input name="name" required minLength={2} autoComplete="name" className={field} />
        </label>
      )}
      <label className="block font-sans text-sm font-medium">
        Email
        <input name="email" type="email" required autoComplete="email" className={field} />
      </label>
      <label className="block font-sans text-sm font-medium">
        Password
        <input
          name="password"
          type="password"
          required
          minLength={isLogin ? 1 : 8}
          autoComplete={isLogin ? 'current-password' : 'new-password'}
          className={field}
        />
      </label>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Please wait…' : isLogin ? 'Sign in' : 'Create account'}
      </Button>
      <p className="font-sans text-sm text-ink-muted">
        {isLogin ? (
          <>
            New here?{' '}
            <Link
              className="font-semibold text-forest-700 underline"
              href={`/register?next=${encodeURIComponent(next)}`}
            >
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already registered?{' '}
            <Link
              className="font-semibold text-forest-700 underline"
              href={`/login?next=${encodeURIComponent(next)}`}
            >
              Sign in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
