import Link from 'next/link';
import { Logo } from '@/shared/ui/Logo';
export function SiteFooter() {
  return (
    <footer className="mt-24 bg-forest-900 text-mint-100">
      <div className="mx-auto flex max-w-shop flex-wrap items-center justify-between gap-4 px-6 py-10 font-serif text-[15px]">
        <div className="flex flex-col gap-3">
          <Logo className="text-xl text-white" />
          <p>© Bay Book Company — a demo shop. Payments are simulated; no real card is charged.</p>
        </div>
        <nav aria-label="Footer" className="flex gap-6">
          <Link href="/books" className="underline hover:text-white">
            All books
          </Link>
          <Link href="/books?featured=true" className="underline hover:text-white">
            Staff picks
          </Link>
        </nav>
      </div>
    </footer>
  );
}
