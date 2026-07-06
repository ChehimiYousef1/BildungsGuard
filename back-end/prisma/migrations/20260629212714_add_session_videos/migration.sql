-- CreateTable
CREATE TABLE "SessionVideo" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "title" TEXT,
    "videoRef" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SessionVideo_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SessionVideo_tenantId_idx" ON "SessionVideo"("tenantId");

-- CreateIndex
CREATE INDEX "SessionVideo_sessionId_idx" ON "SessionVideo"("sessionId");

-- AddForeignKey
ALTER TABLE "SessionVideo" ADD CONSTRAINT "SessionVideo_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "Session"("id") ON DELETE CASCADE ON UPDATE CASCADE;
