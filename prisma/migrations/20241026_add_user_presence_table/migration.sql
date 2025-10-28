-- CreateTable
CREATE TABLE "UserPresence" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "userEmail" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "pageUrl" TEXT NOT NULL,
    "auraColor" TEXT NOT NULL DEFAULT '#45B7D1',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastSeen" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt" TIMESTAMPTZ NOT NULL,

    CONSTRAINT "UserPresence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserPresence_userEmail_pageId_key" ON "UserPresence"("userEmail", "pageId");

-- CreateIndex
CREATE INDEX "UserPresence_userEmail_idx" ON "UserPresence"("userEmail");

-- CreateIndex
CREATE INDEX "UserPresence_pageId_idx" ON "UserPresence"("pageId");

-- CreateIndex
CREATE INDEX "UserPresence_isActive_idx" ON "UserPresence"("isActive");

-- CreateIndex
CREATE INDEX "UserPresence_lastSeen_idx" ON "UserPresence"("lastSeen");


