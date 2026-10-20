import { BookCard, fetchBooks, type Book } from '@/entities/book';

export async function Related({ book }: { book: Book }) {
  const category = book.categories?.[0];
  const { data } = await fetchBooks({ category, limit: 7 });
  const others = data.filter((b) => b.id !== book.id).slice(0, 6);
  if (others.length === 0) return null;
  return (
    <section aria-labelledby="related-title" className="pt-16">
      <h2 id="related-title" className="font-serif text-4xl font-medium text-forest-900">
        You may also like
      </h2>
      <ul className="mt-6 grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
        {others.map((b) => (
          <li key={b.id}>
            <BookCard book={b} />
          </li>
        ))}
      </ul>
    </section>
  );
}
