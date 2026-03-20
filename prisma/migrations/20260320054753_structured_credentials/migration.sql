-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Credential" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "value" TEXT,
    "apiKey" TEXT,
    "username" TEXT,
    "password" TEXT,
    "cookieValue" TEXT,
    "customHeaders" TEXT,
    "description" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Credential" ("createdAt", "description", "id", "name", "type", "updatedAt", "userId", "value") SELECT "createdAt", "description", "id", "name", "type", "updatedAt", "userId", "value" FROM "Credential";
DROP TABLE "Credential";
ALTER TABLE "new_Credential" RENAME TO "Credential";
CREATE UNIQUE INDEX "Credential_name_userId_key" ON "Credential"("name", "userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
