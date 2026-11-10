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
  await postEvents(await experimentEvents(type, only));
}

type Batch = {
  visitor: string;
  events: { experiment: string; variant: string; type: EventType }[];
} | null;

/** Reads the visitor's cookies now, so the events can be sent later with after(). */
export async function experimentEvents(type: EventType, only?: ExperimentKey): Promise<Batch> {
  const jar = await cookies();
  const visitor = jar.get(VISITOR_COOKIE)?.value;
  if (!visitor) return null;
  const events = (Object.keys(EXPERIMENTS) as ExperimentKey[])
    .filter((key) => !only || key === only)
    .flatMap((key) => {
      const variant = jar.get(cookieName(key))?.value;
      return isVariant(key, variant) ? [{ experiment: key, variant, type }] : [];
    });
  return events.length ? { visitor, events } : null;
}

export async function postEvents(batch: Batch): Promise<void> {
  if (!batch) return;
  const { visitor, events } = batch;
  await apiRequest('/experiments/events', {
    method: 'POST',
    json: { visitor, events },
    cache: 'no-store',
  }).catch(() => {});
}
