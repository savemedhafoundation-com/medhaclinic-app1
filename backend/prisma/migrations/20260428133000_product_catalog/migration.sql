ALTER TYPE "StoreProductCategory" ADD VALUE IF NOT EXISTS 'PACKAGES';

CREATE TYPE "ProductPriceType" AS ENUM ('FIXED', 'RANGE');

ALTER TABLE "products"
  ADD COLUMN "benefits" TEXT,
  ADD COLUMN "usage" TEXT,
  ADD COLUMN "price_type" "ProductPriceType" NOT NULL DEFAULT 'FIXED',
  ADD COLUMN "min_price_paise" INTEGER,
  ADD COLUMN "max_price_paise" INTEGER,
  ADD COLUMN "tags" JSONB,
  ADD COLUMN "sort_order" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "featured" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "hidden" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "deleted_at" TIMESTAMP(3),
  ADD COLUMN "seo_title" TEXT,
  ADD COLUMN "seo_description" TEXT;

UPDATE "products"
SET
  "min_price_paise" = COALESCE("min_price_paise", "price_paise"),
  "max_price_paise" = COALESCE("max_price_paise", "price_paise");

CREATE TABLE "product_variants" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "product_id" UUID NOT NULL,
  "title" TEXT NOT NULL,
  "price_paise" INTEGER NOT NULL,
  "stock" INTEGER NOT NULL DEFAULT 0,
  "sku" TEXT,
  "active" BOOLEAN NOT NULL DEFAULT true,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "product_images" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "product_id" UUID NOT NULL,
  "url" TEXT NOT NULL,
  "alt" TEXT,
  "sort_order" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "product_images_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "product_variants_product_id_idx" ON "product_variants"("product_id");
CREATE INDEX "product_images_product_id_idx" ON "product_images"("product_id");
CREATE INDEX "products_category_active_hidden_deleted_at_idx" ON "products"("category", "active", "hidden", "deleted_at");
CREATE INDEX "products_featured_sort_order_idx" ON "products"("featured", "sort_order");

ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "product_images" ADD CONSTRAINT "product_images_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
