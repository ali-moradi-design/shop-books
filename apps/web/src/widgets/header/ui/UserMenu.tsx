import Link from 'next/link';
import { connection } from 'next/server';
import { getMe, isAdmin } from '@/shared/lib/auth';

/** Dynamic hole: signed-in state. */
export async function UserMenu() {
  await connection();
  const me = await getMe();
  const link = 'rounded border border-mint-500/60 px-3 py-1.5 hover:bg-forest-700';
  if (!me) {
    return (
      <>
        <Link href="/login" className={link}>
          Sign in
        </Link>
      </>
    );
  }
  return (
    <>
      <Link href="/reading-list" className={link}>
        ♡ Reading list
      </Link>
      {isAdmin(me) && (
        <Link href="/admin" className={link}>
          Admin
        </Link>
      )}
      <Link href="/orders" className={link} title={me.email}>
        {me.name.split(' ')[0]}
      </Link>
    </>
  );
}
