'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Notice } from '@/shared/ui/Notice';

/**
 * Back from Stripe before its webhook arrived: the order is still unpaid here,
 * so re-render every few seconds until the webhook has confirmed it.
 */
export function PaymentPending() {
  const router = useRouter();
  const [gaveUp, setGaveUp] = useState(false);
  useEffect(() => {
    let tries = 0;
    const timer = setInterval(() => {
      tries += 1;
      if (tries > 15) {
        clearInterval(timer);
        setGaveUp(true);
        return;
      }
      router.refresh();
    }, 2000);
    return () => clearInterval(timer);
  }, [router]);
  return (
    <Notice>
      {gaveUp
        ? 'We are still waiting for the payment confirmation. Reload this page in a minute; you will not be charged twice.'
        : 'Confirming your payment…'}
    </Notice>
  );
}
