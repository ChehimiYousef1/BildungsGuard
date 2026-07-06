-- CreateTable
CREATE TABLE "ExternalAudit" (
    "id" TEXT NOT NULL,
    "date" TEXT,
    "body" TEXT,
    "type" TEXT,
    "findings" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ExternalAudit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ExternalAudit_tenantId_idx" ON "ExternalAudit"("tenantId");
