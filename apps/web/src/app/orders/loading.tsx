import { ListSkeleton } from '@/widgets/skeletons';

/** Shown at once while this route renders on the server. */
export default function Loading() {
  return <ListSkeleton label="Loading orders…" />;
}
