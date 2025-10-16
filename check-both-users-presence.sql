-- Check what's actually in the user_presence table for both users
-- Run this in Supabase SQL Editor

-- Check all active presence records
SELECT 
  user_email,
  page_id,
  page_url,
  is_active,
  last_seen,
  enter_time,
  created_at,
  updated_at
FROM user_presence
WHERE user_email IN ('themetalayer@gmail.com', 'daveroom@gmail.com')
ORDER BY last_seen DESC;

-- Check specifically for google.com page
SELECT 
  user_email,
  page_id,
  page_url,
  is_active,
  last_seen,
  enter_time
FROM user_presence
WHERE page_id = 'google_com_'
ORDER BY last_seen DESC;

-- Check for any active users on any page
SELECT 
  user_email,
  page_id,
  is_active,
  last_seen
FROM user_presence
WHERE is_active = true
ORDER BY last_seen DESC
LIMIT 20;


