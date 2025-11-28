#!/bin/bash
# Compile Tab Manager TypeScript files to JavaScript

SOURCE_DIR="/home/ubuntu/canopi/presence/extension/features/TabManager"
TARGET_DIR="/home/ubuntu/canopi/public/tab-manager-test"

echo "🔧 Compiling Tab Manager TypeScript files..."

# Check if TypeScript is available
if ! command -v tsc &> /dev/null; then
    echo "❌ TypeScript compiler (tsc) not found."
    echo "   Install with: npm install -g typescript"
    echo "   Or use: npx tsc"
    exit 1
fi

# Create temporary tsconfig for compilation
cd "$SOURCE_DIR"
cat > tsconfig.temp.json << 'EOF'
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "ES2020",
    "moduleResolution": "node",
    "lib": ["ES2020", "DOM"],
    "outDir": "./",
    "rootDir": "./",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "declaration": false
  },
  "include": ["*.ts"],
  "exclude": ["node_modules", "*.test.ts"]
}
EOF

# Compile TypeScript files
echo "📦 Compiling..."
tsc --project tsconfig.temp.json

# Check if compilation was successful
if [ $? -eq 0 ]; then
    echo "✅ Compilation successful!"
    
    # Copy compiled JS files and CSS to target directory
    echo "📋 Copying files..."
    cp *.js "$TARGET_DIR/" 2>/dev/null || true
    cp tab-manager.css "$TARGET_DIR/" 2>/dev/null || true
    
    # Clean up temp config
    rm -f tsconfig.temp.json
    
    echo "✅ Files copied to $TARGET_DIR"
    echo ""
    echo "🌐 Test page available at: https://share.canopi.live/tab-manager-test/"
else
    echo "❌ Compilation failed!"
    rm -f tsconfig.temp.json
    exit 1
fi





