#!/bin/bash

# Script untuk setup SSL dengan Let's Encrypt untuk extswap.exatech.ai

echo "🔧 Setting up SSL for extswap.exatech.ai..."

# Install certbot jika belum ada
if ! command -v certbot &> /dev/null; then
    echo "📦 Installing certbot..."
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
fi

# Stop nginx container sementara untuk mendapatkan sertifikat
echo "⏸️  Stopping nginx container..."
docker compose stop nginx

# Dapatkan sertifikat SSL
echo "🔐 Obtaining SSL certificate..."
sudo certbot certonly --standalone \
    --preferred-challenges http \
    -d extswap.exatech.ai \
    --email admin@exatech.ai \
    --agree-tos \
    --non-interactive

# Buat direktori SSL untuk Docker
echo "📁 Creating SSL directory..."
mkdir -p ./ssl

# Copy sertifikat ke direktori project
echo "📋 Copying SSL certificates..."
sudo cp /etc/letsencrypt/live/extswap.exatech.ai/fullchain.pem ./ssl/
sudo cp /etc/letsencrypt/live/extswap.exatech.ai/privkey.pem ./ssl/
sudo chown $USER:$USER ./ssl/*.pem

# Update docker-compose untuk menggunakan SSL
echo "🔄 Updating docker-compose for SSL..."
cp docker-compose.yml docker-compose-backup.yml

# Restart dengan konfigurasi SSL
echo "🚀 Starting with SSL configuration..."
docker compose up -d

echo "✅ SSL setup completed!"
echo "🌐 Your application is now available at: https://extswap.exatech.ai"
echo "🔒 HTTP traffic will be automatically redirected to HTTPS"
