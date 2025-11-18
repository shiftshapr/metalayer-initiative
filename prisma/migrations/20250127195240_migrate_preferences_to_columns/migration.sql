-- Migration: Migrate user preferences from JSON to individual columns
-- Date: 2025-01-27
-- Description: Adds theme, headline, displayName, and auraIntensity columns to AppUser table
--              and migrates existing data from preferences JSON column

-- Step 1: Add new columns with constraints
ALTER TABLE "AppUser" 
  ADD COLUMN IF NOT EXISTS "theme" VARCHAR(10) CHECK ("theme" IN ('light', 'dark', 'auto')),
  ADD COLUMN IF NOT EXISTS "headline" TEXT CHECK (char_length("headline") >= 20 AND char_length("headline") <= 1000),
  ADD COLUMN IF NOT EXISTS "displayName" VARCHAR(16) CHECK (char_length("displayName") >= 4 AND char_length("displayName") <= 16),
  ADD COLUMN IF NOT EXISTS "auraIntensity" DECIMAL(3, 2) CHECK ("auraIntensity" >= 0 AND "auraIntensity" <= 1);

-- Step 2: Create indexes for performance
CREATE INDEX IF NOT EXISTS "idx_appuser_theme" ON "AppUser"("theme");
CREATE INDEX IF NOT EXISTS "idx_appuser_displayname" ON "AppUser"("displayName");

-- Step 3: Migrate existing data from preferences JSON to new columns
-- This migration extracts values from the preferences JSON column and populates the new columns
UPDATE "AppUser"
SET 
  "theme" = CASE 
    WHEN "preferences"->>'theme' IS NOT NULL THEN "preferences"->>'theme'
    ELSE 'light' -- Default to light if not set
  END,
  "headline" = CASE 
    WHEN "preferences"->>'headline' IS NOT NULL 
         AND char_length("preferences"->>'headline') >= 20 
         AND char_length("preferences"->>'headline') <= 1000 
    THEN "preferences"->>'headline'
    ELSE NULL
  END,
  "displayName" = CASE 
    WHEN "preferences"->>'displayName' IS NOT NULL 
         AND char_length("preferences"->>'displayName') >= 4 
         AND char_length("preferences"->>'displayName') <= 16 
    THEN "preferences"->>'displayName'
    ELSE NULL
  END,
  "auraIntensity" = CASE 
    WHEN "preferences"->>'auraIntensity' IS NOT NULL 
         AND CAST("preferences"->>'auraIntensity' AS DECIMAL) >= 0 
         AND CAST("preferences"->>'auraIntensity' AS DECIMAL) <= 1 
    THEN CAST("preferences"->>'auraIntensity' AS DECIMAL(3, 2))
    ELSE 0.5 -- Default to 0.5 if not set or invalid
  END
WHERE "preferences" IS NOT NULL;

-- Step 4: Add comments to columns for documentation
COMMENT ON COLUMN "AppUser"."theme" IS 'User theme preference: light, dark, or auto';
COMMENT ON COLUMN "AppUser"."headline" IS 'User headline (20-1000 characters)';
COMMENT ON COLUMN "AppUser"."displayName" IS 'User display name (4-16 characters)';
COMMENT ON COLUMN "AppUser"."auraIntensity" IS 'Aura intensity (0.0 to 1.0)';

-- Note: The preferences JSON column is kept for backward compatibility during transition
-- It will be removed in a future migration after all code is updated to use the new columns




