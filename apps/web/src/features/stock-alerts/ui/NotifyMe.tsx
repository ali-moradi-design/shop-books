import { notifyMe } from '../actions';
import { ActionForm, fieldClass } from '@/shared/ui/ActionForm';

/** Shown instead of "add to cart" when a book is sold out. */
export function NotifyMe({ bookId }: { bookId: string }) {
  return (
    <ActionForm
      action={notifyMe.bind(null, bookId)}
      submit="Email me when it is back"
      variant="outline"
      buttonClassName="w-full"
      className="mb-4"
    >
      <label className="block font-sans text-sm">
        <span className="sr-only">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="Your email"
          className={fieldClass}
        />
      </label>
    </ActionForm>
  );
}
