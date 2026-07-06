-- CreateTable
CREATE TABLE "LessonProgress" (
    "id" TEXT NOT NULL,
    "participantId" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "courseId" TEXT,
    "completed" BOOLEAN NOT NULL DEFAULT true,
    "completedAt" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LessonProgress_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LessonProgress_tenantId_idx" ON "LessonProgress"("tenantId");

-- CreateIndex
CREATE INDEX "LessonProgress_participantId_idx" ON "LessonProgress"("participantId");

-- CreateIndex
CREATE UNIQUE INDEX "LessonProgress_participantId_sessionId_key" ON "LessonProgress"("participantId", "sessionId");
