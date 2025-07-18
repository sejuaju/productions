# Docker + Nginx Setup untuk ExtSwap Frontend

## Deskripsi
Konfigurasi ini memungkinkan Anda untuk menjalankan aplikasi Next.js ExtSwap dengan Nginx sebagai reverse proxy menggunakan Docker.

## Struktur File
- `Dockerfile` - Konfigurasi untuk build aplikasi Next.js
- `nginx.conf` - Konfigurasi Nginx dengan optimasi performa
- `docker-compose.yml` - Orkestrasi container Docker
- `.dockerignore` - File yang diabaikan saat build Docker

## Fitur Nginx
- ✅ Reverse proxy ke aplikasi Next.js
- ✅ Gzip compression untuk performa
- ✅ Static file caching
- ✅ Security headers
- ✅ Rate limiting untuk API routes
- ✅ Health check endpoint

## Cara Menjalankan

### 1. Build dan Jalankan dengan Docker Compose
```bash
# Build dan jalankan semua service
docker-compose up --build

# Jalankan di background
docker-compose up -d --build
```

### 2. Akses Aplikasi
- Aplikasi akan tersedia di: http://localhost
- Health check: http://localhost/health

### 3. Menghentikan Service
```bash
# Hentikan semua container
docker-compose down

# Hentikan dan hapus volume
docker-compose down -v
```

## Konfigurasi Environment

### File .env.local (Opsional)
Jika Anda memiliki environment variables, uncomment bagian `env_file` di `docker-compose.yml`:

```yaml
env_file:
  - .env.local
```

## Monitoring dan Logs

### Melihat Logs
```bash
# Logs semua service
docker-compose logs

# Logs service tertentu
docker-compose logs nginx
docker-compose logs nextjs

# Follow logs real-time
docker-compose logs -f
```

### Status Container
```bash
# Melihat status container
docker-compose ps

# Melihat resource usage
docker stats
```

## Optimasi Produksi

### SSL/HTTPS (Opsional)
Untuk mengaktifkan SSL, uncomment bagian SSL di `docker-compose.yml` dan tambahkan sertifikat SSL ke folder `./ssl/`.

### Custom Domain
Ubah `server_name` di `nginx.conf` dari `localhost` ke domain Anda.

### Environment Variables
Sesuaikan environment variables di `docker-compose.yml` sesuai kebutuhan produksi.

## Troubleshooting

### Container Tidak Bisa Start
```bash
# Periksa logs untuk error
docker-compose logs

# Rebuild tanpa cache
docker-compose build --no-cache
```

### Port Sudah Digunakan
Jika port 80 sudah digunakan, ubah port mapping di `docker-compose.yml`:
```yaml
ports:
  - "8080:80"  # Akses via localhost:8080
```

### Performance Issues
- Periksa resource usage dengan `docker stats`
- Sesuaikan worker_connections di `nginx.conf`
- Optimalkan Next.js build dengan environment variables

## Struktur Network
```
Internet → Nginx (Port 80) → Next.js App (Port 3000)
```

Nginx bertindak sebagai reverse proxy yang meneruskan request ke aplikasi Next.js dan menangani static file caching serta security headers.
