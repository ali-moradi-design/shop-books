import type { Metadata } from 'next';
import { Inter, Source_Serif_4 } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/widgets/header';
import { Suspense } from 'react';
import { CartBadge } from '@/features/cart-badge';
import { UserGreeting } from '@/features/user-greeting';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const sourceSerif = Source_Serif_4({ subsets: ['latin'], variable: '--font-source-serif', display: 'swap' });

export const metadata: Metadata = {
  title: 'Bay Book Company',
  description: 'Books demo shop: Next.js Partial Prerendering on an Express/Postgres API',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable}`}>
      <body>
        <SiteHeader modeLabel="PPR" trailing={(
              <Suspense fallback={<span className="text-xs text-ink-muted">…</span>}>
                <div className="flex items-center gap-3">
                  <UserGreeting />
                  <CartBadge />
                </div>
              </Suspense>
            )} />
        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
        <footer className="mx-auto max-w-6xl px-4 pb-10 text-center text-xs text-ink-muted">
          Layered API catalog · FSD · Next App Router · PPR
        </footer>
      </body>
    </html>
  );
}
