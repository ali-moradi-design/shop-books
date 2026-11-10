import type { Metadata } from 'next';
import { Suspense } from 'react';
import { connection } from 'next/server';
import { apiRequest } from '@/shared/api';
import type { ApiData } from '@/shared/api';
import { requireToken } from '@/shared/lib/auth';
import {
  addAddress,
  changePassword,
  makeDefaultAddress,
  removeAddress,
  sendSetPasswordLink,
  updateProfile,
} from '@/features/account/actions';
import { ActionForm, fieldClass, labelClass } from '@/shared/ui/ActionForm';
import { ListSkeleton } from '@/widgets/skeletons';

export const metadata: Metadata = { title: 'Account', robots: { index: false } };

interface Address {
  id: string;
  label?: string;
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
  isDefault: boolean;
}

interface Account {
  name: string;
  email: string;
  guest: boolean;
  addresses: Address[];
}

const card = 'rounded-lg bg-white p-6';
const h2 = 'mb-4 font-serif text-2xl text-forest-900';

async function Settings() {
  await connection();
  const token = await requireToken('/account');
  const { data: account } = await apiRequest<ApiData<Account>>('/account', {
    token,
    cache: 'no-store',
  });
  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div className="space-y-8">
        <section aria-labelledby="profile-title" className={card}>
          <h2 id="profile-title" className={h2}>
            Profile
          </h2>
          <ActionForm action={updateProfile} submit="Save profile">
            <label className={labelClass}>
              Name
              <input
                name="name"
                required
                minLength={2}
                defaultValue={account.name}
                autoComplete="name"
                className={fieldClass}
              />
            </label>
            <label className={labelClass}>
              Email
              <input
                name="email"
                type="email"
                required
                defaultValue={account.email}
                autoComplete="email"
                className={fieldClass}
              />
            </label>
            {!account.guest && (
              <label className={labelClass}>
                Current password{' '}
                <span className="font-normal text-ink-muted">(only to change your email)</span>
                <input
                  name="currentPassword"
                  type="password"
                  autoComplete="current-password"
                  className={fieldClass}
                />
              </label>
            )}
          </ActionForm>
        </section>

        <section aria-labelledby="password-title" className={card}>
          <h2 id="password-title" className={h2}>
            Password
          </h2>
          {account.guest ? (
            <>
              <p className="mb-4 font-sans text-sm text-ink-muted">
                You checked out as a guest. Set a password to sign in again later and keep your
                order history.
              </p>
              <ActionForm action={sendSetPasswordLink} submit="Email me a link" variant="outline" />
            </>
          ) : (
            <ActionForm action={changePassword} submit="Change password">
              <label className={labelClass}>
                Current password
                <input
                  name="currentPassword"
                  type="password"
                  required
                  autoComplete="current-password"
                  className={fieldClass}
                />
              </label>
              <label className={labelClass}>
                New password
                <input
                  name="newPassword"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className={fieldClass}
                />
              </label>
              <label className={labelClass}>
                Repeat the new password
                <input
                  name="confirm"
                  type="password"
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className={fieldClass}
                />
              </label>
            </ActionForm>
          )}
        </section>
      </div>

      <section aria-labelledby="addresses-title" className={card}>
        <h2 id="addresses-title" className={h2}>
          Addresses
        </h2>
        {account.addresses.length === 0 && (
          <p className="mb-4 font-sans text-sm text-ink-muted">
            No saved addresses yet. You can also save one at checkout.
          </p>
        )}
        <ul className="mb-6 space-y-3">
          {account.addresses.map((a) => (
            <li
              key={a.id}
              className="rounded-md border border-forest-200 p-4 font-sans text-sm"
              data-testid="saved-address"
            >
              <p className="font-semibold text-forest-900">
                {a.label || a.fullName}
                {a.isDefault && (
                  <span className="ml-2 rounded bg-mint-100 px-1.5 py-0.5 text-xs font-normal text-ok">
                    Default
                  </span>
                )}
              </p>
              <p className="text-ink-muted">
                {[a.line1, a.line2, `${a.postalCode} ${a.city}`, a.country]
                  .filter(Boolean)
                  .join(', ')}
              </p>
              <div className="mt-2 flex gap-4">
                {!a.isDefault && (
                  <form
                    action={makeDefaultAddress.bind(null, { ...a, isDefault: undefined, id: a.id })}
                  >
                    <button type="submit" className="underline">
                      Make default
                    </button>
                  </form>
                )}
                <form action={removeAddress.bind(null, a.id)}>
                  <button type="submit" className="text-sale underline">
                    Remove
                  </button>
                </form>
              </div>
            </li>
          ))}
        </ul>
        {account.addresses.length < 10 && (
          <details className="group">
            <summary className="cursor-pointer font-sans text-sm font-semibold text-forest-700 underline">
              Add an address
            </summary>
            <ActionForm action={addAddress} submit="Save address" className="mt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <label className={labelClass}>
                  Label (optional)
                  <input name="label" placeholder="Home" className={fieldClass} />
                </label>
                <label className={labelClass}>
                  Full name
                  <input name="fullName" required autoComplete="name" className={fieldClass} />
                </label>
                <label className={`${labelClass} sm:col-span-2`}>
                  Address
                  <input
                    name="line1"
                    required
                    autoComplete="address-line1"
                    className={fieldClass}
                  />
                </label>
                <label className={`${labelClass} sm:col-span-2`}>
                  Apartment (optional)
                  <input name="line2" autoComplete="address-line2" className={fieldClass} />
                </label>
                <label className={labelClass}>
                  City
                  <input
                    name="city"
                    required
                    autoComplete="address-level2"
                    className={fieldClass}
                  />
                </label>
                <label className={labelClass}>
                  Postal code
                  <input
                    name="postalCode"
                    required
                    autoComplete="postal-code"
                    className={fieldClass}
                  />
                </label>
                <label className={labelClass}>
                  State (optional)
                  <input name="state" autoComplete="address-level1" className={fieldClass} />
                </label>
                <label className={labelClass}>
                  Country
                  <input
                    name="country"
                    required
                    defaultValue="United States"
                    autoComplete="country-name"
                    className={fieldClass}
                  />
                </label>
              </div>
              <label className="flex items-center gap-2 font-sans text-sm">
                <input type="checkbox" name="isDefault" /> Use as my default address
              </label>
            </ActionForm>
          </details>
        )}
      </section>
    </div>
  );
}

export default function AccountPage() {
  return (
    <div>
      <h1 className="mb-8 font-serif text-4xl font-medium text-forest-900">Account</h1>
      <Suspense fallback={<ListSkeleton rows={4} label="Loading your account…" />}>
        <Settings />
      </Suspense>
    </div>
  );
}
