import type { Metadata } from 'next';
import { Suspense } from 'react';
import { unsubscribe } from '@/features/newsletter/actions';
import { ActionForm } from '@/shared/ui/ActionForm';
import { firstParam } from '@/shared/lib/query';

export const metadata: Metadata = { title: 'Unsubscribe', referrer: 'no-referrer' };

type SP = Promise<Record<string, string | string[] | undefined>>;

/** A button, not an automatic unsubscribe: mail scanners open links and would unsubscribe people. */
async function Body({ searchParams }: { searchParams: SP }) {
  const token = firstParam((await searchParams).token);
  if (!token) return <p className="font-sans">This link is not complete.</p>;
  return <ActionForm action={unsubscribe.bind(null, token)} submit="Unsubscribe" />;
}

export default function UnsubscribePage({ searchParams }: { searchParams: SP }) {
  return (
    <div className="mx-auto max-w-md rounded-md bg-white p-8 text-center">
      <h1 className="mb-4 font-serif text-4xl font-medium text-forest-900">Newsletter</h1>
      <p className="mb-6 font-sans text-ink-muted">Stop getting our newsletter?</p>
      <Suspense>
        <Body searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
