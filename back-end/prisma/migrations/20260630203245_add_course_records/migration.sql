-- CreateTable
CREATE TABLE "CourseRecord" (
    "id" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'TEACHING_LOG',
    "recordDate" TEXT,
    "topic" TEXT,
    "trainer" TEXT,
    "hours" INTEGER,
    "notes" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseRecord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CourseRecord_tenantId_idx" ON "CourseRecord"("tenantId");

-- CreateIndex
CREATE INDEX "CourseRecord_courseId_idx" ON "CourseRecord"("courseId");

-- AddForeignKey
ALTER TABLE "CourseRecord" ADD CONSTRAINT "CourseRecord_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
