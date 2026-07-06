-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "opens" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "trackId" TEXT;
