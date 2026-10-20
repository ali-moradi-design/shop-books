'use client';

import { Button } from '@/shared/ui/Button';

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="py-16 text-center" role="alert">
      <h1 className="font-serif text-4xl text-forest-900">Something went wrong</h1>
      <p className="my-4 font-serif text-lg">
        The shop could not load this page. Please try again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
