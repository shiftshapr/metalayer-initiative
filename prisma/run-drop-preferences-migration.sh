#!/bin/bash

# Script to drop the deprecated preferences column from AppUser table
# This should be run after verifying all data has been migrated to individual columns

set -e

echo "🔧 Running migration to drop preferences column..."

# Load DATABASE_URL from .env if not set
if [ -z "$DATABASE_URL" ]; then
  if [ -f .env ]; then
    export $(grep -v '^#' .env | grep DATABASE_URL | xargs)
  fi
fi

if [ -z "$DATABASE_URL" ]; then
  echo "❌ Error: DATABASE_URL environment variable is not set"
  echo "   Please set it in your environment or .env file"
  exit 1
fi

# Run the migration
echo "📋 Executing migration SQL..."
psql "$DATABASE_URL" -f prisma/migrations/20250128000000_drop_preferences_column/migration.sql

if [ $? -eq 0 ]; then
  echo "✅ Migration completed successfully"
  echo ""
  echo "📋 Next steps:"
  echo "   1. Regenerate Prisma client: npx prisma generate"
  echo "   2. Verify the column has been removed"
  echo "   3. Update any code that references the preferences column"
else
  echo "❌ Migration failed"
  exit 1
fi




