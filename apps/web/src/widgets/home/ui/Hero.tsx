import { BookCover, type Book } from '@/entities/book';
import { ButtonLink } from '@/shared/ui/Button';
import Link from 'next/link';

export function Hero({ books }: { books: Book[] }) {
  return (
    <section
      aria-labelledby="hero-title"
      className="relative left-1/2 -mt-10 flex min-h-[520px] w-screen -translate-x-1/2 items-center justify-center gap-12 overflow-hidden bg-wood-500 bg-[repeating-linear-gradient(90deg,#8a5a2b_0_110px,#7a4d22_110px_114px)] px-6"
    >
      <div className="relative z-10 w-full max-w-[560px] shrink-0 bg-white p-10 shadow-2xl">
        <h1
          id="hero-title"
          className="font-serif text-5xl font-medium leading-[1.08] text-forest-900"
        >
          A bookshop for people who still browse.
        </h1>
        <p className="my-5 font-serif text-lg leading-relaxed">
          Thousands of titles, picked by readers. Look inside any book before it goes in your bag.
        </p>
        <div className="flex flex-wrap gap-3">
          <ButtonLink href="/books">Browse the shelves</ButtonLink>
          <ButtonLink href="/books?sort=createdAt&order=desc" variant="outline">
            New arrivals
          </ButtonLink>
        </div>
      </div>
      <ul className="hidden shrink-0 items-end gap-3 self-end border-b-[18px] border-wood-900 lg:flex">
        {books.slice(0, 4).map((b, i) => (
          <li key={b.id} className={i % 2 ? 'w-[150px]' : 'w-[135px]'}>
            <Link href={`/books/${b.id}`} aria-label={b.title}>
              <BookCover book={b} priority />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
