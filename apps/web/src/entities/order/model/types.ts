export interface OrderItem {
  book: string;
  title: string;
  /** Minor units (cents). */
  price: number;
  quantity: number;
}

export interface ShippingAddress {
  fullName: string;
  line1: string;
  line2?: string;
  city: string;
  state?: string;
  postalCode: string;
  country: string;
}

export type OrderStatus =
  'pending_payment' | 'paid' | 'processing' | 'shipped' | 'completed' | 'cancelled' | 'failed';

/** Mirrors the API's allowed status transitions. */
export const NEXT_STATUSES: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ['paid', 'cancelled', 'failed'],
  paid: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['completed'],
  completed: [],
  cancelled: [],
  failed: [],
};

export interface Order {
  id: string;
  user: string;
  items: OrderItem[];
  subtotalAmount: number;
  discountCode?: string;
  discountAmount: number;
  totalAmount: number;
  status: OrderStatus;
  payment: { method: string; status: string; paidAt?: string; transactionId?: string };
  shippingAddress: ShippingAddress;
  statusHistory: { status: string; at: string; note?: string }[];
  shipment?: { carrier: string; trackingNumber: string; shippedAt: string; url?: string };
  refunded?: boolean;
  createdAt: string;
}

/** Orders a customer may still cancel themselves. */
export const CANCELLABLE: OrderStatus[] = ['pending_payment', 'paid', 'processing'];

export type ReturnStatus = 'requested' | 'approved' | 'rejected' | 'received' | 'refunded';

export interface ReturnRequest {
  id: string;
  order: string;
  items: { bookId: string; title: string; quantity: number; price: number }[];
  reason: string;
  comment?: string;
  status: ReturnStatus;
  refundAmount: number;
  refunded: boolean;
  createdAt: string;
}

export const RETURN_STATUS_LABEL: Record<ReturnStatus, string> = {
  requested: 'Requested',
  approved: 'Approved: send the books back',
  rejected: 'Not accepted',
  received: 'Received',
  refunded: 'Refunded',
};
