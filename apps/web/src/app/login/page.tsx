import type { Metadata } from 'next';
import { Suspense } from 'react';
import { login } from '@/features/auth/actions';
import { AuthForm } from '@/features/auth/ui/AuthForm';
import { firstParam } from '@/shared/lib/query';
import { safeNext } from '@/shared/lib/auth';

export const metadata: Metadata = { title: 'Sign in', robots: { index: false } };

async function Form({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const next = safeNext(firstParam((await searchParams).next));
  return <AuthForm mode="login" action={login} next={next} />;
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
