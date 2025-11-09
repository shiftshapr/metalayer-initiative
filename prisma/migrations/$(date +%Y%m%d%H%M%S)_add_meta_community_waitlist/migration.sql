-- CreateTable
CREATE TABLE IF NOT EXISTS "MetaCommunityWaitlist" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "purpose" TEXT NOT NULL,
    "codeOfConduct" TEXT NOT NULL,
    "logoUrl" TEXT,
    "communityLink" TEXT,
    "onboardingInstructions" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "submittedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "reviewedAt" TIMESTAMPTZ(6),
    "reviewedBy" UUID,
    "reviewNotes" TEXT,

    CONSTRAINT "MetaCommunityWaitlist_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MetaCommunityWaitlist_status_idx" ON "MetaCommunityWaitlist"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "MetaCommunityWaitlist_submittedAt_idx" ON "MetaCommunityWaitlist"("submittedAt");





