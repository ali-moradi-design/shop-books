'use client';

import { useActionState } from 'react';
import { placeOrder } from '../actions';
import { Button } from '@/shared/ui/Button';
import { Notice } from '@/shared/ui/Notice';

const input =
  'mt-1 w-full rounded-md border border-forest-200 bg-white px-3 py-2.5 font-sans text-base';

function Field({
  label,
  name,
  required = true,
  autoComplete,
  defaultValue,
}: {
  label: string;
  name: string;
  required?: boolean;
  autoComplete?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block font-sans text-sm font-medium">
      {label}
      <input
        name={name}
        required={required}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        className={input}
      />
    </label>
  );
}

export function CheckoutForm() {
  const [state, action, pending] = useActionState(placeOrder, {});
  return (
    <form action={action} className="space-y-5 rounded-md bg-white p-8">
      <h2 className="font-serif text-3xl">Shipping address</h2>
      {state.error && <Notice tone="error">{state.error}</Notice>}
      <Field label="Full name" name="fullName" autoComplete="name" />
      <Field label="Address" name="line1" autoComplete="address-line1" />
      <Field
        label="Apartment, suite (optional)"
        name="line2"
        required={false}
        autoComplete="address-line2"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="City" name="city" autoComplete="address-level2" />
        <Field
          label="State / region (optional)"
          name="state"
          required={false}
          autoComplete="address-level1"
        />
        <Field label="Postal code" name="postalCode" autoComplete="postal-code" />
        <Field label="Country" name="country" autoComplete="country-name" defaultValue="Germany" />
      </div>
      <label className="block font-sans text-sm font-medium">
        Discount code (optional)
        <input name="discountCode" placeholder="WELCOME10" className={input} />
      </label>
      <Button type="submit" disabled={pending} className="w-full rounded-lg py-4">
        {pending ? 'Placing order…' : 'Continue to payment'}
      </Button>
    </form>
  );
}
