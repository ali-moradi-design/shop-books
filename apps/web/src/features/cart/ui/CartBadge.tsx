import Link from 'next/link';
import { connection } from 'next/server';
import { getToken } from '@/shared/lib/auth';
import { apiRequest } from '@/shared/api';
import type { ApiData } from '@/shared/api';

/** Dynamic hole: item count of the signed-in user's cart. */
export async function CartBadge() {
  await connection();
  const token = await getToken();
  let count = 0;
  if (token) {
    try {
      const res = await apiRequest<ApiData<{ items: { quantity: number }[] }>>('/cart', {
        token,
        cache: 'no-store',
      });
      count = res.data.items.reduce((n, i) => n + i.quantity, 0);
    } catch {
      count = 0;
    }
  }
  return (
    <Link
      href="/cart"
      className="rounded border border-mint-500/60 px-3 py-1.5 hover:bg-forest-700"
    >
      Cart ({count})
    </Link>
  );
}
