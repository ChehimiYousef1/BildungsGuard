-- CreateTable
CREATE TABLE "PlacementFollowUp" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "month" INTEGER NOT NULL DEFAULT 0,
    "outcome" TEXT,
    "employer" TEXT,
    "jobTitle" TEXT,
    "contractType" TEXT,
    "followUpDate" TEXT,
    "notes" TEXT,
    "consentGiven" BOOLEAN NOT NULL DEFAULT false,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlacementFollowUp_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PlacementFollowUp_tenantId_idx" ON "PlacementFollowUp"("tenantId");

-- CreateIndex
CREATE INDEX "PlacementFollowUp_participantId_idx" ON "PlacementFollowUp"("participantId");

-- AddForeignKey
ALTER TABLE "PlacementFollowUp" ADD CONSTRAINT "PlacementFollowUp_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
