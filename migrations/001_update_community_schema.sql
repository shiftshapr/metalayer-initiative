-- Migration to update Community schema and add super admin system
-- Run this after updating the Prisma schema

-- Add new columns to Community table
ALTER TABLE "Community" ADD COLUMN IF NOT EXISTS "codeOfConduct" TEXT;
ALTER TABLE "Community" ADD COLUMN IF NOT EXISTS "logo" TEXT;
ALTER TABLE "Community" ADD COLUMN IF NOT EXISTS "daoLink" TEXT;
ALTER TABLE "Community" ADD COLUMN IF NOT EXISTS "onboardingInstructions" TEXT;
ALTER TABLE "Community" ADD COLUMN IF NOT EXISTS "ownerId" TEXT;
ALTER TABLE "Community" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP;

-- Add super admin column to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isSuperAdmin" BOOLEAN DEFAULT false;

-- Set themetalayer@gmail.com as super admin
UPDATE "User" SET "isSuperAdmin" = true WHERE email = 'themetalayer@gmail.com';

-- If the user doesn't exist, create them
INSERT INTO "User" (id, email, name, "isSuperAdmin", "createdAt", "updatedAt")
SELECT 
    gen_random_uuid(),
    'themetalayer@gmail.com',
    'Metalayer Admin',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM "User" WHERE email = 'themetalayer@gmail.com');

-- Update existing communities to have an owner (assign to super admin)
UPDATE "Community" 
SET "ownerId" = (SELECT id FROM "User" WHERE email = 'themetalayer@gmail.com' LIMIT 1)
WHERE "ownerId" IS NULL;

-- Add foreign key constraint for ownerId
ALTER TABLE "Community" ADD CONSTRAINT "Community_ownerId_fkey" 
FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;









