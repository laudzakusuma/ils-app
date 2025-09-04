#!/bin/bash

echo "🚀 Building ILS Application..."

# Check for required environment variables
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found. Please create it from .env.example"
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Run type checking
echo "🔍 Running type checks..."
npm run type-check

# Run linting
echo "🧹 Running linter..."
npm run lint

# Generate Prisma client
echo "🗄️  Generating Prisma client..."
npx prisma generate

# Run tests
echo "🧪 Running tests..."
npm run test

# Build the application
echo "🏗️  Building application..."
npm run build

# Check build size
echo "📊 Analyzing bundle size..."
npm run analyze

echo "✅ Build completed successfully!"