import { z } from 'zod';
import { DISCOUNT_TYPES } from '../../../../domain/discount/discount.entity';

export const createDiscountSchema = z.object({
  code: z.string().min(1).max(50),
  type: z.enum(DISCOUNT_TYPES),
  /** Percent, or minor units (cents) when type is fixed. */
  value: z.number().nonnegative(),
  /** Minor units (cents). */
  minOrderAmount: z.number().int().nonnegative().optional(),
  maxUses: z.number().int().nonnegative().optional(),
  startsAt: z.coerce.date().optional().nullable(),
  endsAt: z.coerce.date().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const updateDiscountSchema = createDiscountSchema.partial();

export const idParamSchema = z.object({ id: z.string().min(1) });
