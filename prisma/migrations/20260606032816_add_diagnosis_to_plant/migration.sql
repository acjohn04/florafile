-- AlterTable
ALTER TABLE "plants" ADD COLUMN "diagnosisDescription" TEXT;
ALTER TABLE "plants" ADD COLUMN "diagnosisName" TEXT;
ALTER TABLE "plants" ADD COLUMN "recoverySteps" TEXT;
ALTER TABLE "plants" ADD COLUMN "severity" TEXT;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "diagnoses";
PRAGMA foreign_keys=on;
