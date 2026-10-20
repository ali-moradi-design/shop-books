import { fetchFacets, fetchFeatured } from '@/entities/book';
import { Events, GenreChips, Hero, PromoBanner, StaffPicks } from '@/widgets/home';

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
