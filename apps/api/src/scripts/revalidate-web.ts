/**
 * Tells the storefront to drop its cached catalog after the books changed (seed,
 * demo reset). Development uses the storefront's defaults; production needs
 * WEB_REVALIDATE_URL and REVALIDATE_SECRET. Never fails the caller: the
 * storefront may simply not be running.
 */
export async function revalidateWeb(): Promise<void> {
  const dev = process.env.NODE_ENV !== 'production';
  const url =
    process.env.WEB_REVALIDATE_URL ?? (dev ? 'http://localhost:3000/hooks/revalidate' : undefined);
  const secret = process.env.REVALIDATE_SECRET ?? (dev ? 'dev-revalidate-secret' : undefined);
  if (!url || !secret) return;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'x-revalidate-secret': secret },
      signal: AbortSignal.timeout(5000),
    });
    console.log(
      res.ok ? 'Storefront cache cleared.' : `Storefront cache not cleared (HTTP ${res.status}).`,
    );
  } catch {
    console.log('Storefront not reachable; its cache is cleared when `pnpm dev` starts.');
  }
}
