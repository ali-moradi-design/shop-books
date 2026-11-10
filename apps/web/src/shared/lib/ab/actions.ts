'use server';

import { recordEvents } from './server';
import type { ExperimentKey } from './experiments';

/** Called from the browser once a test is on screen. */
export async function trackExposure(key: ExperimentKey): Promise<void> {
  await recordEvents('exposure', key);
}

export async function trackPurchase(): Promise<void> {
  await recordEvents('purchase');
}
