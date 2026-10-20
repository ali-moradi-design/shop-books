-- Money is stored as integer minor units (cents). Existing decimal amounts are scaled by 100.
ALTER TABLE "Book" ALTER COLUMN "price" TYPE INTEGER USING ROUND("price" * 100)::INTEGER;
ALTER TABLE "OrderItem" ALTER COLUMN "price" TYPE INTEGER USING ROUND("price" * 100)::INTEGER;
ALTER TABLE "Order" ALTER COLUMN "subtotalAmount" TYPE INTEGER USING ROUND("subtotalAmount" * 100)::INTEGER;
ALTER TABLE "Order" ALTER COLUMN "discountAmount" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "discountAmount" TYPE INTEGER USING ROUND("discountAmount" * 100)::INTEGER;
ALTER TABLE "Order" ALTER COLUMN "discountAmount" SET DEFAULT 0;
ALTER TABLE "Order" ALTER COLUMN "totalAmount" TYPE INTEGER USING ROUND("totalAmount" * 100)::INTEGER;
UPDATE "Discount" SET "value" = ROUND("value" * 100) WHERE "type" = 'fixed';
ALTER TABLE "Discount" ALTER COLUMN "minOrderAmount" TYPE INTEGER USING ROUND("minOrderAmount" * 100)::INTEGER;
