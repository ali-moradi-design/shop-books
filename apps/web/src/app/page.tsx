import type { Metadata } from 'next';
import { fetchFacets, fetchFeatured } from '@/entities/book';
import { Events, GenreChips, Hero, PromoBanner, StaffPicks } from '@/widgets/home';

export const metadata: Metadata = { alternates: { canonical: '/' } };

export default async function HomePage() {
  const [featured, facets] = await Promise.all([fetchFeatured(), fetchFacets()]);
  return (
    <>
      <Hero books={featured} />
      <StaffPicks books={featured} />
      <PromoBanner />
      <Events />
      <GenreChips categories={facets.categories} />
    </>
  );
}
