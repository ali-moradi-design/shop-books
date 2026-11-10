import type { IOrderRepository } from '../../domain/order/order.repository';
import type { IBookRepository } from '../../domain/book/book.repository';
import type { Order, OrderStatus, ShippingAddress } from '../../domain/order/order.entity';
import type { DiscountService } from '../discount/discount.service';
import type { IUnitOfWork } from '../shared/unit-of-work.port';
import type { INotificationPort } from '../../domain/shared/notifications.port';
import {
  assertTransition,
  canCancel,
  shouldRestockOnCancel,
} from '../../domain/order/order.transitions';
import { DomainError } from '../../domain/shared/DomainError';
import { assertSufficientStock } from '../../domain/book/rules/stock';
import { computeSubtotal, computeOrderTotal } from '../../domain/cart/rules/cart.totals';
import { PayOrderUseCase, type PaymentReceipt } from './use-cases/pay-order';
import type { Shipment } from '../../domain/order/order.entity';
import {
  domainEvents,
  orderCancelledEvent,
  orderShippedEvent,
  stockRestoredEvent,
} from '../../domain/shared/events';

/** Refunds a payment through the provider; returns the refund id. */
export interface Refunder {
  refund(paymentIntentId: string, amount: number): Promise<string>;
}

export class OrderService {
  private readonly payOrder: PayOrderUseCase;

  constructor(
    private readonly orders: IOrderRepository,
    private readonly books: IBookRepository,
    private readonly discounts?: DiscountService,
    uow?: IUnitOfWork,
    notifications?: INotificationPort,
    private refunds?: Refunder,
  ) {
    this.payOrder = new PayOrderUseCase(orders, books, uow, notifications);
  }

  async create(
    userId: string,
    items: { book: string; quantity: number }[],
    shippingAddress: ShippingAddress,
    discountCode?: string,
  ): Promise<Order> {
    const bookIds = items.map((i) => i.book);
    const books = await this.books.findByIds(bookIds);
    if (books.length !== new Set(bookIds).size) {
      throw new DomainError('One or more books not found', 'NOT_FOUND');
    }

    const bookMap = new Map(books.map((b) => [b.id, b]));
    const orderItems = items.map((item) => {
      const book = bookMap.get(item.book)!;
      assertSufficientStock(book.stock, item.quantity, book.title);
      return {
        book: book.id,
        title: book.title,
        price: book.price,
        quantity: item.quantity,
      };
    });

    const subtotalAmount = computeSubtotal(
      orderItems.map((i) => ({
        bookId: i.book,
        title: i.title,
        price: i.price,
        quantity: i.quantity,
      })),
    );

    let discountAmount = 0;
    let appliedCode: string | undefined;
    let discountId: string | undefined;

    if (this.discounts) {
      const result = await this.discounts.computeDiscount(discountCode, subtotalAmount);
      discountAmount = result.discountAmount;
      appliedCode = result.discount?.code;
      discountId = result.discount?.id;
    } else if (discountCode) {
      throw new DomainError('Discount codes are not available', 'INVALID_DISCOUNT');
    }

    const totalAmount = computeOrderTotal(subtotalAmount, discountAmount);

    const order = await this.orders.create({
      userId,
      items: orderItems,
      subtotalAmount,
      discountCode: appliedCode,
      discountAmount,
      totalAmount,
      shippingAddress,
    });

    if (discountId && this.discounts) {
      await this.discounts.recordUse(discountId);
    }

    return order;
  }

  /** The payment provider used for refunds; set once payments are wired. */
  useRefunder(refunds: Refunder): void {
    this.refunds = refunds;
  }

  /** Staff record a payment taken outside the shop (bank transfer, in store). */
  recordPayment(orderId: string, staffId: string): Promise<Order> {
    return this.payOrder.execute(orderId, {
      method: 'manual',
      transactionId: `manual_${orderId}`,
      note: `Payment recorded by staff (${staffId})`,
    });
  }

  confirmPayment(orderId: string, receipt: PaymentReceipt): Promise<Order> {
    return this.payOrder.execute(orderId, receipt);
  }

  async list(userId: string, canReadAll: boolean): Promise<Order[]> {
    return this.orders.list(canReadAll ? {} : { userId });
  }

  async getById(orderId: string, userId: string, canReadAll: boolean): Promise<Order> {
    const order = await this.orders.findById(orderId);
    if (!order) throw new DomainError('Order not found', 'NOT_FOUND');
    if (!canReadAll && order.user !== userId) {
      throw new DomainError('Forbidden', 'FORBIDDEN');
    }
    return order;
  }

  async updateStatus(
    orderId: string,
    nextStatus: OrderStatus,
    note?: string,
    shipment?: Pick<Shipment, 'carrier' | 'trackingNumber'>,
  ): Promise<Order> {
    const order = await this.orders.findById(orderId);
    if (!order) throw new DomainError('Order not found', 'NOT_FOUND');

    assertTransition(order.status, nextStatus);

    if (nextStatus === 'cancelled' && !canCancel(order.status)) {
      throw new DomainError('Cannot cancel order in current status', 'VALIDATION');
    }

    let refunded = false;
    if (nextStatus === 'cancelled' && shouldRestockOnCancel(order.status)) {
      // money first: if the refund fails nothing has changed and staff can retry
      if (
        order.payment.method === 'stripe' &&
        order.payment.transactionId &&
        this.refunds &&
        !order.refundId
      ) {
        order.refundId = await this.refunds.refund(order.payment.transactionId, order.totalAmount);
        refunded = true;
      }
      for (const item of order.items) {
        const wasOut = await this.books.incrementStock(item.book, item.quantity);
        if (wasOut) await domainEvents.publish(stockRestoredEvent({ bookId: item.book }));
      }
    }
    if (nextStatus === 'shipped' && shipment) {
      order.shipment = {
        ...shipment,
        trackingNumber: shipment.trackingNumber.trim(),
        shippedAt: new Date(),
      };
    }

    order.status = nextStatus;
    const autoNote = refunded ? `Refunded ${order.refundId}` : undefined;
    order.statusHistory.push({
      status: nextStatus,
      at: new Date(),
      note: [note, autoNote].filter(Boolean).join(' · ') || undefined,
    });
    const saved = await this.orders.save(order);

    if (nextStatus === 'shipped')
      await domainEvents.publish(orderShippedEvent({ orderId: saved.id, userId: saved.user }));
    if (nextStatus === 'cancelled')
      await domainEvents.publish(
        orderCancelledEvent({ orderId: saved.id, userId: saved.user, refunded }),
      );
    return saved;
  }

  /** A customer cancels their own order before it ships. */
  async cancelOwn(orderId: string, userId: string, reason?: string): Promise<Order> {
    const order = await this.getById(orderId, userId, false);
    if (!canCancel(order.status)) {
      throw new DomainError(
        'This order has shipped and can no longer be cancelled. You can request a return instead.',
        'VALIDATION',
      );
    }
    return this.updateStatus(
      order.id,
      'cancelled',
      reason ? `Cancelled by customer: ${reason}` : 'Cancelled by customer',
    );
  }
}
