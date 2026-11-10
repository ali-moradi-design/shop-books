import type { IOrderRepository } from '../../../domain/order/order.repository';
import type { IBookRepository } from '../../../domain/book/book.repository';
import type { INotificationPort } from '../../../domain/shared/notifications.port';
import type { IUnitOfWork } from '../../shared/unit-of-work.port';
import type { Order, PaymentMethod } from '../../../domain/order/order.entity';
import { DomainError } from '../../../domain/shared/DomainError';
import { assertTransition } from '../../../domain/order/order.transitions';
import { isStockLow, DEFAULT_LOW_STOCK_THRESHOLD } from '../../../domain/book/rules/stock';
import { domainEvents, orderPaidEvent, stockLowEvent } from '../../../domain/shared/events';

/** What the payment provider (or staff) reports about a successful payment. */
export interface PaymentReceipt {
  method: PaymentMethod;
  transactionId: string;
  note: string;
}

/**
 * Marks an order paid and takes its stock. Callers check who may do this: the
 * Stripe webhook (signature verified) or staff recording a payment by hand.
 * The same transaction twice is a no-op, since providers retry webhooks.
 */
export class PayOrderUseCase {
  constructor(
    private readonly orders: IOrderRepository,
    private readonly books: IBookRepository,
    private readonly uow?: IUnitOfWork,
    private readonly notifications?: INotificationPort,
    private readonly lowStockThreshold = DEFAULT_LOW_STOCK_THRESHOLD,
  ) {}

  async execute(orderId: string, receipt: PaymentReceipt): Promise<Order> {
    const order = await this.orders.findById(orderId);
    if (!order) throw new DomainError('Order not found', 'NOT_FOUND');
    if (order.payment.status === 'paid' && order.payment.transactionId === receipt.transactionId) {
      return order;
    }
    if (order.status !== 'pending_payment') {
      throw new DomainError('Order is not awaiting payment', 'VALIDATION');
    }

    assertTransition(order.status, 'paid');

    const decremented: { bookId: string; quantity: number }[] = [];
    const run = this.uow
      ? <T>(fn: () => Promise<T>) => this.uow!.runInTransaction(async () => fn())
      : <T>(fn: () => Promise<T>) => fn();

    try {
      await run(async () => {
        for (const item of order.items) {
          const ok = await this.books.decrementStock(item.book, item.quantity);
          if (!ok) {
            throw new DomainError(
              `Insufficient stock for book ${item.title}`,
              'INSUFFICIENT_STOCK',
            );
          }
          decremented.push({ bookId: item.book, quantity: item.quantity });
        }
      });

      order.status = 'paid';
      order.payment = {
        ...order.payment,
        method: receipt.method,
        status: 'paid',
        paidAt: new Date(),
        transactionId: receipt.transactionId,
      };
      order.statusHistory.push({ status: 'paid', at: new Date(), note: receipt.note });
      const saved = await this.orders.save(order);

      await domainEvents.publish(
        orderPaidEvent({
          orderId: saved.id,
          userId: saved.user,
          totalAmount: saved.totalAmount,
        }),
      );

      if (this.notifications) {
        await this.notifications.send({
          subject: `Order ${saved.id} paid`,
          body: `Payment confirmed for order ${saved.id} (total ${(saved.totalAmount / 100).toFixed(2)})`,
          meta: { orderId: saved.id, userId: saved.user },
        });
      }

      for (const item of saved.items) {
        const book = await this.books.findById(item.book);
        if (book && isStockLow(book.stock, this.lowStockThreshold)) {
          await domainEvents.publish(
            stockLowEvent({
              bookId: book.id,
              title: book.title,
              stock: book.stock,
              threshold: this.lowStockThreshold,
            }),
          );
        }
      }

      return saved;
    } catch (err) {
      for (const d of decremented) {
        await this.books.incrementStock(d.bookId, d.quantity);
      }

      if (err instanceof DomainError && err.code === 'INSUFFICIENT_STOCK') {
        order.status = 'failed';
        order.payment = {
          ...order.payment,
          method: receipt.method,
          status: 'failed',
          transactionId: receipt.transactionId,
        };
        order.statusHistory.push({
          status: 'failed',
          at: new Date(),
          // the provider already took the money, so staff must refund it
          note:
            receipt.method === 'stripe'
              ? `${err.message}. Refund ${receipt.transactionId} in Stripe.`
              : err.message,
        });
        await this.orders.save(order);
      }
      throw err;
    }
  }
}
