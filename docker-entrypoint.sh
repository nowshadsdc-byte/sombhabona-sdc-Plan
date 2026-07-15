#!/bin/sh
set -e

echo "⏳ Waiting for MySQL to be ready..."
sleep 5

echo "🔄 Generating Prisma client..."
node node_modules/.bin/prisma generate

echo "🔄 Pushing Prisma schema to database..."
node node_modules/.bin/prisma db push

echo "🌱 Seeding database..."
npx tsx prisma/seed.ts

echo "🚀 Starting application..."
exec su -s /bin/sh nextjs -c "node server.js"
