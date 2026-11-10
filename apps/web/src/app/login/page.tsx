import type { Metadata } from 'next';
import { Suspense } from 'react';
import { login } from '@/features/auth/actions';
import { AuthForm } from '@/features/auth/ui/AuthForm';
import { firstParam } from '@/shared/lib/query';
import { safeNext } from '@/shared/lib/auth';
import Link from 'next/link';
import { startGuest } from '@/features/account/actions';
import { ActionForm, fieldClass, labelClass } from '@/shared/ui/ActionForm';
import { Notice } from '@/shared/ui/Notice';

export const metadata: Metadata = { title: 'Sign in', robots: { index: false } };

async function Form({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const next = safeNext(firstParam(sp.next));
  // fixed messages only: text from the URL could be written by anyone
  const msg = sp.reset ? 'Your password is set. Sign in with it now.' : undefined;
  return (
    <>
      {msg && (
        <div className="mb-4">
          <Notice tone="success">{msg}</Notice>
        </div>
      )}
      <AuthForm mode="login" action={login} next={next} />
      <Link
        href="/forgot-password"
        className="mt-3 inline-block font-sans text-sm text-ink-muted underline"
      >
        Forgot your password?
      </Link>
      <section aria-labelledby="guest-title" className="mt-8 border-t border-forest-100 pt-6">
        <h2 id="guest-title" className="font-serif text-2xl text-forest-900">
          In a hurry?
        </h2>
        <p className="mb-4 mt-1 font-sans text-sm text-ink-muted">
          Continue as a guest. We email you a link to set a password later, so you can follow your
          order.
        </p>
        <ActionForm
          action={startGuest}
          submit="Continue as guest"
          variant="outline"
          buttonClassName="w-full"
        >
          <input type="hidden" name="next" value={next} />
          <label className={labelClass}>
            Name
            <input name="name" required minLength={2} autoComplete="name" className={fieldClass} />
          </label>
          <label className={labelClass}>
            Email for your receipt
            <input name="email" type="email" required autoComplete="email" className={fieldClass} />
          </label>
        </ActionForm>
      </section>
    </>
  );
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="mx-auto max-w-md rounded-md bg-white p-8">
      <h1 className="mb-6 font-serif text-4xl font-medium text-forest-900">Sign in</h1>
      <p className="mb-6 font-sans text-sm text-ink-muted">
        Demo accounts: <code>customer@bookstore.local</code> / <code>Customer123!</code> · admin:{' '}
        <code>admin@bookstore.local</code> / <code>Admin123!</code>
      </p>
      <Suspense>
        <Form searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
