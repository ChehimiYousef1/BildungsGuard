-- CreateTable
CREATE TABLE "TrainerQualification" (
    "id" TEXT NOT NULL,
    "trainerName" TEXT,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'qualification',
    "validUntil" TEXT,
    "approvedFor" TEXT,
    "fileRef" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainerQualification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrainerQualification_tenantId_idx" ON "TrainerQualification"("tenantId");

-- CreateIndex
CREATE INDEX "TrainerQualification_userId_idx" ON "TrainerQualification"("userId");
