import { connectDb } from '../infrastructure/config/db';
import { prisma } from '../infrastructure/persistence/prisma/client';
import { runSeed } from './seed';
import { revalidateWeb } from './revalidate-web';

const DEMO_EMAILS = ['admin@bookstore.local', 'customer@bookstore.local'];

/**
 * Nightly demo reset: removes everything visitors created (accounts, carts, orders,
 * reviews, favorites, reports), then re-seeds. Books keep their ids (upsert by ISBN),
 * so cached storefront pages stay valid; stock and prices return to the seed values.
 */
export async function resetDemoData(): Promise<void> {
  await prisma.$transaction([
    prisma.orderItem.deleteMany(),
    prisma.order.deleteMany(),
    prisma.cartItem.deleteMany(),
    prisma.cart.deleteMany(),
    prisma.favorite.deleteMany(),
    prisma.review.deleteMany(),
    prisma.issueReport.deleteMany(),
    prisma.refreshToken.deleteMany(),
    prisma.userRole.deleteMany({ where: { user: { email: { notIn: DEMO_EMAILS } } } }),
    prisma.user.deleteMany({ where: { email: { notIn: DEMO_EMAILS } } }),
    prisma.discount.updateMany({ data: { usedCount: 0 } }),
  ]);
  await runSeed();
}

// argv[1] uses backslashes on Windows, so compare with forward slashes
const entry = (process.argv[1] ?? '').replace(/\\/g, '/');
const isCli = entry.endsWith('scripts/reset-demo.ts') || entry.endsWith('scripts/reset-demo.js');

if (isCli) {
  connectDb()
    .then(resetDemoData)
    .then(revalidateWeb)
    .then(() => {
      console.log('Demo data reset.');
      process.exit(0);
    })
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
