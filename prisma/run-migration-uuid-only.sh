#!/bin/bash

# Migration Script: Clean UUID Foreign Keys Only
# Run this script to execute the clean database migration

set -e  # Exit on error

echo "🔧 Starting Clean Migration: UUID Foreign Keys Only"
echo "=================================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set"
  echo "   Please set it before running this migration"
  exit 1
fi

# Check if migration file exists
MIGRATION_FILE="prisma/migrations/migrate-to-uuid-only.sql"
if [ ! -f "$MIGRATION_FILE" ]; then
  echo "❌ ERROR: Migration file not found: $MIGRATION_FILE"
  exit 1
fi

echo "✅ Migration file found: $MIGRATION_FILE"
echo ""

# Backup check
echo "⚠️  IMPORTANT: This migration will modify your database structure"
echo "   - Adds user_id columns to all tables"
echo "   - Populates user_id from AppUser.email"
echo "   - Adds foreign key constraints"
echo "   - Changes user_presence primary key structure"
echo "   - Removes email-based foreign keys"
echo ""
read -p "Have you backed up your database? (yes/no): " backup_confirmed

if [ "$backup_confirmed" != "yes" ]; then
  echo "❌ Migration cancelled - please backup your database first"
  exit 1
fi

echo ""
echo "📊 Running pre-migration validation..."
echo ""

# Run validation queries
psql "$DATABASE_URL" <<EOF
-- Count records before migration
SELECT 
  'messages' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT user_email) as unique_emails
FROM messages
WHERE user_email IS NOT NULL
UNION ALL
SELECT 
  'reactions' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT user_email) as unique_emails
FROM reactions
WHERE user_email IS NOT NULL
UNION ALL
SELECT 
  'user_presence' as table_name,
  COUNT(*) as total_records,
  COUNT(DISTINCT user_email) as unique_emails
FROM user_presence
WHERE user_email IS NOT NULL;

-- Check for orphaned records (user_email not in AppUser)
SELECT 
  'messages' as table_name,
  COUNT(*) as orphaned_records
FROM messages m
LEFT JOIN "AppUser" au ON m.user_email = au.email
WHERE m.user_email IS NOT NULL AND au.id IS NULL
UNION ALL
SELECT 
  'reactions' as table_name,
  COUNT(*) as orphaned_records
FROM reactions r
LEFT JOIN "AppUser" au ON r.user_email = au.email
WHERE r.user_email IS NOT NULL AND au.id IS NULL
UNION ALL
SELECT 
  'user_presence' as table_name,
  COUNT(*) as orphaned_records
FROM user_presence up
LEFT JOIN "AppUser" au ON up.user_email = au.email
WHERE up.user_email IS NOT NULL AND au.id IS NULL;
EOF

echo ""
read -p "Continue with migration? (yes/no): " proceed

if [ "$proceed" != "yes" ]; then
  echo "❌ Migration cancelled"
  exit 1
fi

echo ""
echo "🚀 Executing migration..."
echo ""

# Run migration
psql "$DATABASE_URL" -f "$MIGRATION_FILE"

echo ""
echo "✅ Migration completed successfully!"
echo ""
echo "📊 Post-migration validation..."
echo ""

# Run post-migration validation
psql "$DATABASE_URL" <<EOF
-- Count records with user_id populated
SELECT 
  'messages' as table_name,
  COUNT(*) as total_records,
  COUNT(user_id) as records_with_user_id,
  COUNT(*) - COUNT(user_id) as missing_user_id
FROM messages
UNION ALL
SELECT 
  'reactions' as table_name,
  COUNT(*) as total_records,
  COUNT(user_id) as records_with_user_id,
  COUNT(*) - COUNT(user_id) as missing_user_id
FROM reactions
UNION ALL
SELECT 
  'user_presence' as table_name,
  COUNT(*) as total_records,
  COUNT(user_id) as records_with_user_id,
  COUNT(*) - COUNT(user_id) as missing_user_id
FROM user_presence;

-- Verify foreign key constraints
SELECT 
  conname as constraint_name,
  conrelid::regclass as table_name,
  confrelid::regclass as referenced_table
FROM pg_constraint
WHERE contype = 'f'
  AND confrelid = '"AppUser"'::regclass
ORDER BY conname;

-- Test a join to ensure foreign keys work
SELECT 
  m.id as message_id,
  m.user_id,
  au.email as user_email,
  au.name as user_name
FROM messages m
JOIN "AppUser" au ON m.user_id = au.id
LIMIT 5;
EOF

echo ""
echo "✅ Migration validation complete!"
echo ""
echo "📋 Next Steps:"
echo "   1. Update your Prisma schema (copy from schema-uuid-only.prisma)"
echo "   2. Run: npx prisma generate"
echo "   3. Update your code (see CODE_MIGRATION_UUID_ONLY.md)"
echo "   4. Test all functionality"
echo ""
echo "🎉 Clean migration successful!"
echo "   - No backward compatibility needed"
echo "   - Cleaner, simpler code"
echo "   - Standard relational design"


