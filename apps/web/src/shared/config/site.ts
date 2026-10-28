/** Brand and SEO facts shared by metadata, the manifest, icons and JSON-LD. */
export const SITE = {
  name: 'Bay Book Company',
  shortName: 'Bay Books',
  tagline: 'A bookshop for people who still browse',
  description:
    'Bay Book Company is an independent online bookshop: fiction, classics and nonfiction picked by readers. Search by title, author, genre or ISBN and look inside before you buy.',
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(/\/$/, ''),
  locale: 'en_US',
  /** forest-900 and cream from globals.css */
  themeColor: '#174236',
  backgroundColor: '#f5f1e8',
  keywords: [
    'bookshop',
    'bookstore',
    'buy books online',
    'fiction',
    'classics',
    'nonfiction',
    'ISBN search',
  ],
} as const;
