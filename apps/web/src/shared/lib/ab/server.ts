import 'server-only';
import { cookies } from 'next/headers';
import { apiRequest } from '@/shared/api';
import {
  EXPERIMENTS,
  VISITOR_COOKIE,
  cookieName,
  isVariant,
  type EventType,
  type ExperimentKey,
  type VariantOf,
} from './experiments';

/**
 * The visitor's variant, from the cookie proxy.ts set. Reading cookies makes the
 * caller dynamic, so call it only inside a part that is per visitor already.
 */
export async function getVariant<K extends ExperimentKey>(key: K): Promise<VariantOf<K>> {
  const value = (await cookies()).get(cookieName(key))?.value;
  return isVariant(key, value) ? value : ('control' as VariantOf<K>);
}

/** Sends events for the visitor's experiments to the API; never fails the caller. */
export async function recordEvents(type: EventType, only?: ExperimentKey): Promise<void> {
  const jar = await cookies();
  const visitor = jar.get(VISITOR_COOKIE)?.value;
  if (!visitor) return;
  const events = (Object.keys(EXPERIMENTS) as ExperimentKey[])
    .filter((key) => !only || key === only)
    .flatMap((key) => {
      const variant = jar.get(cookieName(key))?.value;
      return isVariant(key, variant) ? [{ experiment: key, variant, type }] : [];
    });
  if (events.length === 0) return;
  await apiRequest('/experiments/events', {
    method: 'POST',
    json: { visitor, events },
    cache: 'no-store',
  }).catch(() => {});
}
