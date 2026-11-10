import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { fetchFeatured } from '@/entities/book';
import { ButtonLink } from '@/shared/ui/Button';

export const metadata: Metadata = {
  title: 'About us',
  description:
    'Bay Book Company is an independent online bookshop run by readers: staff picks, look-inside previews and honest recommendations.',
};

const NUMBERS = [
  ['40+', 'titles on our shelves, each chosen by a person'],
  ['6', 'books you can read the first pages of today'],
  ['1–2', 'days to ship, with free shipping over $40'],
  ['30', 'days to return a book, no questions'],
] as const;

const VALUES = [
  [
    'Read before we recommend',
    'Every staff pick has been read, start to finish, by someone here. If we did not finish it, it is not on the table.',
  ],
  [
    'Look inside first',
    'You should know what you are buying. Many of our books let you read the opening pages before they go in your basket.',
  ],
  [
    'Small and independent',
    'No algorithmic shelf, no paid placement. The front table is the books we would press into a friend’s hands.',
  ],
] as const;

const STEPS = [
  [
    'Pick',
    'Our booksellers read widely and argue about it. What survives the argument goes on the shelf.',
  ],
  [
    'Pack',
    'Orders are packed by hand in recycled card, with a bookmark and, for the very first order, a note.',
  ],
  ['Ship', 'Most orders leave within a day or two. You get a tracking link the moment yours does.'],
  [
    'Stay',
    'Changed your mind? Return it within 30 days. Liked it? Tell us; it might become a staff pick.',
  ],
] as const;

/** Static page; the covers come from the cached catalog, so it renders from the prerendered shell. */
export default async function AboutPage() {
  const covers = (await fetchFeatured()).filter((b) => b.coverImageUrl).slice(0, 5);
  return (
    <div className="space-y-20">
      <section className="grid items-center gap-12 lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="font-sans text-sm font-semibold uppercase tracking-widest text-mint-500">
            About us
          </p>
          <h1 className="mt-3 font-serif text-5xl font-medium leading-tight text-forest-900 sm:text-6xl">
            A bookshop run by people who read
          </h1>
          <p className="mt-6 max-w-xl font-serif text-xl leading-relaxed text-ink">
            Bay Book Company began as a reading group that kept recommending the same books to each
            other. We opened a shop so we could recommend them to you too.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <ButtonLink href="/books?featured=true">See staff picks</ButtonLink>
            <ButtonLink href="/books" variant="outline">
              Browse all books
            </ButtonLink>
          </div>
        </div>
        {covers.length > 0 && (
          <div
            aria-hidden
            className="relative flex h-80 items-end justify-center gap-3 rounded-xl bg-gradient-to-b from-cream to-wood-500/20 px-6 pb-6"
          >
            {covers.map((b, i) => (
              <div
                key={b.id}
                className="book-cover relative w-24 shrink-0 overflow-hidden rounded-sm shadow-lg sm:w-28"
                style={{ height: `${150 + ((i * 37) % 60)}px` }}
              >
                <Image src={b.coverImageUrl!} alt="" fill sizes="112px" className="object-cover" />
              </div>
            ))}
            <div className="absolute inset-x-0 bottom-4 mx-6 h-3 rounded bg-wood-900/80" />
          </div>
        )}
      </section>

      <section aria-label="In numbers" className="rounded-xl bg-forest-900 px-6 py-12 text-white">
        <dl className="grid grid-cols-2 gap-y-10 lg:grid-cols-4">
          {NUMBERS.map(([n, label]) => (
            <div key={label} className="px-3 text-center">
              <dt className="sr-only">{label}</dt>
              <dd className="font-serif text-5xl text-gold-300">{n}</dd>
              <dd className="mt-2 font-sans text-sm text-mint-100">{label}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="values-title">
        <h2 id="values-title" className="font-serif text-4xl font-medium text-forest-900">
          What we hold to
        </h2>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {VALUES.map(([title, text]) => (
            <div key={title} className="rounded-lg border-t-4 border-forest-900 bg-white p-6">
              <h3 className="font-serif text-2xl text-forest-900">{title}</h3>
              <p className="mt-3 font-sans leading-relaxed text-ink-muted">{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section aria-labelledby="how-title" className="grid gap-10 lg:grid-cols-[1fr_2fr]">
        <div>
          <h2 id="how-title" className="font-serif text-4xl font-medium text-forest-900">
            From our shelf to yours
          </h2>
          <p className="mt-4 font-sans leading-relaxed text-ink-muted">
            Four steps, done by hand, for every order.
          </p>
        </div>
        <ol className="grid gap-6 sm:grid-cols-2">
          {STEPS.map(([title, text], i) => (
            <li key={title} className="rounded-lg bg-white p-6">
              <p className="font-serif text-lg text-mint-500">0{i + 1}</p>
              <h3 className="font-serif text-2xl text-forest-900">{title}</h3>
              <p className="mt-2 font-sans leading-relaxed text-ink-muted">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="rounded-xl bg-cream p-10 text-center">
        <blockquote className="mx-auto max-w-3xl font-serif text-3xl italic leading-snug text-forest-900">
          “A bookshop should feel like a friend who has read everything and is glad you came in.”
        </blockquote>
        <p className="mt-4 font-sans text-sm text-ink-muted">— the Bay Book Company booksellers</p>
        <p className="mt-8 font-sans text-sm">
          Questions? Our{' '}
          <Link href="/help" className="font-semibold text-forest-700 underline">
            help page
          </Link>{' '}
          has the answers, or write to us.
        </p>
      </section>

      <p className="rounded-md border border-forest-200 bg-forest-50 p-5 font-sans text-sm text-ink-muted">
        This is a portfolio demo shop. Book data and covers come from public sources and are used as
        sample content; nothing is for sale and payments are simulated.
      </p>
    </div>
  );
}
