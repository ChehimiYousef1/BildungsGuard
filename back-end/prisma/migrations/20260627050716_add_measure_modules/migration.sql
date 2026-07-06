-- CreateTable
CREATE TABLE "MeasureModule" (
    "id" TEXT NOT NULL,
    "measureId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "ueHours" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "order" INTEGER NOT NULL DEFAULT 0,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeasureModule_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MeasureModule_tenantId_idx" ON "MeasureModule"("tenantId");

-- CreateIndex
CREATE INDEX "MeasureModule_measureId_idx" ON "MeasureModule"("measureId");

-- AddForeignKey
ALTER TABLE "MeasureModule" ADD CONSTRAINT "MeasureModule_measureId_fkey" FOREIGN KEY ("measureId") REFERENCES "Measure"("id") ON DELETE CASCADE ON UPDATE CASCADE;
