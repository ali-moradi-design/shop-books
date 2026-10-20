import Link from 'next/link';
import type { Facets } from '@/entities/book';

export function GenreChips({ categories }: { categories: Facets['categories'] }) {
  return (
    <section aria-labelledby="genre-title" className="pt-16">
      <h2 id="genre-title" className="font-serif text-4xl font-medium text-forest-900">
        Shop by genre
      </h2>
      <ul className="mt-6 flex flex-wrap gap-3">
        {categories.slice(0, 14).map((c) => (
          <li key={c.name}>
            <Link
              href={`/books?category=${encodeURIComponent(c.name)}`}
              className="inline-block rounded-[10px] border border-forest-200 bg-white px-5 py-2.5 font-sans text-[15px] font-medium capitalize text-forest-900 hover:bg-forest-50"
            >
              {c.name}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
