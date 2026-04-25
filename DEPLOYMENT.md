# Panduan Deployment — Stresspresso

Dokumen ini menjelaskan cara menjalankan aplikasi dalam mode **Development** dan **Production**, baik di lokal maupun di server.

---

## Prasyarat

- Docker & Docker Compose terinstall
- File `.env` sudah dikonfigurasi (salin dari `.env.example`)

---

## Mode Development (Lokal)

Digunakan saat proses pengembangan. Mendukung **hot-reload** — perubahan kode langsung terlihat tanpa rebuild.

### 1. Atur `.env`

```ini
FLASK_ENV=development
FLASK_DEBUG=1
CORS_ALLOWED_ORIGINS=http://localhost:5173   # aktifkan ini
# CORS_ALLOWED_ORIGINS=http://localhost      # nonaktifkan ini
```

### 2. Jalankan

```bash
# Pertama kali atau setelah ganti Dockerfile / requirements.txt / package.json
docker compose up -d --build

# Berikutnya (tanpa perubahan dependencies)
docker compose down && docker compose up -d
```

### 3. Akses

| Layanan  | URL                      |
|----------|--------------------------|
| Frontend | http://localhost:5173    |
| Backend  | http://localhost:5000    |
| Database | localhost:3307 (MySQL)   |

### Karakteristik Dev Mode

| Aspek          | Kondisi                            |
|----------------|------------------------------------|
| Backend server | `flask run` (1 proses)             |
| Frontend       | Vite dev server (hot-reload)       |
| Debug          | ✅ Aktif (stack trace tampil)      |
| Source code    | Di-mount via volume (bisa edit langsung) |

---

## Mode Production (Lokal / Server)

Digunakan untuk pengujian akhir atau deployment ke server sungguhan. Frontend di-*build* menjadi file statis yang dilayani oleh **Nginx**, backend menggunakan **Gunicorn**.

### 1. Atur `.env`

```ini
# Gunakan /api agar Nginx bisa mengarahkan trafik dengan benar
VITE_API_BASE_URL=/api
CORS_ALLOWED_ORIGINS=https://domain-anda.com  # URL frontend Anda
```

### 2. Jalankan

> ⚠️ **Selalu gunakan `--build`** saat pertama kali deploy atau saat ada perubahan kode.

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### 3. Akses

| Layanan  | URL                       |
|----------|---------------------------|
| Frontend | http://localhost (port 80) |
| Backend  | http://localhost/api      |

---

## Setup Nginx di VPS (Reverse Proxy & SSL)

Gunakan **Nginx di server VPS Anda** (di luar Docker) untuk menangani HTTPS dan meneruskan trafik ke Docker.

1.  **Konfigurasi Nginx (Rekomendasi: Satu domain dengan path `/api/`)**
    ```nginx
    server {
        listen 80;
        server_name domain-anda.com www.domain-anda.com;

        # Frontend & API (Semua dilempar ke port 80 Docker Frontend)
        # Nginx di dalam Docker Frontend yang akan membagi ke / dan /api
        location / {
            proxy_pass http://localhost:80; 
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
    ```

2.  **Aktifkan SSL dengan Certbot:**
    ```bash
    sudo certbot --nginx -d domain-anda.com -d www.domain-anda.com
    ```

3.  **Aktifkan konfigurasi Nginx:**
    ```bash
    sudo ln -s /etc/nginx/sites-available/stresspresso /etc/nginx/sites-enabled/
    sudo nginx -t
    sudo systemctl reload nginx
    ```

4.  **Dapatkan sertifikat SSL Gratis dengan Certbot:**
    ```bash
    sudo certbot --nginx -d domain-anda.com -d www.domain-anda.com -d api.domain-anda.com
    ```
    *Certbot akan secara otomatis mengedit file konfigurasi Nginx Anda untuk menambahkan SSL (mengubah `listen 80` menjadi `listen 443 ssl` dan menambahkan baris sertifikat).*

### Penting Terkait Backend (Mixed Content)

Jika frontend Anda dilayani melalui HTTPS (`https://domain-anda.com`), browser **tidak akan mengizinkan** request AJAX/fetch ke backend yang menggunakan HTTP biasa (`http://domain-anda.com:5000`). Ini disebut error *Mixed Content*.

Oleh karena itu, di VPS produksi:
1.  **Jangan** akses port 5000 Docker secara langsung dari internet.
2.  Gunakan Nginx host sebagai perantara (Reverse Proxy) yang memiliki SSL, lalu Nginx yang meneruskan ke localhost:5000 Docker (seperti contoh konfigurasi Nginx nomor 2 di atas).
3.  Pastikan `VITE_API_BASE_URL` di `.env` frontend mengarah ke URL Nginx yang sudah HTTPS (misalnya `https://api.domain-anda.com`).
---

## Menjalankan Multiple Environment di Satu VPS (Prod & Dev)

Jika Anda ingin menjalankan versi **Production** dan **Development/Testing** sekaligus di satu VPS yang sama, ikuti aturan pemisahan ini agar tidak terjadi konflik.

### 1. Gunakan Folder Berbeda
Lakukan clone ke folder yang berbeda:
-   `/home/reza/sp-stress-mahasiswa` (Produksi)
-   `/home/reza/sp-stress-mahasiswa-dev` (Development)

### 2. Atur Identitas Berbeda di `.env`
Di dalam folder **Dev**, edit file `.env` dan pastikan nilai-nilai berikut **BERBEDA** dengan versi produksi:

```ini
# 1. Berikan nama project berbeda agar container tidak saling timpa
COMPOSE_PROJECT_NAME=spsm_dev

# 2. Gunakan database yang berbeda
MYSQL_DATABASE=stress_db_dev

# 3. Sesuaikan URL Subdomain Dev
CORS_ALLOWED_ORIGINS=https://dev.domain-anda.com
VITE_API_BASE_URL=https://api-dev.domain-anda.com
```

### 3. Sesuaikan Port Host (Penting!)
Agar port Docker tidak bentrok, Anda bisa mengubah port host di `docker-compose.yml` versi Dev atau menggunakan file override.

Contoh sederhana, ubah port di `docker-compose.yml` folder Dev:
-   Backend: `5001:5000` (Port 5001 host mengarah ke 5000 container)
-   Frontend: `8080:80` (Port 8080 host mengarah ke 80 container)

### 4. Konfigurasi Nginx VPS
Buat file konfigurasi Nginx baru (misal: `/etc/nginx/sites-available/stresspresso-dev`) yang mengarah ke port Dev tersebut:

```nginx
server {
    listen 80;
    server_name dev.domain-anda.com;

    location / {
        proxy_pass http://localhost:8080; # Mengarah ke port frontend Dev
        ...
    }
}

server {
    listen 80;
    server_name api-dev.domain-anda.com;

    location / {
        proxy_pass http://localhost:5001; # Mengarah ke port backend Dev
        ...
    }
}
```

### 5. Sinkronisasi Data (Salin dari Prod ke Dev)
Jika Anda ingin menyalin data asli dari database produksi ke database pengembangan (untuk keperluan testing dengan data nyata):

```bash
docker compose exec db mysqldump -u spsm_user -pspsm_password stress_db | docker compose exec -T db mysql -u spsm_user -pspsm_password stress_db_dev
```

---

## Tips Pemeliharaan (Maintenance)

### Cara Update Kode di VPS
Setiap kali Anda melakukan perubahan di lokal dan sudah dipush ke Git:

1. Masuk ke folder project di VPS.
2. Tarik kode terbaru: `git pull origin main`.
3. Build ulang image:
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
   ```
4. Jika ada perubahan model database, jalankan migrasi:
   ```bash
   docker compose exec backend flask db upgrade
   ```

### Melihat Log (Untuk Debugging)
Jika aplikasi error (500 Internal Server Error), cek log backend:
```bash
docker compose logs backend --tail=50 -f
```
