#!/bin/bash

# Migration Script: Preferences JSON → Individual Columns
# Run this script to execute the database migration

set -e  # Exit on error

echo "🔧 Starting Migration: Preferences JSON → Individual Columns"
echo "=============================================================="
echo ""

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set"
  echo "   Please set it before running this migration"
  exit 1
fi

# Check if migration file exists
MIGRATION_FILE="prisma/migrations/20250127195240_migrate_preferences_to_columns/migration.sql"
if [ ! -f "$MIGRATION_FILE" ]; then
  echo "❌ ERROR: Migration file not found: $MIGRATION_FILE"
  exit 1
fi

echo "✅ Migration file found: $MIGRATION_FILE"
echo ""

# Backup check
echo "⚠️  IMPORTANT: This migration will modify your database structure"
echo "   - Adds theme, headline, displayName, auraIntensity columns to AppUser"
echo "   - Migrates existing data from preferences JSON to new columns"
echo "   - Creates indexes for performance"
echo "   - Keeps preferences column for backward compatibility"
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
-- Count users with preferences
SELECT 
  COUNT(*) as total_users,
  COUNT("preferences") as users_with_preferences,
  COUNT(*) - COUNT("preferences") as users_without_preferences
FROM "AppUser";

-- Check existing preferences structure
SELECT 
  COUNT(*) as users_with_theme,
  COUNT(*) FILTER (WHERE "preferences"->>'headline' IS NOT NULL) as users_with_headline,
  COUNT(*) FILTER (WHERE "preferences"->>'displayName' IS NOT NULL) as users_with_displayname,
  COUNT(*) FILTER (WHERE "preferences"->>'auraIntensity' IS NOT NULL) as users_with_auraintensity
FROM "AppUser"
WHERE "preferences" IS NOT NULL;
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
-- Count records with new columns populated
SELECT 
  COUNT(*) as total_users,
  COUNT("theme") as users_with_theme,
  COUNT("headline") as users_with_headline,
  COUNT("displayName") as users_with_displayname,
  COUNT("auraIntensity") as users_with_auraintensity
FROM "AppUser";

-- Verify data integrity
SELECT 
  'theme' as column_name,
  COUNT(*) as total,
  COUNT(DISTINCT "theme") as unique_values
FROM "AppUser"
WHERE "theme" IS NOT NULL
UNION ALL
SELECT 
  'headline' as column_name,
  COUNT(*) as total,
  COUNT(DISTINCT "headline") as unique_values
FROM "AppUser"
WHERE "headline" IS NOT NULL
UNION ALL
SELECT 
  'displayName' as column_name,
  COUNT(*) as total,
  COUNT(DISTINCT "displayName") as unique_values
FROM "AppUser"
WHERE "displayName" IS NOT NULL;

-- Check indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'AppUser'
  AND indexname LIKE 'idx_appuser%'
ORDER BY indexname;
EOF

echo ""
echo "✅ Migration validation complete!"
echo ""
echo "📋 Next Steps:"
echo "   1. Update Prisma client: npx prisma generate"
echo "   2. Update API endpoints to use new columns instead of preferences JSON"
echo "   3. Test all functionality"
echo "   4. After verification, remove preferences column in future migration"
echo ""
echo "🎉 Migration successful!"




