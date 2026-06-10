-- CreateTable
CREATE TABLE "locations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "householdId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "locations_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "Household" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "locations_householdId_name_key" ON "locations"("householdId", "name");

-- Seed existing households with default locations
INSERT INTO "locations" ("id", "householdId", "name", "updatedAt") SELECT lower(hex(randomblob(16))), "id", 'Living Room', CURRENT_TIMESTAMP FROM "Household";
INSERT INTO "locations" ("id", "householdId", "name", "updatedAt") SELECT lower(hex(randomblob(16))), "id", 'Bedroom', CURRENT_TIMESTAMP FROM "Household";
INSERT INTO "locations" ("id", "householdId", "name", "updatedAt") SELECT lower(hex(randomblob(16))), "id", 'Office', CURRENT_TIMESTAMP FROM "Household";
INSERT INTO "locations" ("id", "householdId", "name", "updatedAt") SELECT lower(hex(randomblob(16))), "id", 'Kitchen', CURRENT_TIMESTAMP FROM "Household";
INSERT INTO "locations" ("id", "householdId", "name", "updatedAt") SELECT lower(hex(randomblob(16))), "id", 'Bathroom', CURRENT_TIMESTAMP FROM "Household";
INSERT INTO "locations" ("id", "householdId", "name", "updatedAt") SELECT lower(hex(randomblob(16))), "id", 'Balcony', CURRENT_TIMESTAMP FROM "Household";
INSERT INTO "locations" ("id", "householdId", "name", "updatedAt") SELECT lower(hex(randomblob(16))), "id", 'Hallway', CURRENT_TIMESTAMP FROM "Household";
