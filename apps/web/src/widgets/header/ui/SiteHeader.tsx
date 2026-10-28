import Link from 'next/link';
import { Suspense } from 'react';
import { CartBadge } from '@/features/cart/ui/CartBadge';
import { Logo } from '@/shared/ui/Logo';
import { UserMenu } from './UserMenu';

const nav = [
  { href: '/', label: 'Home' },
  { href: '/books', label: 'Browse' },
  { href: '/books?sort=createdAt&order=desc', label: 'New arrivals' },
  { href: '/#staff-picks', label: 'Staff picks' },
  { href: '/#events', label: 'Events' },
];

export function SiteHeader() {
  return (
    <header>
      <div className="bg-forest-900 text-white">
        <div className="mx-auto flex max-w-shop flex-wrap items-center gap-x-6 gap-y-3 px-6 py-3">
          <Link href="/" aria-label="Bay Book Company, home" className="text-white">
            <Logo />
          </Link>
          <form
            action="/books"
            role="search"
            className="flex min-w-[260px] max-w-2xl flex-1 overflow-hidden rounded-sm bg-white text-ink"
          >
            <label htmlFor="site-search" className="sr-only">
              Search by title, author, genre or ISBN
            </label>
            <input
              id="site-search"
              name="q"
              type="search"
              placeholder="Search by title, author, genre or ISBN"
              className="min-w-0 flex-1 px-4 py-3 font-serif text-[15px] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-forest-500"
            />
            <button
              type="submit"
              className="bg-mint-300 px-5 font-sans text-sm font-semibold text-forest-900 hover:bg-gold-300"
            >
              Search
            </button>
          </form>
          <div className="ml-auto flex flex-wrap items-center gap-2 font-sans text-sm sm:gap-3">
            <Suspense fallback={<span className="px-3 py-1.5">…</span>}>
              <UserMenu />
            </Suspense>
            <Suspense fallback={<span className="px-3 py-1.5">Cart</span>}>
              <CartBadge />
            </Suspense>
          </div>
        </div>
      </div>
      <nav aria-label="Primary" className="border-b border-forest-200 bg-white">
        <ul className="mx-auto flex max-w-shop gap-8 overflow-x-auto whitespace-nowrap px-6 font-serif text-base">
          {nav.map((n) => (
            <li key={n.href}>
              <Link href={n.href} className="flex h-11 items-center hover:text-forest-500">
                {n.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
