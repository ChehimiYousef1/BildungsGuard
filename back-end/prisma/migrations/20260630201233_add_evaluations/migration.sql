-- CreateTable
CREATE TABLE "Evaluation" (
    "id" TEXT NOT NULL,
    "scope" TEXT NOT NULL DEFAULT 'participant',
    "participantId" TEXT,
    "courseId" TEXT,
    "title" TEXT,
    "rating" INTEGER,
    "strengths" TEXT,
    "weaknesses" TEXT,
    "recommendation" TEXT,
    "evalDate" TEXT,
    "author" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Evaluation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Evaluation_tenantId_idx" ON "Evaluation"("tenantId");

-- CreateIndex
CREATE INDEX "Evaluation_participantId_idx" ON "Evaluation"("participantId");

-- CreateIndex
CREATE INDEX "Evaluation_courseId_idx" ON "Evaluation"("courseId");

-- AddForeignKey
ALTER TABLE "Evaluation" ADD CONSTRAINT "Evaluation_participantId_fkey" FOREIGN KEY ("participantId") REFERENCES "Participant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
