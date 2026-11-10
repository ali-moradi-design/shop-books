import 'server-only';
import { notFound } from 'next/navigation';
import { connection } from 'next/server';
import { getMe, isAdmin, requireToken, type Me } from '@/shared/lib/auth';

/**
 * Admin page data: checks the session and the admin role in parallel with the
 * page's own reads, then hides the page (404) from non-admins.
 */
export async function adminData<T>(
  path: string,
  read: (token: string) => Promise<T>,
): Promise<T & { token: string; me: Me }> {
  await connection();
  const token = await requireToken(path);
  const [me, data] = await Promise.all([getMe(), read(token)]);
  if (!me || !isAdmin(me)) notFound();
  return { ...data, token, me };
}
