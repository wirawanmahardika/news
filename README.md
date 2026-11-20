# ABNews — Portal Berita & Studio Redaksi

Rewrite modern dari sistem legacy `news-admin` dan `news-sse` ke dalam satu aplikasi **Next.js** terintegrasi di folder `news/`.

## Teknologi

- **Framework**: Next.js 16 (App Router + Cache Components + Turbopack) & React 19
- **UI**: Tailwind CSS v4 + **DaisyUI v5** (tema `light` dan `dark` dengan switcher anti-flash)
- **Database & ORM**: PostgreSQL 17 + **Drizzle ORM RC** (`drizzle-orm@1.0.0-rc.5`) & **Drizzle Kit RC** (`drizzle-kit@1.0.0-rc.5`)
- **Autentikasi**: JWT Session Cookie (`jose`) + hashing password (`bcryptjs`)
- **Runtime & Container**: Bun & Docker / Docker Compose

## Fitur Utama

### Portal Berita Publik
- **Beranda (`/`)**: Ticker berita terkini, Hero Sorotan Utama, showcase kategori beserta jumlah artikel, serta daftar berita terbaru & terpopuler.
- **Pembaca Artikel (`/news/[id]`)**: Progress bar membaca, pengatur ukuran teks, bookmark (`localStorage`), tombol bagikan, penghitung tayangan (`views`), dan berita terkait.
- **Kategori (`/category/[id]`)**: Filter berita berdasarkan kategori dengan pengurutan terbaru/terpopuler dan pagination.
- **Pencarian (`/search` & `Ctrl+K`)**: Pencarian judul/konten (case-insensitive `ilike`) dengan filter kategori dan pengurutan.
- **Berita Tersimpan (`/bookmarks`)**: Daftar bacaan tersimpan di perangkat pengguna.

### Editorial Admin Studio (`/admin`)
- **Login & Setup Awal (`/admin/login`)**: Jika tabel `users` masih kosong, halaman login otomatis menampilkan form pembuatan akun admin pertama.
- **Dashboard Analytics (`/admin`)**: Statistik total berita (published/draft), total kategori, total tayangan, daftar artikel terpopuler, dan distribusi kategori.
- **Kelola Berita (`/admin/news`)**: Pencarian, filter kategori & status, hapus massal (*bulk delete*), dan konfirmasi modal.
- **Editor Berita (`/admin/news/new`, `/admin/news/[id]/edit`)**: Tab *Tulis* & *Pratinjau Langsung*, toolbar heading/kutipan, ringkasan otomatis, toggle Sorotan Utama, status `published`/`draft`, serta pratinjau unggah gambar.
- **Kelola Kategori (`/admin/categories`)**: CRUD kategori dengan gambar sampul dan deskripsi.

## Menjalankan dengan Docker & PostgreSQL

Semua konfigurasi Docker dan aplikasi berada di dalam folder `news/`:

```bash
cd news
docker compose up -d --build
```

Port host PostgreSQL default dipetakan ke `55432` (dapat diubah melalui environment variable `POSTGRES_PORT`, sedangkan komunikasi internal antar container tetap menggunakan port `5432`).

Push skema database ke PostgreSQL container:

```bash
cd news
DATABASE_URL="postgresql://abnews:abnews_secret@localhost:55432/abnews" bun run db:push
```

Aplikasi dapat diakses di:
- **Portal Publik**: `http://localhost:3000`
- **Admin Studio**: `http://localhost:3000/admin`

## Menjalankan Mode Development Lokal

1. Salin file contoh environment:
   ```bash
   cd news
   cp .env.example .env
   ```
2. Jalankan hanya container PostgreSQL:
   ```bash
   docker compose up -d postgres
   ```
3. Push skema Drizzle dan jalankan dev server:
   ```bash
   bun run db:push
   bun run dev
   ```

## Script Database (Drizzle Kit)

Tersedia di `news/package.json`:

| Script | Perintah | Fungsi |
| --- | --- | --- |
| `db:generate` | `drizzle-kit generate` | Membuat file migrasi SQL |
| `db:migrate` | `drizzle-kit migrate` | Menjalankan migrasi ke database |
| `db:push` | `drizzle-kit push` | Sinkronisasi langsung skema ke PostgreSQL |
| `db:pull` | `drizzle-kit pull` | Introspect skema dari database yang ada |
| `db:studio` | `drizzle-kit studio` | Membuka Drizzle Studio |
| `db:check` | `drizzle-kit check` | Validasi konsistensi skema & migrasi |
