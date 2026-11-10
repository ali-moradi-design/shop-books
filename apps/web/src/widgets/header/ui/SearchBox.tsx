'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { formatMoney } from '@/shared/lib/money';

interface Suggestion {
  id: string;
  title: string;
  author: string;
  price: number;
  inStock: boolean;
}

/**
 * Header search with live suggestions. A plain GET form underneath, so search
 * works before JavaScript loads; typing shows matching books after a short pause.
 */
export function SearchBox() {
  const router = useRouter();
  const listId = useId();
  const [q, setQ] = useState('');
  const [items, setItems] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const cache = useRef(new Map<string, Suggestion[]>());
  const term = q.trim().toLowerCase();

  useEffect(() => {
    if (term.length < 2) return;
    const hit = cache.current.get(term);
    if (hit) {
      setItems(hit);
      return;
    }
    const ctrl = new AbortController();
    const timer = setTimeout(() => {
      fetch(`/api/suggest?q=${encodeURIComponent(term)}`, { signal: ctrl.signal })
        .then((r) => r.json() as Promise<{ data: Suggestion[] }>)
        .then(({ data }) => {
          cache.current.set(term, data);
          setItems(data);
        })
        .catch(() => {});
    }, 180);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [term]);

  const shown = term.length >= 2 ? items : [];
  const expanded = open && shown.length > 0;
  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') return setOpen(false);
    if (!shown.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setOpen(true);
      setActive((i) => {
        const next = i + (e.key === 'ArrowDown' ? 1 : -1);
        return next >= shown.length ? -1 : next < -1 ? shown.length - 1 : next;
      });
    } else if (e.key === 'Enter' && active >= 0) {
      e.preventDefault();
      setOpen(false);
      router.push(`/books/${shown[active].id}`);
    }
  };

  return (
    <form
      action="/books"
      role="search"
      className="relative flex min-w-[260px] max-w-2xl flex-1 rounded-sm bg-white text-ink"
    >
      <label htmlFor="site-search" className="sr-only">
        Search by title, author, genre or ISBN
      </label>
      <input
        id="site-search"
        name="q"
        type="search"
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setActive(-1);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={onKeyDown}
        role="combobox"
        aria-expanded={expanded}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
        placeholder="Search by title, author, genre or ISBN"
        className="min-w-0 flex-1 rounded-l-sm px-4 py-3 font-serif text-[15px] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-forest-500"
      />
      <button
        type="submit"
        className="rounded-r-sm bg-mint-300 px-5 font-sans text-sm font-semibold text-forest-900 hover:bg-gold-300"
      >
        Search
      </button>
      <ul
        id={listId}
        role="listbox"
        aria-label="Suggestions"
        className={`absolute inset-x-0 top-full z-40 mt-1 overflow-hidden rounded-md border border-forest-200 bg-white shadow-lg ${expanded ? '' : 'hidden'}`}
      >
        {shown.map((s, i) => (
          <li key={s.id} id={`${listId}-${i}`} role="option" aria-selected={i === active}>
            <Link
              href={`/books/${s.id}`}
              onClick={() => setOpen(false)}
              className={`flex items-baseline justify-between gap-3 px-4 py-2.5 font-sans text-sm hover:bg-forest-50 ${i === active ? 'bg-forest-50' : ''}`}
            >
              <span>
                <span className="font-serif text-[15px] text-forest-900">{s.title}</span>
                <span className="ml-2 text-ink-muted">{s.author}</span>
              </span>
              <span className="whitespace-nowrap text-ink-muted">
                {s.inStock ? formatMoney(s.price) : 'Sold out'}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </form>
  );
}
