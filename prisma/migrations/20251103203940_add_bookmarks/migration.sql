-- CreateTable
CREATE TABLE "bookmarks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "message_id" UUID NOT NULL,
    "category_id" UUID,
    "comments" TEXT,
    "is_private" BOOLEAN NOT NULL DEFAULT true,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "priority" INTEGER,
    "sort_order" INTEGER,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMPTZ(6),

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "idx_bookmarks_user_id" ON "bookmarks"("user_id");

-- CreateIndex
CREATE INDEX "idx_bookmarks_message_id" ON "bookmarks"("message_id");

-- CreateIndex
CREATE INDEX "idx_bookmarks_category_id" ON "bookmarks"("category_id");

-- CreateIndex
CREATE INDEX "idx_bookmarks_user_deleted" ON "bookmarks"("user_id", "deleted_at");

-- CreateIndex
CREATE INDEX "idx_bookmarks_user_active" ON "bookmarks"("user_id", "archived", "deleted_at");

-- CreateIndex
CREATE INDEX "idx_bookmarks_created_at" ON "bookmarks"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "unique_user_message_bookmark" ON "bookmarks"("user_id", "message_id");

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
