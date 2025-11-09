-- AlterTable
ALTER TABLE "messages" ADD COLUMN IF NOT EXISTS "quote_id" UUID,
ADD COLUMN IF NOT EXISTS "reposted_to_communities" TEXT[] DEFAULT ARRAY[]::TEXT[];

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_messages_quote_id" ON "messages"("quote_id");




