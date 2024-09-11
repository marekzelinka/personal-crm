-- CreateTable
CREATE TABLE "note" (
    "note_id" TEXT NOT NULL PRIMARY KEY,
    "text" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "contact_id" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "note_contact_id_fkey" FOREIGN KEY ("contact_id") REFERENCES "contact" ("contact_id") ON DELETE CASCADE ON UPDATE CASCADE
);
