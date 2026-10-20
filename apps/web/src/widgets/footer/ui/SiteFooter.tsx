import Link from 'next/link';
import { logout } from '@/features/auth/actions';
import { getToken } from '@/shared/lib/auth';
import { Suspense } from 'react';
import { connection } from 'next/server';

async function SignOut() {
  await connection();
  if (!(await getToken())) return null;
  return (
    <form action={logout}>
      <button className="underline hover:text-white">Sign out</button>
    </form>
  );
}

export function SiteFooter() {
  return (
    <footer className="mt-24 bg-forest-900 text-mint-100">
      <div className="mx-auto flex max-w-shop flex-wrap items-center justify-between gap-4 px-6 py-10 font-serif text-[15px]">
        <p>© Bay Book Company — a demo shop. Payments are simulated; no real card is charged.</p>
        <nav aria-label="Footer" className="flex gap-6">
          <Link href="/books" className="underline hover:text-white">
            All books
          </Link>
          <Link href="/orders" className="underline hover:text-white">
            My orders
          </Link>
          <Suspense>
            <SignOut />
          </Suspense>
        </nav>
      </div>
    </footer>
  );
}
