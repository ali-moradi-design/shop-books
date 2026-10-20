import type { Metadata } from 'next';
import { Suspense } from 'react';
import { register } from '@/features/auth/actions';
import { AuthForm } from '@/features/auth/ui/AuthForm';
import { firstParam } from '@/shared/lib/query';
import { safeNext } from '@/shared/lib/auth';

export const metadata: Metadata = { title: 'Create account', robots: { index: false } };

async function Form({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const next = safeNext(firstParam((await searchParams).next));
  return <AuthForm mode="register" action={register} next={next} />;
}

export default function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <div className="mx-auto max-w-md rounded-md bg-white p-8">
      <h1 className="mb-6 font-serif text-4xl font-medium text-forest-900">Create account</h1>
      <Suspense>
        <Form searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
