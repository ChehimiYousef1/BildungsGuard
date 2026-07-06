-- CreateTable
CREATE TABLE "CourseEvaluation" (
    "id" TEXT NOT NULL,
    "courseId" TEXT,
    "measureId" TEXT,
    "period" TEXT,
    "overallRating" INTEGER,
    "contentRating" INTEGER,
    "trainerRating" INTEGER,
    "participantCount" INTEGER NOT NULL DEFAULT 0,
    "strengths" TEXT,
    "improvements" TEXT,
    "notes" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseEvaluation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CourseEvaluation_tenantId_idx" ON "CourseEvaluation"("tenantId");

-- CreateIndex
CREATE INDEX "CourseEvaluation_courseId_idx" ON "CourseEvaluation"("courseId");

-- CreateIndex
CREATE INDEX "CourseEvaluation_measureId_idx" ON "CourseEvaluation"("measureId");

-- AddForeignKey
ALTER TABLE "CourseEvaluation" ADD CONSTRAINT "CourseEvaluation_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseEvaluation" ADD CONSTRAINT "CourseEvaluation_measureId_fkey" FOREIGN KEY ("measureId") REFERENCES "Measure"("id") ON DELETE SET NULL ON UPDATE CASCADE;
