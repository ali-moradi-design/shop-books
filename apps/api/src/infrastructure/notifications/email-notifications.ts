import {
  domainEvents,
  type DomainEventName,
  type OrderChangedPayload,
  type ReturnEventPayload,
  type StockLowPayload,
  type StockRestoredPayload,
} from '../../domain/shared/events';
import { env } from '../config/env';
import { logger } from '../logging/logger';
import { prisma } from '../persistence/prisma/client';
import { mailer, templates } from '../mail';
import { notifyBackInStock } from '../../interfaces/http/v1/routes/extras.routes';
import { trackingUrl } from '../../domain/order/tracking';

const log = logger.child({ module: 'notifications' });

/** Runs a handler without letting an email problem fail the request that raised the event. */
function safely<T>(name: DomainEventName, fn: (payload: T) => Promise<void>) {
  domainEvents.on(name, async (event) => {
    try {
      await fn(event.payload as T);
    } catch (err) {
      log.error('notification failed', { event: name, error: err instanceof Error ? err.message : String(err) });
    }
  });
}

const emailOf = async (userId: string) => (await prisma.user.findUnique({ where: { id: userId }, select: { email: true } }))?.email ?? null;
const RETURN_LABEL: Record<string, string> = {
  requested: 'received',
  approved: 'approved: send the books back',
  rejected: 'not accepted',
  received: 'received at our shop',
  refunded: 'refunded',
};

/** Customer and staff emails for order, return and stock events. Call once at startup. */
export function registerEmailNotifications(): void {
  safely<{ orderId: string; userId: string }>('OrderPaid', async ({ orderId, userId }) => {
    const [order, to] = await Promise.all([prisma.order.findUnique({ where: { id: orderId }, include: { items: true } }), emailOf(userId)]);
    if (order && to) await mailer.send({ to, template: 'order-confirmed', ...templates.orderConfirmed(order) });
  });

  safely<OrderChangedPayload>('OrderShipped', async ({ orderId, userId }) => {
    const [order, to] = await Promise.all([prisma.order.findUnique({ where: { id: orderId } }), emailOf(userId)]);
    if (!order || !to) return;
    const tracking = order.shipCarrier && order.shipTracking ? { carrier: order.shipCarrier, trackingNumber: order.shipTracking, url: trackingUrl(order.shipCarrier, order.shipTracking) } : undefined;
    await mailer.send({ to, template: 'order-shipped', ...templates.orderShipped(order, tracking) });
  });

  safely<OrderChangedPayload>('OrderCancelled', async ({ orderId, userId, refunded }) => {
    const to = await emailOf(userId);
    if (to) await mailer.send({ to, template: 'order-cancelled', ...templates.orderCancelled({ id: orderId }, Boolean(refunded)) });
  });

  safely<ReturnEventPayload>('ReturnUpdated', async ({ orderId, userId, status, note }) => {
    const to = await emailOf(userId);
    if (to) await mailer.send({ to, template: 'return-update', ...templates.returnUpdate({ order: orderId, status: RETURN_LABEL[status] ?? status, note }) });
  });

  safely<StockRestoredPayload>('StockRestored', async ({ bookId }) => {
    await notifyBackInStock(bookId);
  });

  safely<StockLowPayload>('StockLow', async ({ bookId, title, stock }) => {
    const recipients = env.ADMIN_ALERT_EMAIL
      ? [env.ADMIN_ALERT_EMAIL]
      : (await prisma.user.findMany({ where: { isActive: true, deletedAt: null, roles: { some: { role: { name: 'admin' } } } }, select: { email: true } })).map((u) => u.email);
    for (const to of recipients) await mailer.send({ to, template: 'low-stock', ...templates.lowStock({ id: bookId, title, stock }) });
  });
}
