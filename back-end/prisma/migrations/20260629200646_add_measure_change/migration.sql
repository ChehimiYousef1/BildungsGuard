-- CreateTable
CREATE TABLE "MeasureChange" (
    "id" TEXT NOT NULL,
    "measureId" TEXT NOT NULL,
    "date" TEXT,
    "reason" TEXT NOT NULL,
    "responsible" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MeasureChange_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MeasureChange_tenantId_idx" ON "MeasureChange"("tenantId");

-- CreateIndex
CREATE INDEX "MeasureChange_measureId_idx" ON "MeasureChange"("measureId");

-- AddForeignKey
ALTER TABLE "MeasureChange" ADD CONSTRAINT "MeasureChange_measureId_fkey" FOREIGN KEY ("measureId") REFERENCES "Measure"("id") ON DELETE CASCADE ON UPDATE CASCADE;
