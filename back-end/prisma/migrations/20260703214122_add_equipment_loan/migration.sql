-- CreateTable
CREATE TABLE "EquipmentLoan" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "deviceName" TEXT NOT NULL,
    "serialNumber" TEXT,
    "brand" TEXT,
    "condition" TEXT DEFAULT 'good',
    "loanDate" TEXT,
    "returnDate" TEXT,
    "returnedDate" TEXT,
    "returned" BOOLEAN NOT NULL DEFAULT false,
    "notes" TEXT,
    "signedByParticipant" BOOLEAN NOT NULL DEFAULT false,
    "fileRef" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EquipmentLoan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EquipmentLoan_tenantId_idx" ON "EquipmentLoan"("tenantId");

-- CreateIndex
CREATE INDEX "EquipmentLoan_participantId_idx" ON "EquipmentLoan"("participantId");

-- AddForeignKey
ALTER TABLE "EquipmentLoan" ADD CONSTRAINT "EquipmentLoan_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
