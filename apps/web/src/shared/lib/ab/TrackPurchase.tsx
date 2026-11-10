'use client';

import { useEffect } from 'react';
import { trackPurchase } from './actions';

/** Counts the purchase for the visitor's A/B tests, once per order on this device. */
export function TrackPurchase({ orderId }: { orderId: string }) {
  useEffect(() => {
    const key = `bb-purchase-${orderId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {
      // storage blocked: the API still keeps one purchase per visitor
    }
    void trackPurchase();
  }, [orderId]);
  return null;
}
