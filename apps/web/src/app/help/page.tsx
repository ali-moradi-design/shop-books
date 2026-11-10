import type { Metadata } from 'next';
import Link from 'next/link';
import { FAQ } from './faq';
import { FaqList } from './FaqList';

export const metadata: Metadata = {
  title: 'Help & FAQ',
  description:
    'Orders, shipping, returns, look-inside previews and your account at Bay Book Company.',
};

const SHORTCUTS = [
  ['Track an order', '/orders', 'Tracking is on the order page'],
  ['Return a book', '/help#how-to-return', 'Free within 30 days'],
  ['Read a sample', '/help#look-inside', 'Look inside before you buy'],
  ['Get a restock email', '/help#sold-out', 'For sold-out books'],
] as const;

export default function HelpPage() {
  return (
    <div className="grid gap-12 lg:grid-cols-[220px_minmax(0,1fr)]">
      <nav aria-label="Topics" className="hidden lg:block">
        <ul className="sticky top-8 space-y-2 font-sans text-sm">
          {FAQ.map((s) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="text-ink-muted hover:text-forest-900">
                {s.title}
              </a>
            </li>
          ))}
          <li>
            <a href="#contact" className="text-ink-muted hover:text-forest-900">
              Contact us
            </a>
          </li>
        </ul>
      </nav>
      <div className="max-w-3xl">
        <p className="font-sans text-sm font-semibold uppercase tracking-widest text-mint-500">
          Help
        </p>
        <h1 className="mt-2 font-serif text-5xl font-medium text-forest-900">How can we help?</h1>
        <p className="mb-8 mt-3 font-serif text-xl text-ink">
          Answers about orders, shipping, returns and reading.
        </p>
        <ul className="mb-10 grid gap-3 sm:grid-cols-2">
          {SHORTCUTS.map(([title, href, note]) => (
            <li key={title}>
              <Link
                href={href}
                className="block h-full rounded-lg border border-forest-200 bg-white p-5 hover:border-forest-900"
              >
                <span className="block font-serif text-lg text-forest-900">{title} →</span>
                <span className="mt-1 block font-sans text-sm text-ink-muted">{note}</span>
              </Link>
            </li>
          ))}
        </ul>
        <FaqList sections={FAQ} />
        <section
          id="contact"
          aria-labelledby="contact-h"
          className="mt-14 scroll-mt-8 rounded-xl bg-forest-900 p-8 text-white"
        >
          <h2 id="contact-h" className="font-serif text-3xl text-white">
            Still have a question?
          </h2>
          <p className="mt-2 font-sans text-mint-100">
            We answer every email within one business day.
          </p>
          <dl className="mt-6 grid gap-6 font-sans sm:grid-cols-2">
            <div>
              <dt className="text-xs uppercase tracking-widest text-mint-300">Email</dt>
              <dd className="mt-1">hello@baybooks.example</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-widest text-mint-300">Hours</dt>
              <dd className="mt-1">Mon–Sat, 10am–6pm</dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  );
}
