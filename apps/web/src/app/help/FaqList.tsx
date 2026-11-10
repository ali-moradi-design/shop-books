'use client';

import { useDeferredValue, useMemo, useState } from 'react';
import type { FaqSection } from './faq';

/** The questions, grouped, with a filter box that searches questions and answers. */
export function FaqList({ sections }: { sections: FaqSection[] }) {
  const [query, setQuery] = useState('');
  // typing stays responsive; the list catches up a frame later
  const deferred = useDeferredValue(query.trim().toLowerCase());
  const shown = useMemo(
    () =>
      deferred
        ? sections
            .map((s) => ({
              ...s,
              items: s.items.filter((i) =>
                `${i.q} ${i.a.join(' ')}`.toLowerCase().includes(deferred),
              ),
            }))
            .filter((s) => s.items.length > 0)
        : sections,
    [sections, deferred],
  );
  const count = shown.reduce((n, s) => n + s.items.length, 0);
  return (
    <>
      <label htmlFor="faq-q" className="sr-only">
        Search the questions
      </label>
      <input
        id="faq-q"
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search: returns, shipping, look inside…"
        className="w-full rounded-md border-[1.5px] border-forest-200 bg-white px-4 py-3 font-serif text-lg focus-visible:outline-2 focus-visible:outline-forest-500"
      />
      <p aria-live="polite" className="mt-2 font-sans text-sm text-ink-muted">
        {deferred ? `${count} answer${count === 1 ? '' : 's'}` : ''}
      </p>
      {count === 0 && (
        <p className="mt-4 font-sans">Nothing matches “{query}”. Write to us below instead.</p>
      )}
      {shown.map((section) => (
        <section
          key={section.id}
          id={section.id}
          aria-labelledby={`${section.id}-h`}
          className="mt-10 scroll-mt-8"
        >
          <h2 id={`${section.id}-h`} className="font-serif text-3xl text-forest-900">
            {section.title}
          </h2>
          <div className="mt-3 divide-y divide-forest-100 rounded-lg bg-white px-6">
            {section.items.map((f) => (
              <details
                key={f.id}
                id={f.id}
                className="group scroll-mt-8 py-4"
                open={Boolean(deferred)}
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 font-serif text-lg text-forest-900">
                  {f.q}
                  <span
                    aria-hidden
                    className="text-2xl leading-none transition group-open:rotate-45"
                  >
                    +
                  </span>
                </summary>
                <div className="mt-2 max-w-2xl space-y-2 font-sans leading-relaxed text-ink-muted">
                  {f.a.map((p) => (
                    <p key={p}>{p}</p>
                  ))}
                </div>
              </details>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}
