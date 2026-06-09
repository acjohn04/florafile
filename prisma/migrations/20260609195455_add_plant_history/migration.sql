-- CreateTable
CREATE TABLE "plant_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "plantId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "plant_history_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "plants" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "plant_history_plantId_idx" ON "plant_history"("plantId");
