-- Check if user_presence table has a proper primary key
SELECT 
  conname AS constraint_name,
  contype AS constraint_type,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conrelid = 'user_presence'::regclass
  AND contype IN ('p', 'u');

-- Also check the table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'user_presence'
ORDER BY ordinal_position;


