-- Migration to update existing aura_color values from #45B7D1 to #ffffff
-- This ensures all existing records use white as the fallback instead of blue

-- Update all records that currently have the old blue color to white
UPDATE user_presence 
SET aura_color = '#ffffff' 
WHERE aura_color = '#45B7D1';

-- Update all NULL aura_color values to white
UPDATE user_presence 
SET aura_color = '#ffffff' 
WHERE aura_color IS NULL;

-- Verify the changes
SELECT 
  COUNT(*) as total_records,
  COUNT(CASE WHEN aura_color = '#ffffff' THEN 1 END) as white_records,
  COUNT(CASE WHEN aura_color = '#45B7D1' THEN 1 END) as blue_records,
  COUNT(CASE WHEN aura_color IS NULL THEN 1 END) as null_records
FROM user_presence;
