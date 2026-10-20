import type { Metadata } from 'next';
import { Inter, Source_Serif_4 } from 'next/font/google';
import './globals.css';
import { SiteHeader } from '@/widgets/header';
import { SiteFooter } from '@/widgets/footer';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const sourceSerif = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-source-serif',
  display: 'swap',
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Bay Book Company', template: '%s · Bay Book Company' },
  description: 'A demo bookshop: thousands of titles, look inside before you buy.',
  openGraph: { siteName: 'Bay Book Company', type: 'website' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable}`}>
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-3"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="mx-auto max-w-shop px-6 py-10">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
