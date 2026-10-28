'use client';

import { Button } from '@/shared/ui/Button';

/** Route error boundary: `retry` re-fetches the page data and renders it again. */
export default function Error({ retry }: { error: Error; retry: () => void }) {
  return (
    <div className="py-16 text-center" role="alert">
      <h1 className="font-serif text-4xl text-forest-900">Something went wrong</h1>
      <p className="my-4 font-serif text-lg">
        The shop could not load this page. Please try again.
      </p>
      <Button onClick={retry}>Try again</Button>
    </div>
  );
}
