import type { Metadata } from 'next';
import Link from 'next/link';
import { forgotPassword } from '@/features/account/actions';
import { ActionForm, fieldClass, labelClass } from '@/shared/ui/ActionForm';

export const metadata: Metadata = { title: 'Forgot password' };

export default function ForgotPasswordPage() {
  return (
    <div className="mx-auto max-w-md rounded-md bg-white p-8">
      <h1 className="mb-3 font-serif text-4xl font-medium text-forest-900">Forgot password</h1>
      <p className="mb-6 font-sans text-sm text-ink-muted">
        Enter the email you shop with and we will send you a link to choose a new password.
      </p>
      <ActionForm action={forgotPassword} submit="Email me a link" buttonClassName="w-full">
        <label className={labelClass}>
          Email
          <input name="email" type="email" required autoComplete="email" className={fieldClass} />
        </label>
      </ActionForm>
      <p className="mt-6 font-sans text-sm text-ink-muted">
        Remembered it?{' '}
        <Link href="/login" className="font-semibold text-forest-700 underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
