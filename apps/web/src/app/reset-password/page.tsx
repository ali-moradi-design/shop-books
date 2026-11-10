import type { Metadata } from 'next';
import Link from 'next/link';
import { Suspense } from 'react';
import { resetPassword } from '@/features/account/actions';
import { ActionForm, fieldClass, labelClass } from '@/shared/ui/ActionForm';
import { firstParam } from '@/shared/lib/query';

export const metadata: Metadata = { title: 'Choose a new password', referrer: 'no-referrer' };

type SP = Promise<Record<string, string | string[] | undefined>>;

async function Form({ searchParams }: { searchParams: SP }) {
  const token = firstParam((await searchParams).token);
  if (!token || !/^[a-f0-9]{64,128}$/.test(token)) {
    return (
      <p className="font-sans">
        This link is not complete.{' '}
        <Link href="/forgot-password" className="underline">
          Ask for a new one
        </Link>
        .
      </p>
    );
  }
  return (
    <ActionForm
      action={resetPassword.bind(null, token)}
      submit="Save password"
      buttonClassName="w-full"
    >
      <label className={labelClass}>
        New password
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        Repeat it
        <input
          name="confirm"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className={fieldClass}
        />
      </label>
    </ActionForm>
  );
}

export default function ResetPasswordPage({ searchParams }: { searchParams: SP }) {
  return (
    <div className="mx-auto max-w-md rounded-md bg-white p-8">
      <h1 className="mb-6 font-serif text-4xl font-medium text-forest-900">
        Choose a new password
      </h1>
      <Suspense>
        <Form searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
