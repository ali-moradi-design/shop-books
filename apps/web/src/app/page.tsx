import type { Metadata } from 'next';
import { fetchFacets, fetchFeatured } from '@/entities/book';
import { Events, GenreChips, Hero, PromoBanner, StaffPicks } from '@/widgets/home';
import { SITE } from '@/shared/config';

export const metadata: Metadata = { alternates: { canonical: '/' } };

/** Store and site search, so search engines can show a search box for the shop. */
const jsonLd = [
  {
    '@context': 'https://schema.org',
    '@type': 'BookStore',
    name: SITE.name,
    description: SITE.description,
    url: SITE.url,
    logo: `${SITE.url}/icon.svg`,
  },
  {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE.name,
    url: SITE.url,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE.url}/books?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  },
];

export default async function HomePage() {
  const [featured, facets] = await Promise.all([fetchFeatured(), fetchFacets()]);
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }}
      />
      <Hero books={featured} />
      <StaffPicks books={featured} />
      <PromoBanner />
      <Events />
      <GenreChips categories={facets.categories} />
    </>
  );
}
