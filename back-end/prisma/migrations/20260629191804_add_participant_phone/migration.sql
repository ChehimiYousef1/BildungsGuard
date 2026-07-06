/*
  Warnings:

  - You are about to drop the column `voucherValidUntil` on the `Participant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Participant" DROP COLUMN "voucherValidUntil",
ADD COLUMN     "phone" TEXT;
