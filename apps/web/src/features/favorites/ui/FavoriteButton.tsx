import { toggleFavorite } from '../actions';
import { Button } from '@/shared/ui/Button';

export function FavoriteButton({ bookId, saved }: { bookId: string; saved: boolean }) {
  return (
    <form action={toggleFavorite.bind(null, bookId, saved)}>
      <Button type="submit" variant="outline" className="w-full" aria-pressed={saved}>
        {saved ? '♥ On your reading list' : '♡ Add to reading list'}
      </Button>
    </form>
  );
}
