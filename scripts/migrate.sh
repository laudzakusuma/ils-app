#!/bin/bash

echo "🗄️  Running database migrations..."

# Check if database is accessible
echo "🔍 Checking database connectivity..."
npx prisma db pull --preview-feature || {
    echo "❌ Cannot connect to database"
    exit 1
}

# Generate and apply migrations
echo "📝 Generating migration..."
npx prisma migrate dev --name "$(date +%Y%m%d_%H%M%S)_migration"

# Push schema to database
echo "🚀 Pushing schema to database..."
npx prisma db push

# Seed database if needed
if [ "$1" = "--seed" ]; then
    echo "🌱 Seeding database..."
    npx prisma db seed
fi

echo "✅ Database migration completed!"