# 🔄 Guide Update Proyek ke GitHub

## 1. Manual Update (Cara Tradisional)

### Langkah-langkah Update Manual:

```bash
# 1. Cek status perubahan
git status

# 2. Add file yang berubah
git add .
# atau add file spesifik
git add src/components/NewComponent.tsx

# 3. Commit dengan pesan yang jelas
git commit -m "feat: Add new trading feature with price alerts"

# 4. Push ke GitHub
git push origin main
```

### Template Commit Messages:
- `feat: Add new feature` - Fitur baru
- `fix: Fix bug in swap calculation` - Perbaikan bug
- `update: Update API endpoints` - Update konfigurasi
- `docs: Update documentation` - Update dokumentasi
- `style: Improve UI/UX design` - Perubahan tampilan
- `refactor: Optimize code structure` - Refactoring code

---

## 2. Automated Update dengan GitHub Actions

### Setup CI/CD Pipeline untuk Auto-Deploy:

```yaml
# .github/workflows/deploy.yml
name: Auto Deploy to Production

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build application
      run: npm run build
    
    - name: Deploy to VPS
      uses: appleboy/ssh-action@v0.1.5
      with:
        host: ${{ secrets.VPS_HOST }}
        username: ${{ secrets.VPS_USER }}
        key: ${{ secrets.VPS_SSH_KEY }}
        script: |
          cd /home/shole/extswap-frontend
          git pull origin main
          docker compose -f docker-compose.prod.yml down
          docker compose -f docker-compose.prod.yml up --build -d
```

---

## 3. Git Hooks untuk Auto-Update

### Pre-commit Hook (Validasi sebelum commit):

```bash
#!/bin/sh
# .git/hooks/pre-commit

# Run tests
npm test

# Run linting
npm run lint

# Build check
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Tests, linting, or build failed. Commit aborted."
  exit 1
fi

echo "✅ All checks passed. Proceeding with commit."
```

### Post-receive Hook (Auto-deploy setelah push):

```bash
#!/bin/sh
# hooks/post-receive

cd /home/shole/extswap-frontend
git --git-dir=.git --work-tree=. checkout -f main

# Rebuild and restart containers
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up --build -d

echo "✅ Auto-deployment completed!"
```

---

## 4. Webhook Integration

### Setup Webhook untuk Auto-Deploy:

```javascript
// webhook-server.js
const express = require('express');
const { exec } = require('child_process');
const crypto = require('crypto');

const app = express();
app.use(express.json());

app.post('/webhook', (req, res) => {
  const signature = req.headers['x-hub-signature-256'];
  const payload = JSON.stringify(req.body);
  
  // Verify GitHub webhook signature
  const hmac = crypto.createHmac('sha256', process.env.WEBHOOK_SECRET);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  
  if (signature === digest && req.body.ref === 'refs/heads/main') {
    console.log('🚀 Deploying latest changes...');
    
    exec('cd /home/shole/extswap-frontend && git pull && docker compose -f docker-compose.prod.yml up --build -d', 
      (error, stdout, stderr) => {
        if (error) {
          console.error('❌ Deployment failed:', error);
          return res.status(500).send('Deployment failed');
        }
        console.log('✅ Deployment successful:', stdout);
        res.status(200).send('Deployment successful');
      }
    );
  } else {
    res.status(400).send('Invalid signature or branch');
  }
});

app.listen(3001, () => {
  console.log('🎣 Webhook server listening on port 3001');
});
```

---

## 5. Development Workflow Best Practices

### Branch Strategy:
```bash
# Create feature branch
git checkout -b feature/new-trading-pair

# Make changes and commit
git add .
git commit -m "feat: Add USDT/tEXT trading pair"

# Push feature branch
git push origin feature/new-trading-pair

# Create Pull Request di GitHub
# Setelah review, merge ke main branch
```

### Environment-specific Updates:
```bash
# Development
git checkout development
git pull origin development
docker compose up --build

# Staging
git checkout staging
git pull origin staging
docker compose -f docker-compose.staging.yml up --build -d

# Production
git checkout main
git pull origin main
docker compose -f docker-compose.prod.yml up --build -d
```

---

## 6. Monitoring & Rollback

### Health Check Script:
```bash
#!/bin/bash
# health-check.sh

HEALTH_URL="https://extswap.exatech.ai/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $HEALTH_URL)

if [ $RESPONSE -eq 200 ]; then
    echo "✅ Application is healthy"
else
    echo "❌ Application is down, rolling back..."
    git revert HEAD
    docker compose -f docker-compose.prod.yml up --build -d
fi
```

### Quick Rollback:
```bash
# Rollback to previous commit
git revert HEAD
git push origin main

# Rollback to specific commit
git revert <commit-hash>
git push origin main

# Emergency rollback
docker compose -f docker-compose.prod.yml down
git reset --hard HEAD~1
docker compose -f docker-compose.prod.yml up --build -d
```

---

## 7. Automated Testing Pipeline

### Test Before Deploy:
```yaml
# .github/workflows/test.yml
name: Test Suite

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    - uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - run: npm ci
    - run: npm run test
    - run: npm run lint
    - run: npm run build
    
    - name: Docker Build Test
      run: docker build -t extswap-test .
```

---

## 🎯 Quick Commands Reference

```bash
# Quick update workflow
git add . && git commit -m "update: Quick fixes" && git push

# Check deployment status
docker compose -f docker-compose.prod.yml ps

# View logs
docker compose -f docker-compose.prod.yml logs -f

# Restart services
docker compose -f docker-compose.prod.yml restart

# Full rebuild
docker compose -f docker-compose.prod.yml down && docker compose -f docker-compose.prod.yml up --build -d
```

---

## 🚀 Recommended Workflow

1. **Development**: Manual commits dengan testing
2. **Staging**: Automated deployment via GitHub Actions
3. **Production**: Manual deployment dengan approval process
4. **Monitoring**: Automated health checks dan alerts
5. **Rollback**: Quick rollback procedures untuk emergency

Pilih metode yang sesuai dengan kebutuhan dan tingkat otomasi yang Anda inginkan!
