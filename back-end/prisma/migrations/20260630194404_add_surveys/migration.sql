-- CreateTable
CREATE TABLE "Survey" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'satisfaction',
    "title" TEXT,
    "rating" INTEGER,
    "maxRating" INTEGER DEFAULT 5,
    "score" TEXT,
    "notes" TEXT,
    "surveyDate" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Survey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Survey_tenantId_idx" ON "Survey"("tenantId");

-- CreateIndex
CREATE INDEX "Survey_participantId_idx" ON "Survey"("participantId");

-- AddForeignKey
ALTER TABLE "Survey" ADD CONSTRAINT "Survey_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
