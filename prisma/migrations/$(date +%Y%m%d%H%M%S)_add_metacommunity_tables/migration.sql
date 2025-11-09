-- CreateTable: MetaCommunity (renamed from MetaCommunityWaitlist, with new structure)
CREATE TABLE IF NOT EXISTS "MetaCommunity" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "codeOfConduct" TEXT,
    "logoUrl" TEXT,
    "communityLink" TEXT,
    "onboardingInstructions" TEXT,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "isOpen" BOOLEAN NOT NULL DEFAULT true,
    "profileLink" TEXT,
    "legacyId" TEXT,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Waitlist submission fields (for approved communities from waitlist)
    "submittedEmail" TEXT,
    "submittedPhone" TEXT,
    "purpose" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "reviewedAt" TIMESTAMPTZ(6),
    "reviewedBy" UUID,
    "reviewNotes" TEXT,

    CONSTRAINT "MetaCommunity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "MetaCommunity_legacyId_key" ON "MetaCommunity"("legacyId");
CREATE INDEX IF NOT EXISTS "MetaCommunity_status_idx" ON "MetaCommunity"("status");
CREATE INDEX IF NOT EXISTS "MetaCommunity_isPublic_idx" ON "MetaCommunity"("isPublic");
CREATE INDEX IF NOT EXISTS "MetaCommunity_profileLink_idx" ON "MetaCommunity"("profileLink");
CREATE INDEX IF NOT EXISTS "MetaCommunity_createdAt_idx" ON "MetaCommunity"("createdAt");

-- CreateTable: MetaCommunityMembership
CREATE TABLE IF NOT EXISTS "MetaCommunityMembership" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "userId" UUID NOT NULL,
    "metaCommunityId" UUID NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "tabId" INTEGER,
    "joinedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MetaCommunityMembership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "unique_user_community_tab" ON "MetaCommunityMembership"("userId", "metaCommunityId", "tabId");
CREATE INDEX IF NOT EXISTS "MetaCommunityMembership_userId_idx" ON "MetaCommunityMembership"("userId");
CREATE INDEX IF NOT EXISTS "MetaCommunityMembership_metaCommunityId_idx" ON "MetaCommunityMembership"("metaCommunityId");
CREATE INDEX IF NOT EXISTS "MetaCommunityMembership_userId_isActive_idx" ON "MetaCommunityMembership"("userId", "isActive");
CREATE INDEX IF NOT EXISTS "MetaCommunityMembership_userId_isPrimary_idx" ON "MetaCommunityMembership"("userId", "isPrimary");
CREATE INDEX IF NOT EXISTS "MetaCommunityMembership_userId_tabId_idx" ON "MetaCommunityMembership"("userId", "tabId");
CREATE INDEX IF NOT EXISTS "MetaCommunityMembership_metaCommunityId_isActive_idx" ON "MetaCommunityMembership"("metaCommunityId", "isActive");

-- AddForeignKey
ALTER TABLE "MetaCommunityMembership" ADD CONSTRAINT "MetaCommunityMembership_userId_fkey" FOREIGN KEY ("userId") REFERENCES "AppUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MetaCommunityMembership" ADD CONSTRAINT "MetaCommunityMembership_metaCommunityId_fkey" FOREIGN KEY ("metaCommunityId") REFERENCES "MetaCommunity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Migrate data from MetaCommunityWaitlist to MetaCommunity (if table exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'MetaCommunityWaitlist') THEN
        INSERT INTO "MetaCommunity" (
            "name", "description", "codeOfConduct", "logoUrl", "communityLink", 
            "onboardingInstructions", "submittedEmail", "submittedPhone", 
            "purpose", "status", "reviewedAt", "reviewedBy", "reviewNotes",
            "createdAt", "updatedAt", "isPublic", "isOpen"
        )
        SELECT 
            "name",
            "purpose" as "description",
            "codeOfConduct",
            "logoUrl",
            "communityLink",
            "onboardingInstructions",
            "email" as "submittedEmail",
            "phone" as "submittedPhone",
            "purpose",
            "status",
            "reviewedAt",
            "reviewedBy",
            "reviewNotes",
            "submittedAt" as "createdAt",
            COALESCE("reviewedAt", "submittedAt") as "updatedAt",
            false as "isPublic",
            false as "isOpen"
        FROM "MetaCommunityWaitlist"
        ON CONFLICT DO NOTHING;
        
        RAISE NOTICE 'Migrated data from MetaCommunityWaitlist to MetaCommunity';
    END IF;
END $$;






