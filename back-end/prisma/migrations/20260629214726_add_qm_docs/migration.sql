-- CreateTable
CREATE TABLE "QmDoc" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'process',
    "title" TEXT NOT NULL,
    "content" TEXT,
    "version" TEXT,
    "author" TEXT,
    "owner" TEXT,
    "status" TEXT NOT NULL DEFAULT 'doc_ready',
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QmDoc_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "QmDoc_tenantId_idx" ON "QmDoc"("tenantId");
