#!/bin/bash

# 🚀 Quick Update Script untuk ExtSwap
# Usage: ./quick-update.sh "commit message"

set -e

echo "🔄 ExtSwap Quick Update Script"
echo "================================"

# Check if commit message provided
if [ -z "$1" ]; then
    echo "❌ Error: Please provide commit message"
    echo "Usage: ./quick-update.sh 'your commit message'"
    exit 1
fi

COMMIT_MSG="$1"

echo "📋 Checking git status..."
git status

echo ""
echo "📦 Adding all changes..."
git add .

echo ""
echo "💾 Committing changes..."
git commit -m "$COMMIT_MSG"

echo ""
echo "🚀 Pushing to GitHub..."
git push origin main

echo ""
echo "🐳 Rebuilding production containers..."
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up --build -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 15

echo ""
echo "🏥 Health check..."
if curl -f -s https://extswap.exatech.ai/health > /dev/null; then
    echo "✅ Application is healthy!"
    echo "🌐 Live at: https://extswap.exatech.ai"
else
    echo "⚠️  Health check failed, but containers are running"
    echo "📊 Check container status:"
    docker compose -f docker-compose.prod.yml ps
fi

echo ""
echo "🎉 Update completed successfully!"
echo "📱 GitHub: https://github.com/sejuaju/productions"
echo "🌐 Live: https://extswap.exatech.ai"
