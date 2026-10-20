import { postReview } from '../actions';
import { Button } from '@/shared/ui/Button';

export function ReviewForm({ bookId }: { bookId: string }) {
  return (
    <form action={postReview.bind(null, bookId)} className="space-y-3 rounded-md bg-white p-6">
      <h3 className="font-serif text-xl">Write a review</h3>
      <label className="block font-sans text-sm font-medium">
        Rating
        <select
          name="rating"
          required
          defaultValue="5"
          className="mt-1 block rounded-md border border-forest-200 bg-white px-3 py-2"
        >
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>
              {n} star{n > 1 ? 's' : ''}
            </option>
          ))}
        </select>
      </label>
      <label className="block font-sans text-sm font-medium">
        Comment (optional)
        <textarea
          name="comment"
          rows={3}
          maxLength={2000}
          className="mt-1 w-full rounded-md border border-forest-200 px-3 py-2"
        />
      </label>
      <Button type="submit">Post review</Button>
    </form>
  );
}
