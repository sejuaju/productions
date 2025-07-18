#!/bin/bash

# 🔍 Monitor & Auto-Rollback Script untuk ExtSwap
# Usage: ./monitor-and-rollback.sh

set -e

echo "🔍 ExtSwap Health Monitor & Auto-Rollback"
echo "========================================="

HEALTH_URL="https://extswap.exatech.ai/health"
API_URL="https://extswap.exatech.ai/api/v1/tokens?limit=1"
WS_TEST_URL="wss://extswap.exatech.ai/ws"

echo "🏥 Checking application health..."

# Check main health endpoint
echo "1. Testing health endpoint..."
HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $HEALTH_STATUS -eq 200 ]; then
    echo "   ✅ Health endpoint: OK ($HEALTH_STATUS)"
else
    echo "   ❌ Health endpoint: FAILED ($HEALTH_STATUS)"
    HEALTH_FAILED=true
fi

# Check API endpoint
echo "2. Testing API endpoint..."
API_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $API_URL)

if [ $API_STATUS -eq 200 ]; then
    echo "   ✅ API endpoint: OK ($API_STATUS)"
else
    echo "   ❌ API endpoint: FAILED ($API_STATUS)"
    API_FAILED=true
fi

# Check container status
echo "3. Checking container status..."
CONTAINERS_UP=$(docker compose -f docker-compose.prod.yml ps --services --filter "status=running" | wc -l)
TOTAL_CONTAINERS=$(docker compose -f docker-compose.prod.yml ps --services | wc -l)

if [ $CONTAINERS_UP -eq $TOTAL_CONTAINERS ]; then
    echo "   ✅ Containers: All running ($CONTAINERS_UP/$TOTAL_CONTAINERS)"
else
    echo "   ❌ Containers: Some down ($CONTAINERS_UP/$TOTAL_CONTAINERS)"
    CONTAINERS_FAILED=true
fi

# Check SSL certificate
echo "4. Checking SSL certificate..."
SSL_DAYS=$(echo | openssl s_client -servername extswap.exatech.ai -connect extswap.exatech.ai:443 2>/dev/null | openssl x509 -noout -dates | grep notAfter | cut -d= -f2)
echo "   ℹ️  SSL expires: $SSL_DAYS"

# Decision logic
if [ "$HEALTH_FAILED" = true ] || [ "$API_FAILED" = true ] || [ "$CONTAINERS_FAILED" = true ]; then
    echo ""
    echo "🚨 CRITICAL: Application is unhealthy!"
    echo "🔄 Initiating automatic rollback..."
    
    # Get last working commit
    LAST_COMMIT=$(git log --oneline -n 2 | tail -n 1 | cut -d' ' -f1)
    echo "📝 Rolling back to: $LAST_COMMIT"
    
    # Rollback
    git revert HEAD --no-edit
    docker compose -f docker-compose.prod.yml down
    docker compose -f docker-compose.prod.yml up --build -d
    
    echo "⏳ Waiting for rollback to complete..."
    sleep 30
    
    # Test rollback
    ROLLBACK_STATUS=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)
    if [ $ROLLBACK_STATUS -eq 200 ]; then
        echo "✅ Rollback successful! Application is healthy again."
        
        # Push rollback to GitHub
        git push origin main
        echo "📤 Rollback pushed to GitHub"
        
        # Send notification (optional)
        echo "📧 Notification: Automatic rollback completed successfully"
    else
        echo "❌ Rollback failed! Manual intervention required."
        echo "🆘 Emergency contacts should be notified immediately."
        exit 1
    fi
else
    echo ""
    echo "🎉 All systems are healthy!"
    echo "🌐 Application: https://extswap.exatech.ai"
    echo "📊 GitHub: https://github.com/sejuaju/productions"
    echo "📈 Status: All services operational"
fi

echo ""
echo "📊 System Summary:"
echo "=================="
docker compose -f docker-compose.prod.yml ps
echo ""
echo "💾 Disk usage:"
df -h /home/shole/extswap-frontend
echo ""
echo "🐳 Docker images:"
docker images | grep extswap
