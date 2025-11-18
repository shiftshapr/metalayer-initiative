-- Migration: Drop deprecated preferences column
-- Date: 2025-01-28
-- Description: Removes the deprecated preferences JSON column from AppUser table
--              All preferences have been migrated to individual columns (theme, headline, displayName, auraIntensity)

-- Step 1: Verify all data has been migrated (optional check)
-- This is a safety check - in production, you may want to verify no critical data remains
DO $$
DECLARE
  users_with_prefs INTEGER;
BEGIN
  SELECT COUNT(*) INTO users_with_prefs
  FROM "AppUser"
  WHERE "preferences" IS NOT NULL
    AND "preferences"::text != '{}'::text;
  
  IF users_with_prefs > 0 THEN
    RAISE NOTICE 'Warning: % users still have data in preferences column', users_with_prefs;
    -- Uncomment the next line to abort if data remains:
    -- RAISE EXCEPTION 'Cannot drop preferences column: % users still have data', users_with_prefs;
  END IF;
END $$;

-- Step 2: Drop the preferences column
ALTER TABLE "AppUser" DROP COLUMN IF EXISTS "preferences";

-- Step 3: Add comment documenting the removal
COMMENT ON TABLE "AppUser" IS 'User preferences are now stored in individual columns: theme, headline, displayName, auraIntensity';




