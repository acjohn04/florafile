-- CreateTable
CREATE TABLE "plants" (
    "id" TEXT NOT NULL PRIMARY KEY,
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
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "tasks" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "plantId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "dayOfWeek" INTEGER NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "weekStart" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tasks_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "plants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "diagnoses" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "plantId" TEXT,
    "imageUrl" TEXT,
    "diagnosisName" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "recoverySteps" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
