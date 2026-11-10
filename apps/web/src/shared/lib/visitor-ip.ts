import 'server-only';
import { headers } from 'next/headers';

/** The visitor's address as the reverse proxy (nginx) passed it, for per-visitor rate limits. */
export async function visitorIp(): Promise<string | undefined> {
  const h = await headers();
  return h.get('x-real-ip') ?? h.get('x-forwarded-for')?.split(',')[0]?.trim() ?? undefined;
}
