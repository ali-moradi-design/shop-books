const TRACKING: Record<string, (n: string) => string> = {
  UPS: (n) => `https://www.ups.com/track?tracknum=${n}`,
  USPS: (n) => `https://tools.usps.com/go/TrackConfirmAction?tLabels=${n}`,
  FedEx: (n) => `https://www.fedex.com/fedextrack/?trknbr=${n}`,
  DHL: (n) => `https://www.dhl.com/global-en/home/tracking/tracking-express.html?tracking-id=${n}`,
};

/** The carrier's public tracking page, when we know it. */
export function trackingUrl(carrier: string, trackingNumber: string): string | undefined {
  return TRACKING[carrier]?.(encodeURIComponent(trackingNumber));
}
