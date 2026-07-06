-- AddForeignKey
ALTER TABLE "Participant" ADD CONSTRAINT "Participant_measureId_fkey" FOREIGN KEY ("measureId") REFERENCES "Measure"("id") ON DELETE SET NULL ON UPDATE CASCADE;
