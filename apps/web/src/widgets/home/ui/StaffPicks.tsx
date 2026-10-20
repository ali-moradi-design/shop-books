import { BookCard, type Book } from '@/entities/book';

const notes = [
  'Still the kindest book I know.',
  'Magic in every paragraph.',
  'Rewires how you see history.',
  'Wild, bleak, brilliant.',
  'Changed how I cook.',
  'Quietly devastating.',
];

export function StaffPicks({ books }: { books: Book[] }) {
  return (
    <section id="staff-picks" aria-labelledby="staff-title" className="pt-16">
      <div className="flex items-baseline justify-between">
        <h2 id="staff-title" className="font-serif text-4xl font-medium text-forest-900">
          Staff picks
        </h2>
        <a href="/books?featured=true" className="font-serif underline">
          See all
        </a>
      </div>
      <ul className="mt-6 grid grid-cols-2 gap-8 md:grid-cols-3 lg:grid-cols-6">
        {books.slice(0, 6).map((b, i) => (
          <li key={b.id}>
            <BookCard
              book={b}
              footer={
                <q className="mt-2 block border-l-[3px] border-mint-300 pl-3 font-serif text-sm italic leading-snug text-forest-900 [quotes:none]">
                  “{notes[i % notes.length]}” — Dana
                </q>
              }
            />
          </li>
        ))}
      </ul>
    </section>
  );
}
