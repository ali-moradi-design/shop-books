import type { Metadata, Viewport } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { SiteHeader } from '@/widgets/header';
import { SiteFooter } from '@/widgets/footer';
import { SITE } from '@/shared/config';
import { Analytics } from '@/shared/ui/Analytics';

// Self-hosted (SIL OFL, files in ./fonts): nothing is downloaded from Google Fonts
// at build or run time
const inter = localFont({
  src: './fonts/inter-latin-wght-normal.woff2',
  weight: '100 900',
  variable: '--font-inter',
  display: 'swap',
});
const sourceSerif = localFont({
  src: [
    { path: './fonts/source-serif-4-latin-wght-normal.woff2', weight: '200 900', style: 'normal' },
    { path: './fonts/source-serif-4-latin-wght-italic.woff2', weight: '200 900', style: 'italic' },
  ],
  variable: '--font-source-serif',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name} · Independent online bookshop`, template: `%s · ${SITE.name}` },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [...SITE.keywords],
  creator: SITE.name,
  publisher: SITE.name,
  category: 'shopping',
  openGraph: {
    siteName: SITE.name,
    type: 'website',
    locale: SITE.locale,
    url: '/',
    title: SITE.name,
    description: SITE.tagline,
  },
  twitter: { card: 'summary_large_image', title: SITE.name, description: SITE.tagline },
  formatDetection: { telephone: false, address: false, email: false },
  // kept out of every search engine: the X-Robots-Tag header (next.config.ts) says the same for files and images
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-snippet': 0,
      'max-image-preview': 'none',
      'max-video-preview': 0,
    },
  },
};

export const viewport: Viewport = {
  themeColor: SITE.themeColor,
  colorScheme: 'light',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable}`}>
      {/* column layout: main grows, so the footer sits at the bottom on short pages */}
      <body className="flex flex-col overflow-x-clip">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:bg-white focus:p-3"
        >
          Skip to content
        </a>
        <Analytics />
        <SiteHeader />
        <main id="main" className="mx-auto w-full max-w-shop flex-1 px-6 py-10">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
