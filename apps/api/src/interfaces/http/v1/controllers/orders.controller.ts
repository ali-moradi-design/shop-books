import { Request, Response } from 'express';
import { checkoutService, orderService } from '../../../../infrastructure/composition';
import { asyncHandler } from '../../../../shared/asyncHandler';
import { presentOrder, presentOrders } from '../presenters/order.presenter';

export const create = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.create(
    req.user!.id,
    req.body.items,
    req.body.shippingAddress,
    req.body.discountCode,
  );
  res.status(201).json({ data: presentOrder(order) });
});

export const pay = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.recordPayment(String(req.params.id), req.user!.id);
  res.json({ data: presentOrder(order) });
});

export const listMine = asyncHandler(async (req: Request, res: Response) => {
  const canReadAll = req.user!.permissions.includes('orders:read');
  const orders = await orderService.list(req.user!.id, canReadAll);
  res.json({ data: presentOrders(orders) });
});

export const getById = asyncHandler(async (req: Request, res: Response) => {
  const canReadAll = req.user!.permissions.includes('orders:read');
  const order = await orderService.getById(String(req.params.id), req.user!.id, canReadAll);
  res.json({ data: presentOrder(order) });
});

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.updateStatus(
    String(req.params.id),
    req.body.status,
    req.body.note,
    req.body.shipment,
  );
  res.json({ data: presentOrder(order) });
});

export const cancelOwn = asyncHandler(async (req: Request, res: Response) => {
  const order = await orderService.cancelOwn(String(req.params.id), req.user!.id, req.body?.reason);
  res.json({ data: presentOrder(order) });
});

/** POST /orders/:id/checkout — the Checkout Session URL to send the customer to. */
export const startCheckout = asyncHandler(async (req: Request, res: Response) => {
  const { url } = await checkoutService.start(String(req.params.id), req.user!.id);
  res.json({ data: { url, mode: checkoutService.mode } });
});
