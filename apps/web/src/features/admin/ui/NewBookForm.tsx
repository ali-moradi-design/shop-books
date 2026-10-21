'use client';

import { useActionState } from 'react';
import { createBook } from '../actions';
import { Button } from '@/shared/ui/Button';
import { Notice } from '@/shared/ui/Notice';

const input =
  'mt-1 w-full rounded-md border border-forest-200 bg-white px-3 py-2.5 font-sans text-base';

function Field({
  label,
  name,
  required = false,
  hint,
  type = 'text',
}: {
  label: string;
  name: string;
  required?: boolean;
  hint?: string;
  type?: string;
}) {
  return (
    <label className="block font-sans text-sm font-medium">
      {label}
      <input name={name} type={type} required={required} className={input} />
      {hint && <span className="mt-1 block text-xs font-normal text-ink-muted">{hint}</span>}
    </label>
  );
}

export function NewBookForm() {
  const [state, action, pending] = useActionState(createBook, {});
  return (
    <form action={action} className="max-w-2xl space-y-5 rounded-md bg-white p-8">
      {state.error && <Notice tone="error">{state.error}</Notice>}
      <Field label="Title" name="title" required />
      <Field label="Author" name="author" required />
      <label className="block font-sans text-sm font-medium">
        Description
        <textarea name="description" required rows={4} className={input} />
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Price (USD)" name="price" required hint="For example 12.99" />
        <Field label="Stock" name="stock" type="number" required />
        <Field label="ISBN" name="isbn" hint="Optional, used for search" />
      </div>
      <Field
        label="Genres"
        name="categories"
        hint="Comma separated, for example fiction, classics"
      />
      <Field
        label="Cover image URL"
        name="coverImageUrl"
        hint="https://… or a path starting with /"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Series" name="series" />
        <Field label="Number in series" name="seriesNumber" type="number" />
      </div>
      <label className="block font-sans text-sm font-medium">
        First pages for “Look inside” (optional)
        <textarea name="sample" rows={5} className={input} />
        <span className="mt-1 block text-xs font-normal text-ink-muted">
          Separate paragraphs with a blank line. Only use text you may publish.
        </span>
      </label>
      <label className="flex items-center gap-3 font-sans text-sm">
        <input type="checkbox" name="featured" /> Show in staff picks
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? 'Creating…' : 'Create book'}
      </Button>
    </form>
  );
}
