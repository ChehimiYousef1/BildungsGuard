-- CreateTable
CREATE TABLE "DiaryEntry" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "entryDate" TEXT,
    "company" TEXT,
    "position" TEXT,
    "method" TEXT,
    "status" TEXT NOT NULL DEFAULT 'applied',
    "notes" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DiaryEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DiaryEntry_tenantId_idx" ON "DiaryEntry"("tenantId");

-- CreateIndex
CREATE INDEX "DiaryEntry_participantId_idx" ON "DiaryEntry"("participantId");

-- AddForeignKey
ALTER TABLE "DiaryEntry" ADD CONSTRAINT "DiaryEntry_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
