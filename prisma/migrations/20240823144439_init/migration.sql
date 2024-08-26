-- CreateTable
CREATE TABLE "contact" (
    "contact_id" TEXT NOT NULL PRIMARY KEY,
    "first" TEXT,
    "last" TEXT,
    "avatar" TEXT,
    "favorite" BOOLEAN,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);
