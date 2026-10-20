ALTER TABLE "Book" ADD COLUMN "series" TEXT, ADD COLUMN "seriesNumber" INTEGER, ADD COLUMN "sample" TEXT;
CREATE INDEX "Book_series_idx" ON "Book"("series");
