-- CreateTable
CREATE TABLE "ParticipantRecord" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "recordDate" TEXT,
    "author" TEXT,
    "signed" BOOLEAN NOT NULL DEFAULT false,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ParticipantRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ParticipantRecord_tenantId_idx" ON "ParticipantRecord"("tenantId");

-- CreateIndex
CREATE INDEX "ParticipantRecord_participantId_idx" ON "ParticipantRecord"("participantId");

-- AddForeignKey
ALTER TABLE "ParticipantRecord" ADD CONSTRAINT "ParticipantRecord_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
