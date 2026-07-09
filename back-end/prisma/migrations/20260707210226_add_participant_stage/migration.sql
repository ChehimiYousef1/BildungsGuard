-- AlterTable
ALTER TABLE "Attendance" ADD COLUMN     "graduationDate" TIMESTAMP(3),
ADD COLUMN     "stage" TEXT DEFAULT 'onboarding';

-- AlterTable
ALTER TABLE "Campaign" ADD COLUMN     "graduationDate" TIMESTAMP(3),
ADD COLUMN     "stage" TEXT DEFAULT 'onboarding';

-- AlterTable
ALTER TABLE "Capa" ADD COLUMN     "graduationDate" TIMESTAMP(3),
ADD COLUMN     "stage" TEXT DEFAULT 'onboarding';

-- AlterTable
ALTER TABLE "DiaryEntry" ADD COLUMN     "graduationDate" TIMESTAMP(3),
ADD COLUMN     "stage" TEXT DEFAULT 'onboarding';

-- AlterTable
ALTER TABLE "Document" ADD COLUMN     "graduationDate" TIMESTAMP(3),
ADD COLUMN     "stage" TEXT DEFAULT 'onboarding';

-- AlterTable
ALTER TABLE "ExternalAudit" ADD COLUMN     "graduationDate" TIMESTAMP(3),
ADD COLUMN     "stage" TEXT DEFAULT 'onboarding';

-- AlterTable
ALTER TABLE "Measure" ADD COLUMN     "graduationDate" TIMESTAMP(3),
ADD COLUMN     "stage" TEXT DEFAULT 'onboarding';

-- AlterTable
ALTER TABLE "MeasureModule" ADD COLUMN     "graduationDate" TIMESTAMP(3),
ADD COLUMN     "stage" TEXT DEFAULT 'onboarding';

-- AlterTable
ALTER TABLE "Participant" ADD COLUMN     "graduationDate" TIMESTAMP(3),
ADD COLUMN     "stage" TEXT DEFAULT 'onboarding';

-- AlterTable
ALTER TABLE "QmDoc" ADD COLUMN     "graduationDate" TIMESTAMP(3),
ADD COLUMN     "stage" TEXT DEFAULT 'onboarding';

-- AlterTable
ALTER TABLE "Trainer" ADD COLUMN     "graduationDate" TIMESTAMP(3),
ADD COLUMN     "stage" TEXT DEFAULT 'onboarding';
