import express, { Router, type Express, type Request, type Response } from 'express';
import { z } from 'zod';
import { authenticate } from '../../middleware/security/auth';
import { validate } from '../../middleware/validate';
import { asyncHandler } from '../../../../shared/asyncHandler';
import { AppError } from '../../../../shared/AppError';
import { checkoutService, payments } from '../../../../infrastructure/composition';

const sessionParams = z.object({ id: z.string().regex(/^cs_test_mock_[a-f0-9]{32}$/) });
const payBody = z.object({
  card: z.string().min(12).max(23),
  expiry: z.string().max(9).optional(),
  cvc: z.string().max(4).optional(),
});

function simulator() {
  if (!payments.mock) throw new AppError('Not found', 404);
  return payments.mock.checkout;
}

/** The simulated Stripe Checkout page's backend; only when no Stripe key is set. */
const router = Router();
router.get(
  '/simulator/sessions/:id',
  authenticate,
  validate({ params: sessionParams }),
  asyncHandler(async (req: Request, res: Response) => {
    res.json({ data: await simulator().describe(String(req.params.id), req.user!.id) });
  }),
);
router.post(
  '/simulator/sessions/:id/pay',
  authenticate,
  validate({ params: sessionParams, body: payBody }),
  asyncHandler(async (req: Request, res: Response) => {
    res.json({ data: await simulator().pay(String(req.params.id), req.user!.id, req.body.card) });
  }),
);
export default router;

/**
 * The webhook needs the exact bytes Stripe signed, so it is mounted before the
 * app-wide JSON parser.
 */
export function registerPaymentWebhook(app: Express): void {
  app.post(
    '/api/v1/payments/stripe/webhook',
    express.raw({ type: 'application/json', limit: '256kb' }),
    asyncHandler(async (req: Request, res: Response) => {
      if (!Buffer.isBuffer(req.body)) throw new AppError('Expected a raw JSON body', 400);
      await checkoutService.handleWebhook(req.body, req.header('stripe-signature'));
      res.json({ received: true });
    }),
  );
}
