#!/bin/bash
# Generate a secure SESSION_SECRET for Canopi
# Usage: ./generate-session-secret.sh

echo "Generating secure SESSION_SECRET..."
echo ""

# Method 1: Using OpenSSL (recommended)
if command -v openssl &> /dev/null; then
    SECRET=$(openssl rand -base64 32)
    echo "✅ Generated using OpenSSL:"
    echo "SESSION_SECRET=$SECRET"
    echo ""
fi

# Method 2: Using Node.js
if command -v node &> /dev/null; then
    SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
    echo "✅ Generated using Node.js:"
    echo "SESSION_SECRET=$SECRET"
    echo ""
fi

# Method 3: Using Python
if command -v python3 &> /dev/null; then
    SECRET=$(python3 -c "import secrets; print(secrets.token_urlsafe(32))")
    echo "✅ Generated using Python:"
    echo "SESSION_SECRET=$SECRET"
    echo ""
fi

echo ""
echo "📝 Add this to your .env file:"
echo "SESSION_SECRET=<generated-secret-above>"
echo ""
echo "⚠️  IMPORTANT:"
echo "   - Keep this secret secure and never commit it to git"
echo "   - Use different secrets for development and production"
echo "   - Each developer can have their own for local development"

