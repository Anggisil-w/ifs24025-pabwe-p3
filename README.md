# DompetLink — PABWE P3

Aplikasi single-page untuk latihan DOM, event, validasi, logika aplikasi, dan `localStorage`.

## Struktur

```text
Anggisil-w-pabwe-p3/
├── index.html
├── README.md
└── assets/
    └── script.js
```

Tidak menggunakan `style.css`. Styling dilakukan menggunakan Tailwind CSS CDN dan sedikit `<style>` langsung di `index.html`.

## Fitur

### 1. Expense Tracker
- Judul
- Kategori
- Jumlah
- Tipe Pemasukan/Pengeluaran
- Tanggal
- Ringkasan pemasukan, pengeluaran, saldo
- Search, filter, dan sort
- CRUD
- Modal tambah/ubah
- Konfirmasi hapus
- `localStorage`

### 2. Bookmark Manager
- Judul
- URL
- Kategori
- Catatan opsional
- Validasi `http://` / `https://`
- Buka link pada tab baru dengan `target="_blank"` dan `rel="noopener noreferrer"`
- Search dan sort
- CRUD + modal
- `localStorage` dengan key berbeda dari Expense Tracker

### 3. Quiz App
- 5 soal dalam array of object
- Mulai → jawab → feedback → skor akhir → ulangi
- High score menggunakan `localStorage`

## Tab

Tab menggunakan query string:

```text
index.html?tab=expense
index.html?tab=bookmark
index.html?tab=quiz
```

Tab aktif tidak disimpan di `localStorage`.

## Cara menjalankan

Buka `index.html` langsung di browser atau gunakan Live Server pada VS Code.

Internet diperlukan agar Tailwind CDN, Google Fonts, dan Tabler Icons dapat dimuat.

## Performance notes

- Google Fonts is loaded non-blocking with `preload` + `noscript` fallback.
- Application JavaScript and Tabler Icons are deferred where applicable.
- A small critical CSS block is inline so the first paint does not depend on the web font.
- Tailwind CDN is intentionally retained because it is part of the project requirement. Lighthouse may still report Tailwind CDN as render-blocking/unused JavaScript; removing it would violate that requirement.
- Netlify HUD cache warnings are deployment/platform resources rather than application assets.
