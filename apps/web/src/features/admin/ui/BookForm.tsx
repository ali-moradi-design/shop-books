'use client';

import { useActionState } from 'react';
import { createBook, updateBook } from '../actions';
import type { Book } from '@/entities/book';
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
  defaultValue,
}: {
  label: string;
  name: string;
  required?: boolean;
  hint?: string;
  type?: string;
  defaultValue?: string | number;
}) {
  return (
    <label className="block font-sans text-sm font-medium">
      {label}
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className={input}
      />
      {hint && <span className="mt-1 block text-xs font-normal text-ink-muted">{hint}</span>}
    </label>
  );
}

/** Create a book, or edit one when `book` is given. */
export function BookForm({ book }: { book?: Book }) {
  const [state, action, pending] = useActionState(
    book ? updateBook.bind(null, book.id) : createBook,
    {},
  );
  return (
    <form action={action} className="max-w-2xl space-y-5 rounded-md bg-white p-8">
      {state.error && <Notice tone="error">{state.error}</Notice>}
      {state.ok && <Notice tone="success">{state.ok}</Notice>}
      <Field label="Title" name="title" required defaultValue={book?.title} />
      <Field label="Author" name="author" required defaultValue={book?.author} />
      <label className="block font-sans text-sm font-medium">
        Description
        <textarea
          name="description"
          required
          rows={4}
          defaultValue={book?.description}
          className={input}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field
          label="Price (USD)"
          name="price"
          required
          hint="For example 12.99"
          defaultValue={book ? (book.price / 100).toFixed(2) : undefined}
        />
        <Field label="Stock" name="stock" type="number" required defaultValue={book?.stock} />
        <Field
          label="ISBN"
          name="isbn"
          hint="Optional, used for search"
          defaultValue={book?.isbn}
        />
      </div>
      <Field
        label="Genres"
        name="categories"
        hint="Comma separated, for example fiction, classics"
        defaultValue={book?.categories?.join(', ')}
      />
      <Field
        label="Cover image URL"
        name="coverImageUrl"
        hint="https://… or a path starting with /"
        defaultValue={book?.coverImageUrl}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Series" name="series" defaultValue={book?.series} />
        <Field
          label="Number in series"
          name="seriesNumber"
          type="number"
          defaultValue={book?.seriesNumber}
        />
      </div>
      <label className="block font-sans text-sm font-medium">
        First pages for “Look inside” (optional)
        <textarea name="sample" rows={5} defaultValue={book?.sample} className={input} />
        <span className="mt-1 block text-xs font-normal text-ink-muted">
          Separate paragraphs with a blank line. Only use text you may publish.
        </span>
      </label>
      <label className="flex items-center gap-3 font-sans text-sm">
        <input type="checkbox" name="featured" defaultChecked={book?.featured} /> Show in staff
        picks
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? 'Saving…' : book ? 'Save changes' : 'Create book'}
      </Button>
    </form>
  );
}
