import type { Facets } from '@/entities/book';
import { Button } from '@/shared/ui/Button';

export interface Filters {
  q?: string;
  category?: string;
  author?: string;
  series?: string;
  min?: string;
  max?: string;
  inStock?: boolean;
  sort: string;
}

const label =
  'mb-3 block font-sans text-[13px] font-semibold uppercase tracking-widest text-mint-500';
const input = 'w-full rounded-md border border-forest-200 bg-white px-3 py-2 font-sans text-[15px]';

/** Plain GET form: filters work without client JavaScript. */
export function FilterSidebar({ facets, filters }: { facets: Facets; filters: Filters }) {
  return (
    <form method="get" action="/books" aria-label="Filter books" className="space-y-7">
      {filters.q && <input type="hidden" name="q" value={filters.q} />}
      <fieldset>
        <legend className={label}>Genre</legend>
        <ul className="space-y-1 font-sans text-base text-forest-900">
          {[
            { name: '', count: facets.categories.reduce((n, c) => n + c.count, 0) },
            ...facets.categories.slice(0, 12),
          ].map((c) => (
            <li key={c.name || 'all'}>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2 has-[:checked]:bg-white has-[:checked]:font-semibold">
                <input
                  type="radio"
                  name="category"
                  value={c.name}
                  defaultChecked={(filters.category ?? '') === c.name}
                />
                <span className="flex-1 capitalize">{c.name || 'All books'}</span>
                {c.name && <span className="text-[13px] text-ink-muted">{c.count}</span>}
              </label>
            </li>
          ))}
        </ul>
      </fieldset>
      <div>
        <label htmlFor="f-author" className={label}>
          Author
        </label>
        <select id="f-author" name="author" defaultValue={filters.author ?? ''} className={input}>
          <option value="">Any author</option>
          {facets.authors.slice(0, 60).map((a) => (
            <option key={a.name} value={a.name}>
              {a.name} ({a.count})
            </option>
          ))}
        </select>
      </div>
      {facets.series.length > 0 && (
        <div>
          <label htmlFor="f-series" className={label}>
            Series
          </label>
          <select id="f-series" name="series" defaultValue={filters.series ?? ''} className={input}>
            <option value="">Any series</option>
            {facets.series.map((s) => (
              <option key={s.name} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}
      <fieldset>
        <legend className={label}>Price (USD)</legend>
        <div className="flex items-center gap-2">
          <input
            aria-label="Minimum price"
            name="min"
            inputMode="decimal"
            placeholder="Min"
            defaultValue={filters.min}
            className={input}
          />
          <span aria-hidden="true">–</span>
          <input
            aria-label="Maximum price"
            name="max"
            inputMode="decimal"
            placeholder="Max"
            defaultValue={filters.max}
            className={input}
          />
        </div>
      </fieldset>
      <label className="flex items-center gap-3 font-sans text-[15px]">
        <input type="checkbox" name="inStock" value="true" defaultChecked={filters.inStock} /> In
        stock only
      </label>
      <div>
        <label htmlFor="f-sort" className={label}>
          Sort by
        </label>
        <select id="f-sort" name="sort" defaultValue={filters.sort} className={input}>
          <option value="createdAt-desc">Newest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="title-asc">Title: A–Z</option>
        </select>
      </div>
      <Button type="submit" className="w-full">
        Apply filters
      </Button>
    </form>
  );
}
