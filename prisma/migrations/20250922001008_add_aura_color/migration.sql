-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ReactionKind" ADD VALUE 'LOVE';
ALTER TYPE "ReactionKind" ADD VALUE 'LAUGH';
ALTER TYPE "ReactionKind" ADD VALUE 'CLARIFY';

-- AlterTable
ALTER TABLE "AppUser" ADD COLUMN     "auraColor" TEXT;

-- AlterTable
ALTER TABLE "Conversation" ADD COLUMN     "communityId" TEXT;

-- AlterTable
ALTER TABLE "Reaction" ADD COLUMN     "emoji" TEXT;

-- CreateIndex
CREATE INDEX "Conversation_communityId_idx" ON "Conversation"("communityId");
