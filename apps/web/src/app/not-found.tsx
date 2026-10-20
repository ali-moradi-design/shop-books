import { ButtonLink } from '@/shared/ui/Button';

export default function NotFound() {
  return (
    <div className="py-16 text-center">
      <h1 className="font-serif text-5xl text-forest-900">Page not found</h1>
      <p className="my-4 font-serif text-lg">We could not find that page or book.</p>
      <ButtonLink href="/books">Browse books</ButtonLink>
    </div>
  );
}
