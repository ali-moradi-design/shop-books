'use client';

import { useActionState } from 'react';
import { importBooks, type ImportState } from '../actions';
import { Button } from '@/shared/ui/Button';
import { Notice } from '@/shared/ui/Notice';

/** Check the file first (changes nothing), then import. */
export function ImportForm() {
  const [state, action, pending] = useActionState<ImportState, FormData>(importBooks, {});
  return (
    <form action={action} className="space-y-4 rounded-lg bg-white p-6 font-sans text-sm">
      {state.error && <Notice tone="error">{state.error}</Notice>}
      {state.ok && <Notice tone="success">{state.ok}</Notice>}
      <label className="block font-medium">
        CSV file
        <input
          name="file"
          type="file"
          accept=".csv,text/csv"
          required
          className="mt-1 block w-full"
        />
      </label>
      <div className="flex flex-wrap gap-3">
        <Button type="submit" name="mode" value="check" variant="outline" disabled={pending}>
          {pending ? 'Working…' : 'Check file'}
        </Button>
        <Button type="submit" name="mode" value="import" disabled={pending}>
          Import
        </Button>
      </div>
      {state.report && state.report.errors.length > 0 && (
        <ul className="divide-y divide-forest-100 border-y border-forest-100">
          {state.report.errors.map((e) => (
            <li key={`${e.row}-${e.message}`} className="py-2">
              <span className="font-mono text-ink-muted">Row {e.row}</span>
              {e.isbn && <span className="ml-2">{e.isbn}</span>}
              <span className="ml-2 text-sale">{e.message}</span>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
