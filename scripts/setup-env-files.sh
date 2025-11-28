#!/bin/bash
# Setup script for environment files
# Creates .env.development and .env.production from examples

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$PROJECT_DIR"

echo "🔧 Setting up environment files..."
echo ""

# Create .env.development if it doesn't exist
if [ ! -f .env.development ]; then
    echo "Creating .env.development..."
    cat > .env.development << 'EOF'
# Development Environment Configuration
NODE_ENV=development
PORT=3001
HOST=0.0.0.0

# Required - Use development/test credentials
SESSION_SECRET=CHANGE_ME_DEVELOPMENT_SESSION_SECRET_MINIMUM_32_CHARACTERS
GOOGLE_CLIENT_ID=CHANGE_ME_DEV_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=CHANGE_ME_DEV_GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL=http://localhost:3001/auth/google/callback

# CORS - Development (more permissive for local testing)
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001,http://localhost:5173,http://216.238.91.120:3000

# Optional
SUPABASE_URL=
SUPABASE_ANON_KEY=
DEEPSEEK_API_KEY=
EOF
    echo "✅ Created .env.development"
    echo "⚠️  Please edit .env.development and fill in your development credentials"
else
    echo "✅ .env.development already exists"
fi

echo ""

# Create .env.production if it doesn't exist
if [ ! -f .env.production ]; then
    echo "Creating .env.production..."
    cat > .env.production << 'EOF'
# Production Environment Configuration
# ⚠️  WARNING: Use STRONG secrets for production!

NODE_ENV=production
PORT=3002
HOST=0.0.0.0

# Required - Use PRODUCTION credentials (STRONG SECRETS!)
# Generate a strong SESSION_SECRET: openssl rand -base64 64
SESSION_SECRET=CHANGE_ME_PRODUCTION_SESSION_SECRET_MINIMUM_64_CHARACTERS_USE_OPENSSL_RAND_BASE64_64
GOOGLE_CLIENT_ID=CHANGE_ME_PRODUCTION_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=CHANGE_ME_PRODUCTION_GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL=https://app.themetalayer.org/auth/google/callback

# CORS - Production (restrictive - only allow production domains)
ALLOWED_ORIGINS=https://app.themetalayer.org,https://themetalayer.org

# Optional
SUPABASE_URL=
SUPABASE_ANON_KEY=
DEEPSEEK_API_KEY=
EOF
    echo "✅ Created .env.production"
    echo "⚠️  Please edit .env.production and fill in your PRODUCTION credentials"
    echo "⚠️  Generate a strong SESSION_SECRET: openssl rand -base64 64"
else
    echo "✅ .env.production already exists"
fi

echo ""
echo "📋 Next steps:"
echo "1. Edit .env.development with your development credentials"
echo "2. Edit .env.production with your PRODUCTION credentials"
echo "3. Generate a strong SESSION_SECRET for production: openssl rand -base64 64"
echo "4. Start development: npm run pm2:start:dev"
echo "5. Start production: npm run pm2:start:prod"
echo ""
echo "📖 See DEPLOYMENT_GUIDE.md for detailed instructions"






