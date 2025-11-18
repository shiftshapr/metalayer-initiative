-- Migration: Add isVisible column to AppUser
-- Ensures compatibility with latest Prisma schema

ALTER TABLE "AppUser"
ADD COLUMN IF NOT EXISTS "isVisible" BOOLEAN DEFAULT TRUE;

-- Backfill null values to true to maintain visibility by default
UPDATE "AppUser"
SET "isVisible" = TRUE
WHERE "isVisible" IS NULL;

-- Ensure updated_at timestamp reflects schema update if desired
-- UPDATE "AppUser" SET "updatedAt" = NOW() WHERE "isVisible" IS TRUE AND "updatedAt" IS NULL;
