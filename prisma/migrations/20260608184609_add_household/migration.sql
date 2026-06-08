/*
  Warnings:

  - Added the required column `householdId` to the `plants` table without a default value. This is not possible if the table is not empty.
  - Added the required column `householdId` to the `tasks` table without a default value. This is not possible if the table is not empty.

  Migration fix: existing rows are migrated to a seed household that is created inline.
*/
-- CreateTable
CREATE TABLE "Household" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "HouseholdMember" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "HouseholdMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "HouseholdMember_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Seed a default household so existing plants/tasks have a valid householdId
INSERT INTO "Household" ("id", "createdAt") VALUES ('seed_household', CURRENT_TIMESTAMP);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_plants" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "householdId" TEXT NOT NULL,
    "nickname" TEXT NOT NULL,
    "commonName" TEXT NOT NULL,
    "scientificName" TEXT NOT NULL,
    "imageUrl" TEXT,
    "room" TEXT NOT NULL,
    "light" TEXT,
    "water" TEXT,
    "toxicity" TEXT,
    "careLevel" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'healthy',
    "diagnosisName" TEXT,
    "severity" TEXT,
    "diagnosisDescription" TEXT,
    "recoverySteps" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "plants_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_plants" ("careLevel", "commonName", "createdAt", "description", "diagnosisDescription", "diagnosisName", "householdId", "id", "imageUrl", "light", "nickname", "recoverySteps", "room", "scientificName", "severity", "status", "toxicity", "updatedAt", "water") SELECT "careLevel", "commonName", "createdAt", "description", "diagnosisDescription", "diagnosisName", 'seed_household', "id", "imageUrl", "light", "nickname", "recoverySteps", "room", "scientificName", "severity", "status", "toxicity", "updatedAt", "water" FROM "plants";
DROP TABLE "plants";
ALTER TABLE "new_plants" RENAME TO "plants";
CREATE INDEX "plants_householdId_idx" ON "plants"("householdId");
CREATE TABLE "new_tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "householdId" TEXT NOT NULL,
    "plantId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "dayOfWeek" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "weekStart" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tasks_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "tasks_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "plants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_tasks" ("completed", "createdAt", "dayOfWeek", "description", "householdId", "id", "label", "plantId", "type", "weekStart") SELECT "completed", "createdAt", "dayOfWeek", "description", 'seed_household', "id", "label", "plantId", "type", "weekStart" FROM "tasks";
DROP TABLE "tasks";
ALTER TABLE "new_tasks" RENAME TO "tasks";
CREATE INDEX "tasks_householdId_idx" ON "tasks"("householdId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "HouseholdMember_userId_key" ON "HouseholdMember"("userId");
