-- Migration to clean up user_presence table and use AppUser for user data
-- This removes aura_color and avatar_url from user_presence since they belong in AppUser

-- Step 1: Check if we have data in AppUser table
SELECT COUNT(*) as app_user_count FROM "AppUser";

-- Step 2: Check current user_presence data
SELECT 
  COUNT(*) as total_presence_records,
  COUNT(CASE WHEN aura_color IS NOT NULL THEN 1 END) as records_with_aura_color,
  COUNT(CASE WHEN avatar_url IS NOT NULL THEN 1 END) as records_with_avatar_url
FROM user_presence;

-- Step 3: If AppUser table is empty, we need to populate it from user_presence
-- This is a one-time migration to move user data to the correct table
INSERT INTO "AppUser" (id, handle, email, name, "avatarUrl", "auraColor", "isVerified", "isSuperAdmin", "createdAt", "updatedAt")
SELECT 
  gen_random_uuid() as id,
  COALESCE(user_name, user_email) as handle,
  user_email as email,
  user_name as name,
  avatar_url as "avatarUrl",
  COALESCE(aura_color, '#ffffff') as "auraColor",
  true as "isVerified",
  false as "isSuperAdmin",
  COALESCE(created_at, NOW()) as "createdAt",
  NOW() as "updatedAt"
FROM user_presence
WHERE user_email NOT IN (SELECT email FROM "AppUser" WHERE email IS NOT NULL)
GROUP BY user_email, user_name, avatar_url, aura_color, created_at;

-- Step 4: Remove aura_color and avatar_url columns from user_presence
-- (We'll do this in a separate migration to be safe)

-- Step 5: Verify the migration
SELECT 
  'AppUser' as table_name,
  COUNT(*) as record_count
FROM "AppUser"
UNION ALL
SELECT 
  'user_presence' as table_name,
  COUNT(*) as record_count
FROM user_presence;
