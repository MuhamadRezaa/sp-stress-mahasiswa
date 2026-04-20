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
# FLASK_ENV dan FLASK_DEBUG TIDAK perlu diubah
# — akan otomatis di-override oleh docker-compose.prod.yml

# CORS: ubah sesuai URL frontend di environment prod
# CORS_ALLOWED_ORIGINS=http://localhost:5173   # nonaktifkan ini
CORS_ALLOWED_ORIGINS=http://localhost          # aktifkan ini (prod lokal)
# CORS_ALLOWED_ORIGINS=https://domain-anda.com  # untuk server sungguhan
```

### 2. Jalankan

> ⚠️ **Selalu gunakan `--build`** saat ganti mode karena image Docker berubah.

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

### 3. Akses

| Layanan  | URL                       |
|----------|---------------------------|
| Frontend | http://localhost *(port 80)* |
| Backend  | http://localhost:5000     |
| Database | localhost:3307 (MySQL)    |

### Karakteristik Prod Mode

| Aspek          | Kondisi                                   |
|----------------|-------------------------------------------|
| Backend server | `gunicorn` (4 workers paralel)            |
| Frontend       | Nginx melayani file hasil `npm run build` |
| Debug          | ❌ Mati (error tidak tampil ke pengguna)  |
| Hot-reload     | ❌ Tidak ada                              |
| Source code    | Di-*bake* ke dalam image                 |

---

## Ringkasan Perintah

```bash
# ── Development ───────────────────────────────────────────
# Jalankan (pertama kali / setelah ubah dependencies)
docker compose up -d --build

# Jalankan (tanpa ubah dependencies)
docker compose down && docker compose up -d

# Hentikan
docker compose down

# ── Production ────────────────────────────────────────────
# Jalankan (selalu --build saat ganti mode)
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build

# Hentikan
docker compose down

# ── Utilitas ─────────────────────────────────────────────
# Cek status container
docker compose ps

# Lihat log backend
docker compose logs backend --tail=30 -f

# Verifikasi env yang aktif di container
docker compose exec backend env | grep -E "FLASK|CORS"
```

---

## Checklist Ganti Mode Dev → Prod

- [ ] Di `.env`: ganti `CORS_ALLOWED_ORIGINS` ke `http://localhost` (atau domain server)
- [ ] Jalankan dengan flag `-f docker-compose.prod.yml`
- [ ] Selalu tambahkan `--build`
- [ ] Akses via `http://localhost` (bukan `:5173`)

## Checklist Ganti Mode Prod → Dev

- [ ] Di `.env`: ganti `CORS_ALLOWED_ORIGINS` kembali ke `http://localhost:5173`
- [ ] Jalankan **tanpa** flag `-f docker-compose.prod.yml`
- [ ] Selalu tambahkan `--build`
- [ ] Akses via `http://localhost:5173`

---

## Aturan Kapan Perlu `--build`

| Situasi                                          | Perlu `--build`? |
|--------------------------------------------------|:----------------:|
| Ganti mode dev ↔ prod                           | ✅ Ya            |
| Ubah `requirements.txt` atau `package.json`      | ✅ Ya            |
| Ubah `Dockerfile`                                | ✅ Ya            |
| Ubah kode Python / TypeScript (mode dev)         | ❌ Tidak         |
| Ubah nilai `.env`                                | ❌ Tidak (cukup `down` + `up`) |

---

## Deployment ke Server (Produksi Nyata)

1. Salin seluruh project ke server
2. Buat file `.env` di server (jangan di-commit ke git!)
3. Isi nilai produksi yang sesuai:
   ```ini
   CORS_ALLOWED_ORIGINS=https://domain-anda.com
   VITE_API_BASE_URL=https://domain-anda.com:5000
   SECRET_KEY=<string acak 64 karakter>
   JWT_SECRET_KEY=<string acak 64 karakter>
   MYSQL_ROOT_PASSWORD=<password kuat>
   MYSQL_PASSWORD=<password kuat>
   ```
4. Generate secret key:
   ```bash
   python3 -c "import secrets; print(secrets.token_hex(32))"
   ```
5. Jalankan mode production:
   ```bash
   docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d --build
   ```

---

## Setup HTTPS (SSL) di VPS

Secara bawaan, konfigurasi Docker yang kita buat menggunakan protokol **HTTP** (port 80 untuk frontend dan port 5000 untuk backend). HTTPS **belum** disetup di dalam Docker.

Ini adalah praktik terbaik (Best Practice). Mengapa? Karena manajemen sertifikat SSL lebih baik dilakukan di level server host menggunakan **Reverse Proxy** (seperti Nginx di host server atau Caddy), bukan di dalam container Docker.

### Cara Menambahkan HTTPS (Rekomendasi)

Gunakan **Nginx di server VPS Anda** (di luar Docker) dan **Certbot** (Let's Encrypt).

1.  **Install Nginx dan Certbot di VPS:**
    ```bash
    sudo apt update
    sudo apt install nginx certbot python3-certbot-nginx
    ```

2.  **Buat file konfigurasi Nginx baru untuk domain Anda:**
    ```bash
    sudo nano /etc/nginx/sites-available/stresspresso
    ```

    Isi file tersebut dengan salah satu konfigurasi di bawah ini, tergantung opsi mana yang Anda pilih di `.env`.

    **Konfigurasi untuk Opsi A (Menggunakan port 5000 langsung)**
    *(⚠️ Peringatan: Sangat tidak direkomendasikan. Certbot Nginx biasanya hanya mengonfigurasi SSL/HTTPS untuk port default 443. Jika Anda memakai ini, Anda harus mengatur sertifikat SSL manual untuk port 5000, jika tidak akan terjadi error Mixed Content).*
    ```nginx
    server {
        listen 80;
        server_name domain-anda.com www.domain-anda.com;

        # Frontend saja
        location / {
            proxy_pass http://localhost:80;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
    # Backend tidak diatur oleh Nginx, melainkan diakses langsung via port 5000 (harus open port di firewall).
    ```

    **ATAU - Konfigurasi untuk Opsi B (Rekomendasi: Subdomain terpisah `api.domain.com`)**
    ```nginx
    # 1. Block untuk Frontend (https://domain-anda.com)
    server {
        listen 80;
        server_name domain-anda.com www.domain-anda.com;

        location / {
            proxy_pass http://localhost:80; # Nginx melempar ke port 80 Docker Frontend
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }

    # 2. Block untuk Backend API (https://api.domain-anda.com)
    server {
        listen 80;
        server_name api.domain-anda.com;

        location / {
            proxy_pass http://localhost:5000; # Nginx melempar ke port 5000 Docker Backend
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
    ```

    **ATAU - Konfigurasi untuk Opsi C (Satu domain dengan path `/api/`)**
    ```nginx
    server {
        listen 80;
        server_name domain-anda.com www.domain-anda.com;

        # Frontend dilayani di root path (/)
        location / {
            proxy_pass http://localhost:80;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }

        # Backend dilayani di path (/api/)
        location /api/ {
            proxy_pass http://localhost:5000/; # Slash di akhir sangat penting!
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
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
