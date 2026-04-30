CREATE TYPE "AdminRole" AS ENUM ('super_admin', 'admin', 'support', 'viewer');
CREATE TYPE "ShippingStatus" AS ENUM ('NOT_STARTED', 'PACKING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED');
CREATE TYPE "RefundStatus" AS ENUM ('NOT_REQUESTED', 'REQUESTED', 'PROCESSING', 'REFUNDED', 'REJECTED');

ALTER TABLE "User"
  ADD COLUMN "phone" TEXT,
  ADD COLUMN "disabled" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN "deletedAt" TIMESTAMP(3);

CREATE TABLE "AdminUser" (
  "id" TEXT NOT NULL,
  "uid" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "role" "AdminRole" NOT NULL DEFAULT 'viewer',
  "active" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserNote" (
  "id" TEXT NOT NULL,
  "userId" TEXT NOT NULL,
  "note" TEXT NOT NULL,
  "createdBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserNote_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "actorId" TEXT,
  "action" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "products"
  ADD COLUMN "stock" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "sku" TEXT,
  ADD COLUMN "images" JSONB,
  ADD COLUMN "archived" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "coupons"
  ADD COLUMN "usage_limit" INTEGER,
  ADD COLUMN "used_count" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "orders"
  ADD COLUMN "shipping_status" "ShippingStatus" NOT NULL DEFAULT 'NOT_STARTED',
  ADD COLUMN "tracking_number" TEXT,
  ADD COLUMN "courier" TEXT,
  ADD COLUMN "admin_notes" TEXT,
  ADD COLUMN "refund_status" "RefundStatus" NOT NULL DEFAULT 'NOT_REQUESTED',
  ADD COLUMN "packed_at" TIMESTAMP(3),
  ADD COLUMN "shipped_at" TIMESTAMP(3),
  ADD COLUMN "delivered_at" TIMESTAMP(3);

CREATE UNIQUE INDEX "AdminUser_uid_key" ON "AdminUser"("uid");
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");
CREATE INDEX "AdminUser_role_active_idx" ON "AdminUser"("role", "active");
CREATE INDEX "UserNote_userId_createdAt_idx" ON "UserNote"("userId", "createdAt");
CREATE INDEX "AuditLog_actorId_createdAt_idx" ON "AuditLog"("actorId", "createdAt");
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");

ALTER TABLE "UserNote" ADD CONSTRAINT "UserNote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "UserNote" ADD CONSTRAINT "UserNote_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "AdminUser"("uid") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "AdminUser"("uid") ON DELETE SET NULL ON UPDATE CASCADE;
