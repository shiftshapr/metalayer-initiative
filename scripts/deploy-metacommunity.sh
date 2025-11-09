#!/bin/bash

# Deployment script for MetaCommunity implementation
# Run with: bash scripts/deploy-metacommunity.sh

set -e  # Exit on error

echo "🚀 Starting MetaCommunity deployment..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL environment variable not set"
    exit 1
fi

# Step 1: Backup database (if backup tool available)
echo "📦 Step 1: Creating database backup..."
# TODO: Add actual backup command based on your database setup
# pg_dump $DATABASE_URL > backup_$(date +%Y%m%d_%H%M%S).sql

# Step 2: Run Prisma migration
echo "📝 Step 2: Running Prisma migration..."
cd /home/ubuntu/metalayer-initiative
npx prisma migrate dev --name add_metacommunity --create-only

# Step 3: Review migration (optional - uncomment to review)
# echo "📋 Migration file created. Review before proceeding?"
# read -p "Press enter to continue or Ctrl+C to abort"

# Step 4: Apply migration
echo "✅ Step 3: Applying migration..."
npx prisma migrate deploy

# Step 5: Generate Prisma client
echo "🔧 Step 4: Generating Prisma client..."
npx prisma generate

# Step 6: Run data migration
echo "📊 Step 5: Running data migration..."
node scripts/migrate-communities-to-metacommunity.js

# Step 7: Run tests
echo "🧪 Step 6: Running tests..."
node tests/test-metacommunity.js

if [ $? -eq 0 ]; then
    echo "✅ All tests passed!"
else
    echo "❌ Tests failed. Please review before proceeding."
    exit 1
fi

# Step 8: Restart services (uncomment based on your setup)
echo "🔄 Step 7: Restarting services..."
# pm2 restart canopi2-server
# or
# systemctl restart canopi
# or
# pkill -f "node.*canopi2-server" && node canopi2-server.js &

echo "✅ Deployment complete!"
echo ""
echo "📋 Post-deployment checklist:"
echo "   [ ] Verify API endpoints return correct data"
echo "   [ ] Check frontend displays communities correctly"
echo "   [ ] Monitor logs for errors"
echo "   [ ] Check database performance"






