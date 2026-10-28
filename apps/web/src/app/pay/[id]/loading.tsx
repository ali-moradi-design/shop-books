import { FormSkeleton } from '@/widgets/skeletons';

/** Shown at once while this route renders on the server. */
export default function Loading() {
  return <FormSkeleton fields={3} label="Loading payment…" />;
}
